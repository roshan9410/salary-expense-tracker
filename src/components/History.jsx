import { useMemo, useState } from 'react'
import { Pencil, Trash2, Download, Search } from 'lucide-react'
import { CAT, CATEGORIES } from '../lib/categories'
import { money, dayLabel, dateStr, daysAgo } from '../lib/format'
import { downloadCsv } from '../lib/csv'

const nice = (s) => (s === dateStr() ? 'Today' : s === daysAgo(1) ? 'Yesterday' : dayLabel(s))
const IconBtn = ({ label, onClick, children }) => <button aria-label={label} onClick={onClick} className="h-11 w-11 grid place-content-center rounded-lg text-[#71809a] hover:bg-[#edf2f8]">{children}</button>

export default function History({ txs, month, onEdit, onDelete }) {
  const [q, setQ] = useState(''), [cat, setCat] = useState('')
  const list = useMemo(() => txs.filter((t) => (!cat || t.category === cat) && (`${t.note || ''} ${CAT[t.category]?.label}`).toLowerCase().includes(q.trim().toLowerCase())), [txs, q, cat])
  const total = list.reduce((s, t) => s + t.amount_paise, 0)
  const groups = list.reduce((g, t) => ((g[t.spent_on] ||= []).push(t), g), {})
  const Actions = ({ t }) => <><IconBtn label="Edit expense" onClick={() => onEdit(t)}><Pencil size={17} /></IconBtn><IconBtn label="Delete expense" onClick={() => onDelete(t)}><Trash2 size={17} /></IconBtn></>

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]"><Search size={16} className="absolute left-3 top-3.5 text-[#71809a]" />
          <input aria-label="Search expenses" placeholder="Search note or category" className="field pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select aria-label="Filter by category" className="field !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}</select>
        <button className="btn !bg-[#edf2f8] !text-[#405775]" disabled={!txs.length} onClick={() => downloadCsv(list, month)}><Download size={16} /> Export CSV</button>
      </div>
      <div className="flex justify-between px-1 text-sm text-[#5b6c84]"><span>{list.length} expense{list.length === 1 ? '' : 's'}</span><b>Total {money(total)}</b></div>
      {!list.length ? <div className="card p-10 text-center text-[#71809a]">{txs.length ? 'No expenses match your search.' : 'No expenses this month. Tap + to add one.'}</div> : (<>
        <div className="md:hidden space-y-4">{Object.entries(groups).map(([day, items]) => (
          <section key={day}><h2 className="text-sm font-bold text-[#5b6c84] mb-2">{nice(day)}</h2>
            <ul className="card divide-y divide-[#edf1f6]">{items.map((t) => (
              <li key={t.id} className="flex items-center gap-2 pl-4 pr-1 py-1">
                <span aria-hidden className="text-xl">{CAT[t.category]?.emoji}</span>
                <div className="min-w-0 flex-1"><div className="font-semibold truncate">{t.note || CAT[t.category]?.label}</div><div className="text-xs text-[#71809a]">{CAT[t.category]?.label}</div></div>
                <b className="mr-1">{money(t.amount_paise)}</b><Actions t={t} /></li>))}</ul></section>))}</div>
        <div className="hidden md:block card overflow-hidden"><table className="w-full text-sm">
          <thead className="bg-[#f7f9fc] text-left text-xs text-[#71809a]"><tr><th className="p-3">Date</th><th className="p-3">Category</th><th className="p-3">Note</th><th className="p-3 text-right">Amount</th><th className="w-24" /></tr></thead>
          <tbody>{list.map((t) => (<tr key={t.id} className="border-t border-[#edf1f6]">
            <td className="p-3">{nice(t.spent_on)}</td><td className="p-3">{CAT[t.category]?.emoji} {CAT[t.category]?.label}</td><td className="p-3 text-[#5b6c84]">{t.note}</td>
            <td className="p-3 text-right font-bold">{money(t.amount_paise)}</td><td className="pr-2"><div className="flex justify-end"><Actions t={t} /></div></td></tr>))}</tbody></table></div></>)}
    </div>
  )
}
