import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Code2, Star, User } from 'lucide-react'
import Logo from './Logo.jsx'
import LangToggle from './LangToggle.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { useI18n } from '../i18n.jsx'
import { useAuth } from '../auth.jsx'

const REPO = 'https://github.com/SimplementJohn/OpenSlides-Manager'
const REPO_API = 'https://api.github.com/repos/SimplementJohn/OpenSlides-Manager'

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [stars, setStars] = useState(null)
  const { t } = useI18n()
  const { user } = useAuth()

  useEffect(() => {
    let alive = true
    fetch(REPO_API)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d.stargazers_count === 'number') setStars(d.stargazers_count)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])
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
          <NavLink to="/github" className={({ isActive }) => (isActive ? 'active' : '')}>GitHub</NavLink>
        </nav>
        <div className="nav-right">
          <ThemeToggle />
          <LangToggle />
          <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            <Code2 size={16} /> {t('nav.star')} <Star size={14} />
            {stars !== null && <span className="star-count">{formatStars(stars)}</span>}
          </a>
          {user
            ? <Link to="/account" className="btn btn-ghost btn-sm" title={user.name}><User size={16} /> {t('auth.account')}</Link>
            : <Link to="/login" className="btn btn-ghost btn-sm">{t('auth.login')}</Link>}
          <Link to="/customize" className="btn btn-primary btn-sm">{t('nav.start')}</Link>
          <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}
