import { useEffect, useState } from 'react'
import { CATEGORIES } from '../lib/categories'
import { toPaise, dateStr, daysAgo } from '../lib/format'

export default function AddSheet({ onClose, onSave, counts, initial }) {
  const sorted = [...CATEGORIES].sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0))
  const [amount, setAmount] = useState(initial ? String(initial.amount_paise / 100) : ''), [cat, setCat] = useState(initial?.category || localStorage.getItem('last-cat') || sorted[0].key)
  const [date, setDate] = useState(initial?.spent_on || dateStr()), [note, setNote] = useState(initial?.note || ''), [more, setMore] = useState(!!initial), [noteOpen, setNoteOpen] = useState(!!initial?.note)
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    const p = toPaise(amount)
    if (!Number.isFinite(p) || p <= 0) return setErr('Enter an amount above 0.')
    setBusy(true); localStorage.setItem('last-cat', cat)
    try { await onSave({ category: cat, amount_paise: p, note: note.trim() || null, spent_on: date }) } catch (x) { setErr(x.message); setBusy(false) }
  }
  const shown = more ? sorted : sorted.slice(0, 5)
  const chip = (on) => `min-h-[44px] px-3 rounded-full border text-sm font-semibold ${on ? 'bg-[#19365f] text-white border-[#19365f]' : 'bg-white border-[#dfe7f1]'}`

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form role="dialog" aria-modal="true" aria-label={initial ? "Edit expense" : "Add expense"} onSubmit={submit} className="w-full md:max-w-md max-h-[92vh] overflow-auto bg-white rounded-t-3xl md:rounded-3xl p-5 space-y-4">
        <div>
          <label htmlFor="amt" className="text-sm font-semibold text-[#5b6c84]">Amount</label>
          <div className="flex items-center gap-2"><span className="text-3xl font-extrabold">₹</span>
            <input id="amt" autoFocus inputMode="decimal" autoComplete="off" placeholder="0" className="w-full text-4xl font-extrabold outline-none" value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d.]/g, '')); setErr('') }} /></div>
          {err && <p role="alert" className="text-sm text-brand-red">{err}</p>}
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
          {shown.map((c) => <button type="button" key={c.key} role="radio" aria-checked={cat === c.key} onClick={() => setCat(c.key)} className={chip(cat === c.key)}>{c.emoji} {c.label}</button>)}
          <button type="button" onClick={() => setMore(!more)} className={chip(false)}>{more ? 'Less' : 'More'}</button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" className={chip(date === dateStr())} onClick={() => setDate(dateStr())}>Today</button>
          <button type="button" className={chip(date === daysAgo(1))} onClick={() => setDate(daysAgo(1))}>Yesterday</button>
          <input type="date" aria-label="Date" max={dateStr()} className="field !w-auto" value={date} onChange={(e) => setDate(e.target.value || dateStr())} />
        </div>
        {noteOpen ? <input aria-label="Note" className="field" placeholder="Note (optional)" maxLength={80} value={note} onChange={(e) => setNote(e.target.value)} />
          : <button type="button" className="text-sm font-semibold text-brand-blue" onClick={() => setNoteOpen(true)}>+ Add a note</button>}
        <button className="btn w-full" disabled={busy}>{initial ? 'Save changes' : 'Save expense'}</button>
      </form>
    </div>
  )
}
