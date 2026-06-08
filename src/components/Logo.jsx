import { Link } from 'react-router-dom'

// Logo vectoriel: tableau de présentation (image) + curseurs de réglage, dégradé violet→rose.
export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="OpenSlides Manager accueil">
      <svg className="logo-mark-svg" width="34" height="34" viewBox="0 0 48 48" fill="none" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="osmg" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#osmg)" />
        {/* tableau */}
        <rect x="11" y="13" width="26" height="18" rx="2.5" fill="#fff" opacity="0.95" />
        {/* image: soleil + montagne */}
        <circle cx="19" cy="19" r="2.2" fill="url(#osmg)" />
        <path d="M14 29l4.5-5 3 3 4-5 5.5 7z" fill="url(#osmg)" />
        {/* pied */}
        <rect x="23" y="31" width="2" height="5" rx="1" fill="#fff" />
        <circle cx="24" cy="37.5" r="2" fill="#fff" />
        {/* curseurs */}
        <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
          <line x1="29" y1="18" x2="34" y2="18" /><circle cx="31" cy="18" r="1.4" fill="url(#osmg)" />
          <line x1="29" y1="22" x2="34" y2="22" /><circle cx="32.5" cy="22" r="1.4" fill="url(#osmg)" />
        </g>
      </svg>
      <span>Open<b>Slides</b></span>
    </Link>
  )
}
