import { createClient } from '@supabase/supabase-js'
import { shiftMonth } from './format'
import { getPreferences, savePreferences } from './preferences'

const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const sb = url && key ? createClient(url, key) : null
export const demoMode = !sb

const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const put = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const DEFAULTS = { salary: getPreferences().defaultSalary, goal: getPreferences().defaultGoal }
let listeners = []
const demoUser = () => (ls('demo-user', false) ? { id: 'demo', email: 'demo@example.com' } : null)

const pendingKey = 'expense-pending-queue'

const csvEscape = (v) => { const s = String(v ?? ''); return /[\",\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s }
const makeCsv = (rows) => { const head = ['id','category','amount_paise','note','spent_on','created_at']; return [head.join(','), ...rows.map(r => head.map(k => csvEscape(r[k])).join(','))].join('\n') }

const demo = {
  onAuth(cb) { listeners.push(cb); cb(demoUser()); return () => { listeners = listeners.filter((l) => l !== cb) } },
  async signIn() { put('demo-user', true); listeners.forEach((l) => l({ id: 'demo', email: 'demo@example.com' })) },
  async signOut() { put('demo-user', false); listeners.forEach((l) => l(null)) },
  async listTx(m) { return ls('tx', []).filter((t) => t.spent_on.startsWith(m)).sort((a, b) => b.spent_on.localeCompare(a.spent_on) || b.created_at.localeCompare(a.created_at)) },
  async addTx(t) { const row = { ...t, id: crypto.randomUUID(), created_at: new Date().toISOString() }; put('tx', [...ls('tx', []), row]); return row },
  async deleteTx(id) { put('tx', ls('tx', []).filter((t) => t.id !== id)) },
  async updateTx(id, patch) { put('tx', ls('tx', []).map((t) => (t.id === id ? { ...t, ...patch } : t))) },
  async getSettings(m) {
    const all = ls('settings', {}), prev = Object.keys(all).filter((k) => k <= m).sort().pop()
    return all[m] || (prev && all[prev]) || { salary: getPreferences().defaultSalary, goal: getPreferences().defaultGoal }
  },
  async saveSettings(m, s) { put('settings', { ...ls('settings', {}), [m]: s }) },
  async savePreferences(p) { savePreferences(p) },
  async exportAll() { return makeCsv(ls('tx', [])) },
  async deleteAll() { localStorage.removeItem('tx'); localStorage.removeItem('settings'); localStorage.removeItem(pendingKey) },
  async flushPending() { return 0 },
}

const cloud = {
  onAuth(cb) {
    sb.auth.getSession().then(({ data }) => cb(data.session?.user ?? null))
    const { data } = sb.auth.onAuthStateChange((_e, s) => cb(s?.user ?? null))
    return () => data.subscription.unsubscribe()
  },
  async signIn(mode, email, password) {
    const r = mode === 'up' ? await sb.auth.signUp({ email, password }) : await sb.auth.signInWithPassword({ email, password })
    if (r.error) throw r.error
    if (mode === 'up' && !r.data.session) return 'check-email'
  },
  google: () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
  async reset(email) { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }); if (error) throw error },
  signOut: () => sb.auth.signOut(),
  async listTx(m) {
    const { data, error } = await sb.from('transactions').select('*').gte('spent_on', m + '-01').lt('spent_on', shiftMonth(m, 1) + '-01')
      .order('spent_on', { ascending: false }).order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async addTx(t) {
    if (!navigator.onLine) { const q = ls(pendingKey, []); const row = { ...t, id: crypto.randomUUID(), created_at: new Date().toISOString() }; put(pendingKey, [...q, row]); return { ...row, queued: true }
    }
    const { data, error } = await sb.from('transactions').insert({ ...t, user_id: (await sb.auth.getUser()).data.user?.id }).select().single(); if (error) throw error; return data
  },
  async deleteTx(id) { const { error } = await sb.from('transactions').delete().eq('id', id); if (error) throw error },
  async updateTx(id, patch) { const { error } = await sb.from('transactions').update(patch).eq('id', id); if (error) throw error },
  async getSettings(m) {
    const { data, error } = await sb.from('month_settings').select('*').lte('month', m + '-01').order('month', { ascending: false }).limit(1)
    if (error) throw error
    return data[0] ? { salary: data[0].salary_paise, goal: data[0].savings_goal_paise } : { salary: getPreferences().defaultSalary, goal: getPreferences().defaultGoal }
  },
  async saveSettings(m, s) {
    const { data: u } = await sb.auth.getUser(); const { error } = await sb.from('month_settings').upsert({ user_id: u.user?.id, month: m + '-01', salary_paise: s.salary, savings_goal_paise: s.goal }, { onConflict: 'user_id,month' }); if (error) throw error
  },
  async savePreferences(p) { const { error } = await sb.auth.updateUser({ data: { default_salary_paise: p.defaultSalary, default_goal_paise: p.defaultGoal, warning_threshold: p.warningThreshold } }); if (error) throw error },
  async exportAll() { const { data, error } = await sb.from('transactions').select('*').order('spent_on', { ascending: true }); if (error) throw error; return makeCsv(data || []) },
  async deleteAll() { const { data: u } = await sb.auth.getUser(); if (!u.user) throw new Error('You are not signed in.'); const { error: e1 } = await sb.from('transactions').delete().eq('user_id', u.user.id); if (e1) throw e1; const { error: e2 } = await sb.from('month_settings').delete().eq('user_id', u.user.id); if (e2) throw e2 },
  async flushPending() {
    if (!navigator.onLine) return 0; const q = ls(pendingKey, []); if (!q.length) return 0; const { data: u } = await sb.auth.getUser(); if (!u.user) return 0;
    const rows = q.map(({ queued, ...r }) => ({ ...r, user_id: u.user.id })); const { error } = await sb.from('transactions').insert(rows); if (error) throw error; localStorage.removeItem(pendingKey); return rows.length
  },
}

export default sb ? { ...demo, ...cloud } : demo
export const pendingCount = () => ls(pendingKey, []).length
