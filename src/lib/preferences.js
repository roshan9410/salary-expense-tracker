const KEY = 'expense-preferences'
const DEFAULTS = { defaultSalary: 3000000, defaultGoal: 1000000, warningThreshold: 70 }
export const getPreferences = () => { try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY)) || {}) } } catch { return DEFAULTS } }
export const savePreferences = (patch) => { const next = { ...getPreferences(), ...patch }; localStorage.setItem(KEY, JSON.stringify(next)); return next }
