import { useState } from 'react'
import { Eye, EyeOff, Loader2, Wallet, Zap, PieChart, Target } from 'lucide-react'
import db, { demoMode } from '../lib/db'

const friendly = (m = '') => /invalid login/i.test(m) ? 'Email or password is incorrect.' : /already registered/i.test(m) ? 'This email already has an account. Try signing in.' : /rate|too many/i.test(m) ? 'Too many attempts. Wait a minute and try again.' : m || 'Something went wrong. Try again.'

export default function Login() {
  const [mode, setMode] = useState('in'), [email, setEmail] = useState(''), [pw, setPw] = useState('')
  const [show, setShow] = useState(false), [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), [errs, setErrs] = useState({})

  const submit = async (e) => {
    e.preventDefault(); setMsg('')
    const er = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email address.'
    if (pw.length < 6) er.pw = 'Use at least 6 characters.'
    setErrs(er); if (Object.keys(er).length) return
    setBusy(true)
    try { const r = await db.signIn(mode, email, pw); if (r === 'check-email') setMsg('Check your email to confirm your account, then sign in.') }
    catch (x) { setMsg(friendly(x.message)) } finally { setBusy(false) }
  }
  const forgot = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErrs({ email: 'Enter your email first.' })
    try { await db.reset(email); setMsg('Password reset link sent. Check your email.') } catch (x) { setMsg(friendly(x.message)) }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white bg-gradient-to-br from-navy-900 to-navy-700">
        <div className="flex items-center gap-2 text-xl font-extrabold"><Wallet /> Salary <span className="text-[#55d59b]">vs</span> Expenses</div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">See where your salary goes, every day.</h1>
          <ul className="mt-8 space-y-4 text-[#d1deef]">
            <li className="flex gap-3"><Zap className="text-[#55d59b]" /> Add an expense in 3 taps</li>
            <li className="flex gap-3"><PieChart className="text-[#55d59b]" /> Spot your biggest categories</li>
            <li className="flex gap-3"><Target className="text-[#55d59b]" /> Track your monthly savings goal</li>
          </ul>
        </div>
        <div className="max-w-xs rounded-2xl bg-white/10 p-4 border border-white/20">
          <div className="text-sm text-[#d1deef]">Left this month</div>
          <div className="text-3xl font-extrabold">₹18,450</div>
          <div className="mt-2 h-2 rounded bg-white/20"><div className="h-2 w-2/3 rounded bg-[#55d59b]" /></div>
        </div>
      </div>
      <div className="lg:flex lg:items-center lg:justify-center">
        <div className="lg:hidden h-24 bg-gradient-to-br from-navy-900 to-navy-700 text-white flex items-center px-6 font-extrabold text-lg gap-2"><Wallet /> Salary vs Expenses</div>
        <form onSubmit={submit} noValidate className="card lg:border-0 lg:shadow-none lg:bg-transparent w-full max-w-[400px] mx-auto -mt-6 lg:mt-0 p-6 space-y-4 relative">
          <h2 className="text-2xl font-extrabold">{mode === 'in' ? 'Welcome back' : 'Create your account'}</h2>
          <div>
            <label htmlFor="email" className="text-sm font-semibold">Email</label>
            <input id="email" type="email" autoComplete="email" className="field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} />
            {errs.email && <p className="text-sm text-brand-red mt-1">{errs.email}</p>}
          </div>
          <div>
            <label htmlFor="pw" className="text-sm font-semibold">Password</label>
            <div className="relative mt-1">
              <input id="pw" type={show ? 'text' : 'password'} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} className="field pr-12" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!errs.pw} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-0 top-0 h-11 w-11 grid place-content-center text-[#71809a]">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {errs.pw && <p className="text-sm text-brand-red mt-1">{errs.pw}</p>}
          </div>
          {mode === 'in' && <button type="button" onClick={forgot} className="text-sm text-brand-blue font-semibold">Forgot password?</button>}
          {msg && <p role="alert" className="text-sm rounded-lg bg-[#fff1f3] text-brand-red p-3">{msg}</p>}
          <button className="btn w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" size={18} />}{mode === 'in' ? 'Sign in' : 'Create account'}</button>
          {!demoMode && <button type="button" onClick={db.google} className="btn w-full !bg-white !text-[#1d3150] border border-[#dfe7f1]">Continue with Google</button>}
          {demoMode && <button type="button" onClick={() => db.signIn()} className="btn w-full !bg-[#19a66a]">Continue to demo</button>}
          <p className="text-sm text-center text-[#71809a]">{mode === 'in' ? 'New here?' : 'Already have an account?'}{' '}
            <button type="button" className="font-bold text-brand-blue" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(''); setErrs({}) }}>{mode === 'in' ? 'Create account' : 'Sign in'}</button></p>
        </form>
      </div>
    </div>
  )
}
