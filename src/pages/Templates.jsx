import { Link } from 'react-router-dom'
import { Scissors, Film, ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n.jsx'

export default function Templates() {
  const { t } = useI18n()
  const TOOLS = [
    { to: '/bgremover', icon: <Scissors size={28} />, c1: '#6366f1', c2: '#8b5cf6', k: 'bg' },
    { to: '/loadingslides', icon: <Film size={28} />, c1: '#0ea5e9', c2: '#2563eb', k: 'slides' },
  ]

  return (
    <div className="container page">
      <div className="page-head reveal">
        <h1>{t('tools.title')}</h1>
        <p>{t('tools.sub')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
        {TOOLS.map((tl) => (
          <Link key={tl.to} to={tl.to} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="feat-icon" style={{ background: `linear-gradient(135deg, ${tl.c1}1f, ${tl.c2}2e)`, color: tl.c1 }}>{tl.icon}</div>
            <h3>{t(`tools.${tl.k}.t`)}</h3>
            <p>{t(`tools.${tl.k}.d`)}</p>
            <span style={{ marginTop: 10, color: 'var(--accent)', fontWeight: 600, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              {t('tools.open')} <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
