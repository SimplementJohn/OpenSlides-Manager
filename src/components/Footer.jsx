import { Link } from 'react-router-dom'
import { Code2 } from 'lucide-react'
import Logo from './Logo.jsx'
import { useI18n } from '../i18n.jsx'

const REPO = 'https://github.com/SimplementJohn/OpenSlides-Manager'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: 14, maxWidth: 300, lineHeight: 1.6 }}>
              {t('foot.tagline')}
            </p>
            <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>
              <Code2 size={16} /> {t('foot.github')}
            </a>
          </div>
          <div>
            <h5>{t('foot.tools')}</h5>
            <Link to="/bgremover">{t('tools.bg.t')}</Link>
            <Link to="/loadingslides">{t('tools.slides.t')}</Link>
            <Link to="/customize">{t('nav.customize')}</Link>
          </div>
          <div>
            <h5>{t('foot.project')}</h5>
            <a href={REPO} target="_blank" rel="noreferrer">{t('foot.source')}</a>
            <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">{t('foot.bug')}</a>
            <a href={`${REPO}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">{t('foot.contribute')}</a>
          </div>
          <div>
            <h5>{t('foot.license')}</h5>
            <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT</a>
            <a href={`${REPO}/blob/main/README.md`} target="_blank" rel="noreferrer">{t('foot.docs')}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t('foot.copy')}</span>
          <span>{t('foot.welcome')}</span>
        </div>
      </div>
    </footer>
  )
}
