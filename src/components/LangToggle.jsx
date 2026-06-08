import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useI18n } from '../i18n.jsx'

const LANGS = [
  { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/fr.svg' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/gb.svg' },
]

export default function LangToggle() {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGS.find((l) => l.code === lang) || LANGS[0]

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="lang" ref={ref}>
      <button className="btn btn-ghost btn-sm lang-btn" onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open} aria-label="Language">
        <img src={current.flag} alt="" className="flag" />
        <span style={{ fontWeight: 700 }}>{lang.toUpperCase()}</span>
        <ChevronDown size={14} style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="lang-menu" role="listbox">
          {LANGS.map((l) => (
            <button key={l.code} role="option" aria-selected={l.code === lang}
              className={'lang-opt' + (l.code === lang ? ' on' : '')}
              onClick={() => { setLang(l.code); setOpen(false) }}>
              <img src={l.flag} alt="" className="flag" />
              <span style={{ flex: 1, textAlign: 'left' }}>{l.label}</span>
              {l.code === lang && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
