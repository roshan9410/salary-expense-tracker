import { useState } from 'react'
import { ChevronLeft, ChevronRight, Wallet, Receipt, PiggyBank, Target } from 'lucide-react'
import { CAT } from '../lib/categories'
import { money, toPaise, monthLabel, shiftMonth, dayLabel } from '../lib/format'
import { getInsights } from '../lib/insights'
import { getPreferences } from '../lib/preferences'

const compact = (p) => { const n = p / 100; return n >= 100000 ? '₹' + (n / 100000).toFixed(1) + 'L' : n >= 1000 ? '₹' + (n / 1000).toFixed(1) + 'k' : '₹' + Math.round(n) }
const TONE = { bad: 'text-brand-red', warn: 'text-[#b7791f]', good: 'text-brand-green', info: 'text-[#4d4770]' }

function Money({ label, icon: I, value, onCommit, children }) {
  const [v, setV] = useState(null)
  return (
    <div className="card p-4 min-h-[120px]">
      <div className="flex justify-between font-semibold text-[#5b6c84]">{label}<I size={20} /></div>
      {onCommit ? (
        <input aria-label={label} inputMode="decimal" className="mt-2 w-full text-2xl font-extrabold bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
          value={v ?? String(value / 100)} onChange={(e) => setV(e.target.value.replace(/[^\d.]/g, ''))}
          onBlur={() => { const p = toPaise(v); if (v !== null && Number.isFinite(p) && p >= 0) onCommit(p); setV(null) }} />
      ) : <div className="mt-2 text-2xl font-extrabold">{money(value)}</div>}
      {children}
    </div>
  )
}

export default function Dashboard({ month, setMonth, txs, settings, onSettings, hist }) {
  const total = txs.reduce((s, t) => s + t.amount_paise, 0), left = settings.salary - total
  const pct = (a, b) => (b ? Math.max(0, Math.min(100, (a / b) * 100)) : 0)
  const by = {}; txs.forEach((t) => (by[t.category] = (by[t.category] || 0) + t.amount_paise))
  const cats = Object.entries(by).sort((a, b) => b[1] - a[1])
  const tips = getInsights({ month, txs, prevTxs: hist[hist.length - 2]?.txs || [], salary: settings.salary, goal: settings.goal, warningThreshold: getPreferences().warningThreshold })
  const bars = hist.map((h) => ({ m: h.month, inc: h.salary, out: h.txs.reduce((a, t) => a + t.amount_paise, 0) })), top = Math.max(...bars.flatMap((b) => [b.inc, b.out]), 1) * 1.15
  let cur = 0
  const stops = cats.map(([k, v]) => { const p = (v / total) * 100, s = `${CAT[k]?.color || '#b6c1d0'} ${cur}% ${cur + p}%`; cur += p; return s })

  return (
    <div className="space-y-4">
      <header className="rounded-2xl p-5 text-white bg-gradient-to-r from-navy-900 to-navy-700 flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-extrabold tracking-tight">Salary <span className="text-[#55d59b]">vs</span> Expenses</h1>
        <div className="flex items-center gap-1">
          <button aria-label="Previous month" className="h-11 w-11 grid place-content-center" onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft /></button>
          <span className="font-semibold w-36 text-center">{monthLabel(month)}</span>
          <button aria-label="Next month" className="h-11 w-11 grid place-content-center" onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight /></button>
        </div>
      </header>
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Money label="Salary" icon={Wallet} value={settings.salary} onCommit={(p) => onSettings({ ...settings, salary: p })}><p className="text-xs text-[#71809a]">Monthly take-home</p></Money>
        <Money label="Expenses" icon={Receipt} value={total}><p className="text-xs text-[#71809a]">{pct(total, settings.salary).toFixed(1)}% of salary</p></Money>
        <Money label="Leftover" icon={PiggyBank} value={left}><p className="text-xs text-[#71809a]">{left < 0 ? 'Over salary' : 'Remaining'}</p></Money>
        <Money label="Savings goal" icon={Target} value={settings.goal} onCommit={(p) => onSettings({ ...settings, goal: p })}>
          <div className="h-2 rounded bg-[#edf1f6] overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-blue to-brand-purple" style={{ width: pct(left, settings.goal) + '%' }} /></div>
          <p className="text-xs text-[#71809a] mt-1">{pct(left, settings.goal).toFixed(0)}% covered</p>
        </Money>
      </section>
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold">Income vs expenses, last 6 months</h2>
          <div className="flex gap-4 text-xs text-[#60718a] my-2"><span><i className="inline-block w-2 h-2 rounded-full bg-brand-green mr-1" />Income</span><span><i className="inline-block w-2 h-2 rounded-full bg-brand-red mr-1" />Expenses</span></div>
          <div className="h-52 flex items-end gap-2 sm:gap-3 pb-6 border-b border-[#e5ebf3]" role="img" aria-label="Income versus expenses for the last 6 months">
            {bars.map((b) => (<div key={b.m} className="relative flex-1 h-full flex items-end justify-center gap-1">
              <div className="w-[34%] min-w-[9px] rounded-t-md bg-gradient-to-b from-[#4bc98c] to-[#16975c] relative" style={{ height: Math.max(2, (b.inc / top) * 100) + '%' }}><small className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap">{compact(b.inc)}</small></div>
              <div className="w-[34%] min-w-[9px] rounded-t-md bg-gradient-to-b from-[#ff8995] to-[#e94b60] relative" style={{ height: Math.max(2, (b.out / top) * 100) + '%' }}><small className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap">{compact(b.out)}</small></div>
              <span className="absolute -bottom-6 text-[11px] text-[#71809a]">{new Date(b.m + '-01T00:00').toLocaleDateString('en-IN', { month: 'short' })}</span></div>))}
          </div>
        </div>
        <div className="card p-5 bg-[#f6f1ff] border-[#e9defc]"><h2 className="font-bold mb-2">Money insights</h2>
          {tips.length ? <ul className="space-y-3 text-sm">{tips.map((t, i) => <li key={i} className={TONE[t.tone]}>{t.text}</li>)}</ul> : <p className="text-sm text-[#4d4770]">Add expenses to see insights.</p>}</div>
      </section>
      <section className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-bold mb-4">Where it went</h2>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-40 shrink-0 aspect-square rounded-full" style={{ background: total ? `conic-gradient(${stops.join(',')})` : '#e8edf4' }}>
              <div className="absolute inset-[27%] rounded-full bg-white grid place-content-center text-center text-[11px] text-[#71809a]">Total<b className="text-sm text-[#1d3150]">{money(total)}</b></div>
            </div>
            <ul className="w-full space-y-2 text-sm">
              {cats.length ? cats.slice(0, 8).map(([k, v]) => <li key={k} className="flex justify-between gap-2"><span className="truncate"><i className="inline-block w-2.5 h-2.5 rounded mr-2" style={{ background: CAT[k]?.color }} />{CAT[k]?.label || k}</span><b>{Math.round((v / total) * 100)}%</b></li>) : <li className="text-[#71809a]">Add an expense to see categories.</li>}
            </ul>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-bold mb-2">Latest expenses</h2>
          {txs.length ? <ul className="divide-y divide-[#edf1f6]">{txs.slice(0, 10).map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2.5">
              <span className="text-xl" aria-hidden>{CAT[t.category]?.emoji}</span>
              <div className="min-w-0 flex-1"><div className="font-semibold truncate">{t.note || CAT[t.category]?.label}</div><div className="text-xs text-[#71809a]">{CAT[t.category]?.label} · {dayLabel(t.spent_on)}</div></div>
              <b>{money(t.amount_paise)}</b></li>))}</ul>
            : <p className="py-8 text-center text-[#71809a]">No expenses this month. Tap + to add one.</p>}
        </div>
      </section>
    </div>
  )
}
