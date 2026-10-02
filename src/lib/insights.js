import { CAT } from './categories'
import { money, monthKey } from './format'

const sumBy = (txs) => txs.reduce((m, t) => ((m[t.category] = (m[t.category] || 0) + t.amount_paise), m), {})

export function getInsights({ month, txs, prevTxs, salary, goal, warningThreshold = 70 }) {
  if (!txs.length) return []
  const total = txs.reduce((s, t) => s + t.amount_paise, 0), left = salary - total, out = []
  const by = Object.entries(sumBy(txs)).sort((a, b) => b[1] - a[1]), [topKey, topAmt] = by[0], name = CAT[topKey]?.label || topKey
  if (left < 0) out.push({ tone: 'bad', text: `Spending is ${money(-left)} over your salary.` })
  else if (salary && total / salary > warningThreshold / 100) out.push({ tone: 'warn', text: `You've spent ${Math.round((total / salary) * 100)}% of your salary. Review flexible costs.` })
  if (goal) out.push(left >= goal ? { tone: 'good', text: 'Your savings goal is covered this month.' } : { tone: 'warn', text: `${money(goal - Math.max(0, left))} more to keep aside to reach your goal.` })
  if (month === monthKey()) {
    const now = new Date(), d = now.getDate(), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    out.push({ tone: 'info', text: `At this pace you'll spend about ${money(Math.round((total / d) * dim))} by month end.` })
  }
  const prev = sumBy(prevTxs)[topKey]
  if (prev) { const ch = Math.round(((topAmt - prev) / prev) * 100); out.push({ tone: 'info', text: `${name} is ${ch >= 0 ? 'up' : 'down'} ${Math.abs(ch)}% vs last month.` }) }
  out.push({ tone: 'info', text: `Biggest category: ${name} (${money(topAmt)}).` })
  return out.slice(0, 4)
}
