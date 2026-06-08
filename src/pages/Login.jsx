import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../auth.jsx'
import { useI18n } from '../i18n.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { t } = useI18n()
  const { login, register } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [fields, setFields] = useState({})   // erreurs par champ
  const [error, setError] = useState('')     // erreur globale
  const [busy, setBusy] = useState(false)

  const isLogin = mode === 'login'
  const dest = loc.state?.from || '/account'
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Validation côté client (le backend revalide de toute façon).
  function clientValidate() {
    const f = {}
    if (!isLogin && form.name.trim().length < 2) f.name = t('auth.name')
    if (!EMAIL_RE.test(form.email)) f.email = t('auth.email')
    if (form.password.length < (isLogin ? 1 : 8)) f.password = t('auth.password')
    setFields(f)
    return Object.keys(f).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!clientValidate()) return
    setBusy(true)
    try {
      if (isLogin) await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
      nav(dest, { replace: true })
    } catch (err) {
      if (err.fields) setFields(err.fields)
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function switchMode(m) {
    setMode(m); setError(''); setFields({})
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card reveal">
        <h2>{isLogin ? t('auth.welcome') : t('auth.create')}</h2>
        <p className="sub">{isLogin ? t('auth.sub.login') : t('auth.sub.signup')}</p>

        <div className="auth-tabs">
          <button className={isLogin ? 'on' : ''} onClick={() => switchMode('login')}>{t('auth.login')}</button>
          <button className={!isLogin ? 'on' : ''} onClick={() => switchMode('signup')}>{t('auth.signup')}</button>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={onSubmit} noValidate>
          {!isLogin && (
            <div className="field">
              <label htmlFor="name">{t('auth.name')}</label>
              <input id="name" type="text" value={form.name} onChange={set('name')}
                     autoComplete="name" aria-invalid={!!fields.name} />
              {fields.name && <span className="field-err">{fields.name}</span>}
            </div>
          )}
          <div className="field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" value={form.email} onChange={set('email')}
                   autoComplete="email" aria-invalid={!!fields.email} />
            {fields.email && <span className="field-err">{fields.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="pwd">{t('auth.password')}</label>
            <input id="pwd" type="password" value={form.password} onChange={set('password')}
                   autoComplete={isLogin ? 'current-password' : 'new-password'} aria-invalid={!!fields.password} />
            {fields.password && <span className="field-err">{fields.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={busy}>
            {busy && <Loader2 size={16} className="spin" />}
            {busy ? t('auth.loading') : (isLogin ? t('auth.submit.login') : t('auth.submit.signup'))}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? t('auth.no') : t('auth.have')}{' '}
          <Link to="#" onClick={(e) => { e.preventDefault(); switchMode(isLogin ? 'signup' : 'login') }}>
            {isLogin ? t('auth.signup') : t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
