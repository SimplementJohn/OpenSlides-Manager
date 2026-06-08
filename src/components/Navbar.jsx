import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Code2, Star } from 'lucide-react'
import Logo from './Logo.jsx'
import LangToggle from './LangToggle.jsx'
import { useI18n } from '../i18n.jsx'

const REPO = 'https://github.com/SimplementJohn/OpenSlides-Manager'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  const LINKS = [
    ['/', t('nav.home')],
    ['/tools', t('nav.tools')],
    ['/customize', t('nav.customize')],
  ]
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />
        <nav className={'nav-links' + (open ? ' open' : '')} onClick={() => setOpen(false)}>
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
          ))}
          <a href={REPO} target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <div className="nav-right">
          <LangToggle />
          <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            <Code2 size={16} /> {t('nav.star')} <Star size={14} />
          </a>
          <Link to="/customize" className="btn btn-primary btn-sm">{t('nav.start')}</Link>
          <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}
