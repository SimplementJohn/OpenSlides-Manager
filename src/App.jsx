import { Link } from 'react-router-dom'
import { Sparkles, Palette, Type, LayoutGrid, Wand2, FileDown, ShieldCheck, Zap, Code2, GitFork, Scale } from 'lucide-react'
import Dropzone from './components/Dropzone.jsx'
import Carousel from './components/Carousel.jsx'
import { useI18n } from './i18n.jsx'

const REPO = 'https://github.com/SimplementJohn/OpenSlides-Manager'

export default function App() {
  const { t } = useI18n()

  const FEATURES = [
    { icon: <Palette size={22} />, k: 'colors' },
    { icon: <Type size={22} />, k: 'type' },
    { icon: <LayoutGrid size={22} />, k: 'layout' },
    { icon: <Wand2 size={22} />, k: 'modern' },
    { icon: <FileDown size={22} />, k: 'export' },
    { icon: <ShieldCheck size={22} />, k: 'safe' },
  ]
  const STEPS = ['1', '2', '3']

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="reveal">
            <span className="eyebrow"><Code2 size={14} /> {t('hero.badge')}</span>
            <h1>{t('hero.title1')} <span className="grad">{t('hero.title2')}</span></h1>
            <p className="lead">{t('hero.lead')}</p>
            <div className="hero-actions">
              <Link to="/customize" className="btn btn-primary btn-lg"><Zap size={18} /> {t('hero.cta1')}</Link>
              <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg"><Code2 size={18} /> {t('hero.cta2')}</a>
            </div>
            <div className="hero-note"><ShieldCheck size={15} /> {t('hero.note')}</div>
          </div>

          <div className="reveal d2" style={{ position: 'relative' }}>
            <Dropzone />
            <div className="float-badge" style={{ left: -14, top: -16 }}>
              <Sparkles size={16} color="#6366f1" /> {t('hero.badgeAB')}
            </div>
            <div className="float-badge" style={{ right: -10, bottom: -16, animationDelay: '1s' }}>
              <Zap size={16} color="#22c55e" /> {t('hero.badgeFast')}
            </div>
          </div>
        </div>
      </section>

      {/* PREVIEW */}
      <section className="section">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div className="slide-mock">
            <div className="bar">
              <span className="dot" style={{ background: '#ff5f57' }} />
              <span className="dot" style={{ background: '#febc2e' }} />
              <span className="dot" style={{ background: '#28c840' }} />
            </div>
            <div className="slide-canvas">
              <div className="sk title" />
              <div className="sk line m" />
              <div className="sk line l" />
              <div className="sk line s" />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '2rem' }}>{t('prev.title')}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6, margin: '14px 0 24px' }}>{t('prev.body')}</p>
            <Link to="/customize" className="btn btn-primary">{t('prev.cta')}</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <h2>{t('feat.title')}</h2>
            <p>{t('feat.sub')}</p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div key={f.k} className="card">
                <div className="feat-icon">{f.icon}</div>
                <h3>{t(`feat.${f.k}.t`)}</h3>
                <p>{t(`feat.${f.k}.d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{t('steps.title')}</h2>
            <p>{t('steps.sub')}</p>
          </div>
          <div className="grid-3">
            {STEPS.map((n) => (
              <div key={n} className="card" style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent)', color: '#fff', fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.2rem', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>{n}</div>
                <h3>{t(`steps.${n}t`)}</h3>
                <p>{t(`steps.${n}d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAROUSEL */}
      <section className="section alt">
        <div className="container section-head">
          <h2>{t('caro.title')}</h2>
          <p>{t('caro.sub')}</p>
        </div>
        <Carousel />
        <div className="container" style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/tools" className="btn btn-ghost">{t('caro.cta')}</Link>
        </div>
      </section>

      {/* OPEN SOURCE */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{t('os.title')}</h2>
            <p>{t('os.sub')}</p>
          </div>
          <div className="grid-3" style={{ marginBottom: 36 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="feat-icon" style={{ margin: '0 auto 16px' }}><Scale size={22} /></div>
              <h3>{t('os.mit.t')}</h3><p>{t('os.mit.d')}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="feat-icon" style={{ margin: '0 auto 16px' }}><ShieldCheck size={22} /></div>
              <h3>{t('os.priv.t')}</h3><p>{t('os.priv.d')}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="feat-icon" style={{ margin: '0 auto 16px' }}><GitFork size={22} /></div>
              <h3>{t('os.contrib.t')}</h3><p>{t('os.contrib.d')}</p>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', textAlign: 'center', color: '#fff', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: '2rem' }}>{t('os.cta.title')}</h2>
            <p style={{ opacity: .9, fontSize: '1.1rem', margin: '14px 0 28px' }}>{t('os.cta.sub')}</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-lg" style={{ background: '#fff', color: 'var(--accent-d)' }}><Code2 size={18} /> {t('os.cta.repo')}</a>
              <Link to="/customize" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.4)' }}>{t('os.cta.run')}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
