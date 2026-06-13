import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Scissors, Film, LayoutGrid, Hash, Droplets, Maximize2, FileOutput, Presentation, Monitor, ArrowRight, Search } from 'lucide-react'
import { useI18n } from '../i18n.jsx'
import BeforeAfter from '../components/BeforeAfter.jsx'
import SlidesPreview from '../components/SlidesPreview.jsx'
import ArrangePreview from '../components/ArrangePreview.jsx'
import WatermarkPreview from '../components/WatermarkPreview.jsx'
import PaginationPreview from '../components/PaginationPreview.jsx'
import ReformatPreview from '../components/ReformatPreview.jsx'
import PdfPreview from '../components/PdfPreview.jsx'
import PptxPreview from '../components/PptxPreview.jsx'
import PresenterPreview from '../components/PresenterPreview.jsx'

const TAGS = ['image', 'slides', 'pdf', 'conversion', 'annotation', 'presentation']

export default function Templates() {
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  const TOOLS = [
    { to: '/bgremover',    icon: <Scissors size={26} />,    c1: '#6366f1', c2: '#8b5cf6', k: 'bg',       demo: 'ba',    tags: ['image'] },
    { to: '/loadingslides',icon: <Film size={26} />,         c1: '#0ea5e9', c2: '#2563eb', k: 'slides',   demo: 'slides',tags: ['slides', 'image'] },
    { to: '/arrange',      icon: <LayoutGrid size={26} />,  c1: '#f59e0b', c2: '#ec4899', k: 'arrange',  demo: 'arrange',tags: ['slides'] },
    { to: '/pagination',   icon: <Hash size={26} />,         c1: '#8b5cf6', c2: '#ec4899', k: 'pag',      demo: 'pag',   tags: ['annotation', 'slides', 'pdf'] },
    { to: '/watermark',    icon: <Droplets size={26} />,    c1: '#ef4444', c2: '#f97316', k: 'wm',        demo: 'wm',    tags: ['annotation', 'slides', 'pdf'] },
    { to: '/reformat',     icon: <Maximize2 size={26} />,   c1: '#0ea5e9', c2: '#6366f1', k: 'rf',        demo: 'rf',    tags: ['image', 'slides'] },
    { to: '/pptx2pdf',     icon: <FileOutput size={26} />,  c1: '#f97316', c2: '#ef4444', k: 'p2p',       demo: 'pdf',   tags: ['conversion', 'pdf'] },
    { to: '/pdf2pptx',     icon: <Presentation size={26} />,c1: '#6366f1', c2: '#8b5cf6', k: 'pdf2pptx',  demo: 'pptx',  tags: ['conversion', 'pdf', 'presentation'] },
    { to: '/present',      icon: <Monitor size={26} />,     c1: '#10b981', c2: '#0ea5e9', k: 'pres',      demo: 'pres',  tags: ['presentation', 'slides'] },
  ]

  const needle = q.trim().toLowerCase()
  const shown = TOOLS.filter((tl) => {
    const matchText = !needle ||
      t(`tools.${tl.k}.t`).toLowerCase().includes(needle) ||
      t(`tools.${tl.k}.d`).toLowerCase().includes(needle)
    const matchTag = !activeTag || tl.tags.includes(activeTag)
    return matchText && matchTag
  })

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

      <div className="tool-tags">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={'tool-tag' + (activeTag === tag ? ' active' : '')}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            {t(`tag.${tag}`)}
          </button>
        ))}
      </div>

      <div className="tool-grid">
        {shown.map((tl) => (
          <Link key={tl.to} to={tl.to} className="tool-card">
            <div className="tool-media" style={{ background: `linear-gradient(135deg, ${tl.c1}14, ${tl.c2}26)` }}>
              {tl.demo === 'ba'     && <BeforeAfter before="/demo/vase.webp" after="/demo/vase-cut.webp" alt={t(`tools.${tl.k}.t`)} />}
              {tl.demo === 'slides' && <SlidesPreview />}
              {tl.demo === 'arrange'&& <ArrangePreview />}
              {tl.demo === 'wm'    && <WatermarkPreview />}
              {tl.demo === 'pag'   && <PaginationPreview />}
              {tl.demo === 'rf'    && <ReformatPreview />}
              {tl.demo === 'pdf'   && <PdfPreview />}
              {tl.demo === 'pptx'  && <PptxPreview />}
              {tl.demo === 'pres'  && <PresenterPreview />}
              {!tl.demo && <span className="tool-ico" style={{ color: tl.c1 }}>{tl.icon}</span>}
            </div>
            <div className="tool-body">
              <h3>{t(`tools.${tl.k}.t`)}</h3>
              <p>{t(`tools.${tl.k}.d`)}</p>
              <div className="tool-card-tags">
                {tl.tags.map((tag) => (
                  <span key={tag} className="tool-card-tag">{t(`tag.${tag}`)}</span>
                ))}
              </div>
              <span className="tool-open">{t('tools.open')} <ArrowRight size={15} /></span>
            </div>
          </Link>
        ))}
        {shown.length === 0 && <p className="tool-empty">{t('tools.empty')}</p>}
      </div>
    </div>
  )
}
