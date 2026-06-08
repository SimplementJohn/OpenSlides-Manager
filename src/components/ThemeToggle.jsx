import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

function initial() {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') return saved
  return systemDark() ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(initial)

  // applique la classe (sans mémoriser — la mémorisation se fait au clic)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // suit l'appareil tant que l'utilisateur n'a pas choisi manuellement
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => {
      if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next) // choix manuel mémorisé
    setTheme(next)
  }

  const dark = theme === 'dark'
  return (
    <button
      className="btn btn-ghost btn-sm theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Mode clair' : 'Mode sombre'}
      title={dark ? 'Mode clair' : 'Mode sombre'}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
