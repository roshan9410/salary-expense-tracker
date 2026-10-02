import { useEffect, useState } from 'react'
import { Download, LogOut, Moon, Sun, Trash2, User, ShieldAlert } from 'lucide-react'
import db from '../lib/db'
import { toPaise } from '../lib/format'
import { getPreferences, savePreferences } from '../lib/preferences'

export default function Settings({ user, onSignOut, dark, setDark, onError }) {
  const [prefs, setPrefs] = useState(getPreferences())
  const [profile, setProfile] = useState(user?.email || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirm, setConfirm] = useState(false)
  useEffect(() => setProfile(user?.email || ''), [user])

  const save = async () => {
    setBusy(true); setMsg('')
    try {
      const salary = toPaise(prefs.defaultSalary)
      const goal = toPaise(prefs.defaultGoal)
      const threshold = Number(prefs.warningThreshold)
      if (!Number.isFinite(salary) || salary < 0 || !Number.isFinite(goal) || goal < 0 || threshold < 1 || threshold > 100) throw new Error('Please enter valid settings.')
      const next = savePreferences({ defaultSalary: salary, defaultGoal: goal, warningThreshold: threshold })
      if (db.savePreferences) await db.savePreferences(next)
      setPrefs(next); setMsg('Settings saved.')
    } catch (e) { setMsg(e.message); onError?.(e.message) } finally { setBusy(false) }
  }
  const exportAll = async () => { try { const csv = await db.exportAll(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'salary-vs-expenses-all-data.csv'; a.click(); URL.revokeObjectURL(a.href) } catch (e) { onError?.(e.message) } }
  const deleteAll = async () => {
    if (!confirm) return setConfirm(true)
    setBusy(true)
    try { await db.deleteAll(); setConfirm(false); setMsg('All your expense data has been deleted.'); window.location.reload() }
    catch (e) { setMsg(e.message); onError?.(e.message) } finally { setBusy(false) }
  }
  return <div className="space-y-4 max-w-3xl">
    <div><h1 className="text-2xl font-extrabold">Settings</h1><p className="text-sm muted mt-1">Manage your profile, defaults, appearance and data.</p></div>
    <section className="card p-5 space-y-4" aria-labelledby="profile-heading">
      <h2 id="profile-heading" className="font-bold flex items-center gap-2"><User size={18}/> Profile</h2>
      <label className="block text-sm font-semibold" htmlFor="profile-email">Email</label>
      <input id="profile-email" className="field" value={profile} readOnly aria-readonly="true" />
      <button className="btn w-fit" onClick={onSignOut}><LogOut size={17}/> Sign out</button>
    </section>
    <section className="card p-5 space-y-4">
      <h2 className="font-bold">Monthly defaults</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm font-semibold">Default salary<input className="field mt-1" inputMode="decimal" value={prefs.defaultSalary / 100} onChange={e => setPrefs({ ...prefs, defaultSalary: e.target.value })} /></label>
        <label className="text-sm font-semibold">Default savings goal<input className="field mt-1" inputMode="decimal" value={prefs.defaultGoal / 100} onChange={e => setPrefs({ ...prefs, defaultGoal: e.target.value })} /></label>
      </div>
      <label className="block text-sm font-semibold">Expense warning threshold: {prefs.warningThreshold}%<input type="range" min="1" max="100" value={prefs.warningThreshold} onChange={e => setPrefs({ ...prefs, warningThreshold: Number(e.target.value) })} className="w-full mt-2" aria-label="Expense warning threshold" /></label>
      <p className="text-xs muted">Warnings appear when recorded expenses reach this percentage of salary.</p>
      <button className="btn w-fit" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </section>
    <section className="card p-5 space-y-4">
      <h2 className="font-bold">Appearance</h2>
      <div className="flex items-center justify-between gap-3"><div><b>Dark mode</b><p className="text-sm muted">Saved on this device. System preference is used initially.</p></div><button className="btn" aria-pressed={dark} onClick={() => setDark(!dark)}>{dark ? <Sun size={17}/> : <Moon size={17}/>} {dark ? 'Light' : 'Dark'}</button></div>
    </section>
    <section className="card p-5 space-y-3">
      <h2 className="font-bold flex items-center gap-2"><Download size={18}/> Your data</h2>
      <button className="btn w-fit" onClick={exportAll}><Download size={17}/> Export all data CSV</button>
      <div className="border-t border-[var(--line)] pt-4"><h3 className="font-bold text-brand-red flex items-center gap-2"><ShieldAlert size={17}/> Delete all data</h3><p className="text-sm muted my-2">Permanently deletes all transactions and monthly settings for this account.</p><button className="btn !bg-brand-red" onClick={deleteAll} disabled={busy}><Trash2 size={17}/> {confirm ? 'Click again to permanently delete' : 'Delete all my data'}</button></div>
    </section>
  </div>
}
