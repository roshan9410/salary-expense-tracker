const KEY = 'expense-theme'
export const getTheme = () => { const saved = localStorage.getItem(KEY); return saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') }
export const setTheme = (theme) => localStorage.setItem(KEY, theme)
