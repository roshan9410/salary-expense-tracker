import { CAT } from '../lib/categories'
import { money } from '../lib/format'

export default function Reports({ txs, month }) {
  const total = txs.reduce((s, t) => s + t.amount_paise, 0)
  const by = Object.entries(txs.reduce((m, t) => ((m[t.category] = (m[t.category] || 0) + t.amount_paise), m), {})).sort((a, b) => b[1] - a[1])
  const [y, mo] = month.split('-').map(Number), dim = new Date(y, mo, 0).getDate()
  const daily = Array.from({ length: dim }, (_, i) => txs.filter((t) => +t.spent_on.slice(8) === i + 1).reduce((s, t) => s + t.amount_paise, 0))
  const max = Math.max(...daily, 1)
  if (!txs.length) return <div className="card p-10 text-center text-[#71809a]">No expenses this month, so there is nothing to report yet.</div>
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="card p-5"><h2 className="font-bold mb-4">Categories, biggest first</h2>
        <ul className="space-y-3">{by.map(([k, v]) => (<li key={k}>
          <div className="flex justify-between text-sm mb-1"><span>{CAT[k]?.emoji} {CAT[k]?.label || k}</span><span><b>{money(v)}</b> <span className="text-[#71809a]">{Math.round((v / total) * 100)}%</span></span></div>
          <div className="h-2 rounded bg-[#edf1f6]"><div className="h-2 rounded" style={{ width: (v / total) * 100 + '%', background: CAT[k]?.color }} /></div></li>))}</ul></section>
      <section className="card p-5"><h2 className="font-bold mb-4">Spending by day</h2>
        <div className="h-52 flex items-end gap-[2px] border-b border-[#e5ebf3]" role="img" aria-label="Daily spending bar chart">
          {daily.map((v, i) => <div key={i} title={`${i + 1}: ${money(v)}`} className="flex-1 rounded-t bg-gradient-to-t from-[#e94b60] to-[#ff8995]" style={{ height: Math.max(v ? 3 : 0, (v / max) * 100) + '%' }} />)}</div>
        <div className="flex justify-between text-xs text-[#71809a] mt-1"><span>1</span><span>{Math.ceil(dim / 2)}</span><span>{dim}</span></div>
        <p className="text-sm text-[#5b6c84] mt-3">Highest day: <b>{money(max)}</b> on day {daily.indexOf(max) + 1}</p></section>
    </div>
  )
}
