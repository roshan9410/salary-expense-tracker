import { CAT } from './categories'
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
export function downloadCsv(txs, month) {
  const rows = [['Date', 'Category', 'Note', 'Amount (INR)'], ...txs.map((t) => [t.spent_on, CAT[t.category]?.label || t.category, t.note, (t.amount_paise / 100).toFixed(2)])]
  const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map((r) => r.map(q).join(',')).join('\n')], { type: 'text/csv' }))
  Object.assign(document.createElement('a'), { href: url, download: `expenses-${month}.csv` }).click()
  URL.revokeObjectURL(url)
}
