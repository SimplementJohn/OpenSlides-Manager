import { useState } from 'react'
import {
  Palette, Type, Heading, LayoutGrid, Shapes, Image,
  Wand2, Ratio, FileText, FileDown, Check,
} from 'lucide-react'
import { useI18n } from '../i18n.jsx'

const COLORS = ['#6366f1', '#2563eb', '#0d9488', '#ec4899', '#f59e0b', '#111827']
const FONTS = ['Manrope', 'Inter', 'Poppins', 'Georgia']

export default function Editor() {
  const { t } = useI18n()
  const [view, setView] = useState('after')
  const [color, setColor] = useState('#6366f1')
  const [font, setFont] = useState('Manrope')
  const [level, setLevel] = useState('medium')
  const [applied, setApplied] = useState(false)

  const TOOLS = [
    [<Palette size={18} />, 'theme'], [<Palette size={18} />, 'colors'], [<Type size={18} />, 'fonts'],
    [<Heading size={18} />, 'titles'], [<LayoutGrid size={18} />, 'layout'], [<Shapes size={18} />, 'icons'],
    [<Image size={18} />, 'images'], [<Wand2 size={18} />, 'pro'], [<Ratio size={18} />, '169'],
    [<FileText size={18} />, 'pdf'], [<FileDown size={18} />, 'pptx'],
  ]
  const LEVELS = [['light', t('lvl.light')], ['medium', t('lvl.medium')], ['strong', t('lvl.strong')]]

  const apply = () => { setApplied(true); setTimeout(() => setApplied(false), 1400) }
  const before = view === 'before'

  return (
    <div className="container">
      <div className="page-head" style={{ paddingTop: 32, marginBottom: 8 }}>
        <h1 style={{ fontSize: '1.6rem' }}>{t('ed.title')}</h1>
        <p style={{ fontSize: '.98rem' }}>{t('ed.sub')}</p>
      </div>

      <div className="editor">
        <aside className="panel">
          <h4>{t('ed.toolsH')}</h4>
          {TOOLS.map(([icon, k]) => (
            <div key={k} className="tool">{icon}<span>{t(`ed.t.${k}`)}</span></div>
          ))}
        </aside>

        <div className="stage">
          <div className="switch">
            <button className={before ? 'on' : ''} onClick={() => setView('before')}>{t('ed.before')}</button>
            <button className={!before ? 'on' : ''} onClick={() => setView('after')}>{t('ed.after')}</button>
          </div>

          <div className="stage-slide" style={{
            background: before ? '#f3f4f6' : '#fff',
            fontFamily: font,
            boxShadow: applied ? '0 0 0 4px rgba(99,102,241,.3), var(--shadow-lg)' : 'var(--shadow-lg)',
          }}>
            <div style={{ height: 26, width: before ? '70%' : '52%', borderRadius: 8, background: before ? '#cbd5e1' : `linear-gradient(90deg, ${color}, ${color}99)` }} />
            <div style={{ height: 12, borderRadius: 6, background: before ? '#e2e8f0' : '#eef0f4', width: '90%' }} />
            <div style={{ height: 12, borderRadius: 6, background: before ? '#e2e8f0' : '#eef0f4', width: before ? '95%' : '78%' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: before ? '#e2e8f0' : color }} />
              <span style={{ width: 40, height: 40, borderRadius: 10, background: before ? '#e2e8f0' : `${color}66` }} />
            </div>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
            {before ? t('ed.original') : `${t('ed.modern')} ${LEVELS.find((l) => l[0] === level)[1].toLowerCase()}`}
          </p>
        </div>

        <aside className="panel">
          <h4>{t('ed.quick')}</h4>

          <div className="field">
            <label>{t('ed.style')}</label>
            <select defaultValue="Modern Gradient">
              <option>Modern Gradient</option><option>Business Clean</option>
              <option>Minimal White</option><option>Pitch Bold</option>
            </select>
          </div>

          <div className="field">
            <label>{t('ed.color')}</label>
            <div className="swatches">
              {COLORS.map((c) => (
                <span key={c} className={'swatch' + (color === c ? ' on' : '')} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>

          <div className="field">
            <label>{t('ed.font')}</label>
            <select value={font} onChange={(e) => setFont(e.target.value)}>
              {FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div className="field">
            <label>{t('ed.level')}</label>
            <div className="seg">
              {LEVELS.map(([v, label]) => (
                <button key={v} className={level === v ? 'on' : ''} onClick={() => setLevel(v)}>{label}</button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={apply}>
            {applied ? <><Check size={18} /> {t('ed.applied')}</> : t('ed.apply')}
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
            <FileDown size={18} /> {t('ed.export')}
          </button>
        </aside>
      </div>
    </div>
  )
}
