import { Link } from 'react-router-dom'

export default function TemplateCard({ t, cta = 'Essayer' }) {
  return (
    <div className="tpl">
      <div className="tpl-thumb" style={{ background: `linear-gradient(135deg, ${t.c1}12, ${t.c2}1f)` }}>
        {t.badge && <span className={'badge' + (t.badge === 'Nouveau' ? ' new' : '')}>{t.badge}</span>}
        <div className="sk title" style={{ background: `linear-gradient(90deg, ${t.c1}, ${t.c2})`, width: '55%' }} />
        <div className="sk line m" style={{ height: 9 }} />
        <div className="sk line s" style={{ height: 9 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: t.c1 }} />
          <span style={{ width: 28, height: 28, borderRadius: 8, background: t.c2, opacity: .6 }} />
        </div>
      </div>
      <div className="tpl-body">
        <h4>{t.name}</h4>
        <p>{t.desc}</p>
        <Link to="/customize" className="btn btn-ghost btn-sm">{cta}</Link>
      </div>
    </div>
  )
}
