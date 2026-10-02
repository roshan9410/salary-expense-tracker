const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
export const money = (paise) => inr.format((paise || 0) / 100)
export const toPaise = (v) => Math.round(parseFloat(v) * 100)
const pad = (n) => String(n).padStart(2, '0')
export const dateStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return dateStr(d) }
export const monthKey = (d = new Date()) => dateStr(d).slice(0, 7)
export const shiftMonth = (m, n) => { const [y, mo] = m.split('-').map(Number); return monthKey(new Date(y, mo - 1 + n, 1)) }
export const monthLabel = (m) => new Date(m + '-01T00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
export const dayLabel = (s) => new Date(s + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
