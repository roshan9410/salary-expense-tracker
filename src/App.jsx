import { useCallback, useEffect, useState } from 'react'
import { Plus, LayoutDashboard, List, BarChart3, Settings as SettingsIcon, WifiOff } from 'lucide-react'
import db, { demoMode } from './lib/db'
import { monthKey, shiftMonth, monthLabel } from './lib/format'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import History from './components/History'
import Reports from './components/Reports'
import AddSheet from './components/AddSheet'
import Settings from './components/Settings'
import { getTheme, setTheme } from './lib/theme'
import { PageSkeleton, ErrorBox } from './components/Skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGES = [['dashboard', 'Dashboard', LayoutDashboard], ['history', 'History', List], ['reports', 'Reports', BarChart3], ['settings', 'Settings', SettingsIcon]]

export default function App() {
  const [user, setUser] = useState(undefined), [month, setMonth] = useState(monthKey()), [page, setPage] = useState('dashboard')
  const [hist, setHist] = useState(null), [err, setErr] = useState('')
  const [sheet, setSheet] = useState(null) // null | 'new' | transaction being edited
  const [toast, setToast] = useState(null)
  const [counts, setCounts] = useState(() => JSON.parse(localStorage.getItem('cat-counts') || '{}'))
  const [dark, setDark] = useState(() => getTheme() === 'dark')
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => db.onAuth(setUser), [])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); setTheme(dark ? 'dark' : 'light') }, [dark])
  const load = useCallback(async () => {
    if (!user) return
    try {
      setErr('')
      const months = [-5, -4, -3, -2, -1, 0].map((n) => shiftMonth(month, n))
      setHist(await Promise.all(months.map(async (m) => { const [txs, s] = await Promise.all([db.listTx(m), db.getSettings(m)]); return { month: m, txs, salary: s.salary, goal: s.goal } })))
    } catch (e) { setErr(e.message) }
  }, [user, month])
  useEffect(() => { const up = async () => { setOnline(true); try { const n = await db.flushPending?.(); if (n) { setToast({ msg: `${n} offline expense${n === 1 ? '' : 's'} synced` }); load() } } catch (e) { setErr(e.message) } }; const down = () => setOnline(false); addEventListener('online', up); addEventListener('offline', down); return () => { removeEventListener('online', up); removeEventListener('offline', down) } }, [load])
  useEffect(() => { setHist(null); load() }, [load])
  useEffect(() => {
    const k = (e) => { if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { e.preventDefault(); setSheet('new') } }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t) } }, [toast])

  if (user === undefined) return <div className="min-h-screen grid place-content-center text-[#71809a]">Loading…</div>
  if (!user) return <Login />

  const cur = hist?.[5], txs = cur?.txs || [], settings = { salary: cur?.salary || 0, goal: cur?.goal || 0 }
  const clean = (t) => ({ category: t.category, amount_paise: t.amount_paise, note: t.note, spent_on: t.spent_on })

  const save = async (tx) => {
    if (sheet && sheet !== 'new') { await db.updateTx(sheet.id, tx); setSheet(null); await load(); return setToast({ msg: 'Changes saved' }) }
    const row = await db.addTx(tx)
    if (row.queued) { setToast({ msg: 'Offline: expense kept here and will sync when you are back online.' }); return }
    const c = { ...counts, [tx.category]: (counts[tx.category] || 0) + 1 }; setCounts(c); localStorage.setItem('cat-counts', JSON.stringify(c))
    setSheet(null); await load()
    setToast({ msg: 'Expense saved', undo: async () => { await db.deleteTx(row.id); setToast(null); load() } })
  }
  const remove = async (t) => {
    await db.deleteTx(t.id); await load()
    setToast({ msg: 'Expense deleted', undo: async () => { await db.addTx(clean(t)); setToast(null); load() } })
  }
  const saveSettings = async (s) => { try { await db.saveSettings(month, s); load() } catch (e) { setErr(e.message) } }
  const nav = 'flex items-center gap-3 min-h-[44px] px-3 rounded-xl font-semibold w-full text-left'

  return (
    <div className="min-h-screen md:flex">
      {!online && <div role="status" className="fixed top-0 inset-x-0 z-[70] bg-[#8a6410] text-white text-center text-sm px-3 py-2 flex items-center justify-center gap-2"><WifiOff size={16}/> Offline — new expenses stay on this device until you reconnect.</div>}
      <aside className="hidden md:flex w-56 shrink-0 flex-col justify-between p-4 bg-navy-900 text-white sticky top-0 h-screen">
        <div className="space-y-2">
          <div className="px-3 py-4 text-lg font-extrabold">💰 Expenses</div>
          <button className="btn w-full !bg-brand-green" onClick={() => setSheet('new')}><Plus size={18} /> Add expense <kbd className="text-xs opacity-70">N</kbd></button>
          {PAGES.map(([k, l, I]) => <button key={k} onClick={() => setPage(k)} aria-current={page === k ? 'page' : undefined} className={nav + (page === k ? ' bg-white/10' : ' text-[#d1deef]')}><I size={18} /> {l}</button>)}
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-3 md:p-6 pb-28 md:pb-6 max-w-[1180px]">
        {demoMode && <div className="mb-3 rounded-xl bg-[#fff7e0] text-[#8a6410] text-sm px-3 py-2">Demo mode: data stays in this browser</div>}
        {err ? <ErrorBox msg={err} retry={load} /> : !hist ? <PageSkeleton /> : page === 'dashboard' ? (
          <Dashboard {...{ month, setMonth, txs, settings, hist }} onSettings={saveSettings} />
        ) : page === 'settings' ? (
          <Settings user={user} onSignOut={db.signOut} demoMode={demoMode} dark={dark} setDark={setDark} onError={setErr} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">{page === 'history' ? 'History' : 'Reports'}</h1>
              <div className="flex items-center"><button aria-label="Previous month" className="h-11 w-11 grid place-content-center" onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft /></button>
                <span className="font-semibold w-36 text-center">{monthLabel(month)}</span>
                <button aria-label="Next month" className="h-11 w-11 grid place-content-center" onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight /></button></div></div>
            {page === 'history' ? <History {...{ txs, month }} onEdit={setSheet} onDelete={remove} /> : <Reports {...{ txs, month }} />}
          </div>
        )}
      </main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-[#e5ebf3] grid grid-cols-4 z-30">
        {PAGES.map(([k, l, I]) => <button key={k} onClick={() => setPage(k)} aria-current={page === k ? 'page' : undefined} className={'flex flex-col items-center justify-center text-xs font-semibold ' + (page === k ? 'text-brand-blue' : 'text-[#71809a]')}><I size={20} />{l}</button>)}
      </nav>
      <button aria-label="Add expense" onClick={() => setSheet('new')} className="md:hidden fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full bg-brand-green text-white grid place-content-center shadow-lg"><Plus size={28} /></button>
      {sheet && <AddSheet key={sheet.id || 'new'} counts={counts} initial={sheet === 'new' ? null : sheet} onClose={() => setSheet(null)} onSave={save} />}
      {toast && <div role="status" className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 flex items-center gap-4 rounded-xl bg-[#142747] text-white px-4 py-3 shadow-lg">{toast.msg}{toast.undo && <button className="font-bold text-[#55d59b] min-h-[44px]" onClick={toast.undo}>Undo</button>}</div>}
    </div>
  )
}
