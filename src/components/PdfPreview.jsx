// Preview for Images→PDF tool: 3 slides stacking → PDF badge
import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'

export default function PdfPreview() {
  const [phase, setPhase] = useState(0) // 0=slides, 1=merging, 2=pdf

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 3), 1200)
    return () => clearInterval(id)
  }, [])

  const slides = [
    { bg: '#6366f1', w: '50%' },
    { bg: '#0ea5e9', w: '65%' },
    { bg: '#f97316', w: '45%' },
  ]

  if (phase === 2) {
    return (
      <div className="wmp" aria-hidden="true">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'pgp-pop .3s ease' }}>
          <div style={{ width: 70, height: 90, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-sm)' }}>
            <FileText size={24} style={{ color: '#f97316' }} />
            <div style={{ height: 5, width: '60%', borderRadius: 3, background: 'var(--surface-2)' }} />
            <div style={{ height: 5, width: '45%', borderRadius: 3, background: 'var(--surface-2)' }} />
          </div>
          <span style={{ fontSize: '.6rem', fontWeight: 700, color: '#f97316', letterSpacing: '.04em' }}>PDF</span>
        </div>
      </div>
    )
  }

  return (
    <div className="wmp" aria-hidden="true">
      <div style={{ position: 'relative', width: 130, height: 90 }}>
        {slides.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * 12, top: i * 8,
              width: 100, height: 68,
              background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 6,
              padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5,
              boxShadow: 'var(--shadow-sm)',
              transform: phase === 1 ? `translate(${(1 - i) * 8}px, ${(1 - i) * 6}px) scale(${1 - i * 0.02})` : 'none',
              transition: 'transform .4s ease',
              zIndex: 3 - i,
            }}
          >
            <div style={{ height: 8, borderRadius: 3, background: s.bg, opacity: .8, width: s.w }} />
            <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', width: '70%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
