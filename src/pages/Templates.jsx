import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Scissors, Film, ArrowRight, Search } from 'lucide-react'
import { useI18n } from '../i18n.jsx'
import BeforeAfter from '../components/BeforeAfter.jsx'
import SlidesPreview from '../components/SlidesPreview.jsx'

export default function Templates() {
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const TOOLS = [
    { to: '/bgremover', icon: <Scissors size={26} />, c1: '#6366f1', c2: '#8b5cf6', k: 'bg', demo: 'ba' },
    { to: '/loadingslides', icon: <Film size={26} />, c1: '#0ea5e9', c2: '#2563eb', k: 'slides', demo: 'slides' },
  ]

  const needle = q.trim().toLowerCase()
  const shown = TOOLS.filter((tl) =>
    !needle ||
    t(`tools.${tl.k}.t`).toLowerCase().includes(needle) ||
    t(`tools.${tl.k}.d`).toLowerCase().includes(needle)
  )

  return (
    <div className="container page">
      <div className="page-head reveal">
        <h1>{t('tools.title')}</h1>
        <p>{t('tools.sub')}</p>
      </div>

      <div className="tool-search">
        <Search size={18} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('tools.search')}
          aria-label={t('tools.search')}
        />
      </div>

      <div className="tool-grid">
        {shown.map((tl) => (
          <Link key={tl.to} to={tl.to} className="tool-card">
            <div className="tool-media" style={{ background: `linear-gradient(135deg, ${tl.c1}14, ${tl.c2}26)` }}>
              {tl.demo === 'ba' && <BeforeAfter before="/demo/vase.png" after="/demo/vase-cut.png" alt={t(`tools.${tl.k}.t`)} />}
              {tl.demo === 'slides' && <SlidesPreview />}
              {!tl.demo && <span className="tool-ico" style={{ color: tl.c1 }}>{tl.icon}</span>}
            </div>
            <div className="tool-body">
              <h3>{t(`tools.${tl.k}.t`)}</h3>
              <p>{t(`tools.${tl.k}.d`)}</p>
              <span className="tool-open">{t('tools.open')} <ArrowRight size={15} /></span>
            </div>
          </Link>
        ))}
        {shown.length === 0 && <p className="tool-empty">{t('tools.empty')}</p>}
      </div>
    </div>
  )
}
