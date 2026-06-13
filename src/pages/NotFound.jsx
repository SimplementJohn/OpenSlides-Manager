import { Link } from 'react-router-dom'
import { useI18n } from '../i18n.jsx'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <div className="container page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--muted-2)', lineHeight: 1 }}>404</h1>
      <p style={{ color: 'var(--muted)', margin: '1rem 0 2rem' }}>{t('notfound.msg')}</p>
      <Link to="/tools" className="btn btn-primary">{t('notfound.cta')}</Link>
    </div>
  )
}
