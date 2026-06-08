import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TEMPLATES } from '../data/templates.js'
import TemplateCard from './TemplateCard.jsx'

// carousel auto droite->gauche, boucle infinie, pause au survol, flèches.
export default function Carousel() {
  const trackRef = useRef(null)
  // double la liste pour boucle continue (translateX -50%)
  const items = [...TEMPLATES, ...TEMPLATES]

  const nudge = (dir) => {
    const el = trackRef.current
    if (!el) return
    // pause auto, scroll manuel via translate temporaire impossible avec keyframe -> on scroll le conteneur masque
    el.parentElement.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <div className="carousel">
      <div className="carousel-edge l" />
      <div className="carousel-edge r" />
      <button className="carousel-nav left" onClick={() => nudge(-1)} aria-label="Précédent"><ChevronLeft size={20} /></button>
      <button className="carousel-nav right" onClick={() => nudge(1)} aria-label="Suivant"><ChevronRight size={20} /></button>
      <div className="carousel-mask">
        <div className="carousel-track" ref={trackRef}>
          {items.map((t, i) => <TemplateCard key={t.id + i} t={t} />)}
        </div>
      </div>
    </div>
  )
}
