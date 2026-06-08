import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="OpenSlides Manager accueil">
      <img src="/icon-slides.png" alt="" className="logo-img" width="34" height="34" />
      <span>Open<b>Slides</b></span>
    </Link>
  )
}
