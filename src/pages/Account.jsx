import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mail, Calendar } from 'lucide-react'
import { useAuth } from '../auth.jsx'
import { useI18n } from '../i18n.jsx'

export default function Account() {
  const { t, lang } = useI18n()
  const { user, logout } = useAuth()
  const nav = useNavigate()

  if (!user) return null

  const since = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="container page" style={{ maxWidth: 720 }}>
      <div className="page-head reveal">
        <h1>{t('auth.account')}</h1>
        <p>{t('auth.account.sub')}</p>
      </div>

      <div className="card">
        <div className="acc-row"><span className="acc-ico"><User size={18} /></span><div><span className="acc-k">{t('auth.name')}</span><span className="acc-v">{user.name}</span></div></div>
        <div className="acc-row"><span className="acc-ico"><Mail size={18} /></span><div><span className="acc-k">{t('auth.email')}</span><span className="acc-v">{user.email}</span></div></div>
        <div className="acc-row"><span className="acc-ico"><Calendar size={18} /></span><div><span className="acc-k">{t('auth.member.since')}</span><span className="acc-v">{since}</span></div></div>

        <button className="btn btn-ghost" style={{ marginTop: 20 }}
          onClick={async () => { await logout(); nav('/') }}>
          <LogOut size={18} /> {t('auth.logout')}
        </button>
      </div>
    </div>
  )
}
