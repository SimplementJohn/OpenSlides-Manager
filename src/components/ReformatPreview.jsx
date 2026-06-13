import { useEffect, useState } from 'react'

const RATIOS = [
  { label: '16:9', w: 160, h: 90 },
  { label: '4:3',  w: 120, h: 90 },
  { label: '1:1',  w: 90,  h: 90 },
]

export default function ReformatPreview() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % RATIOS.length), 1400)
    return () => clearInterval(id)
  }, [])

  const { label, w, h } = RATIOS[step]
  const maxH = 130

  // scale to fit maxH
  const scale = maxH / h
  const sw = Math.round(w * scale)
  const sh = Math.round(h * scale)

  return (
    <div className="wmp" aria-hidden="true">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div
          key={step}
          style={{
            width: sw, height: sh,
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            animation: 'pgp-pop .3s ease',
            display: 'flex', flexDirection: 'column', padding: '8px 10px', gap: 6,
          }}
        >
          <div style={{ height: 10, borderRadius: 3, background: 'linear-gradient(90deg,#0ea5e9,#6366f1)', opacity: .85, width: '55%' }} />
          <div style={{ height: 7, borderRadius: 3, background: 'var(--surface-2)', width: '72%' }} />
          <div style={{ height: 7, borderRadius: 3, background: 'var(--surface-2)', width: '45%' }} />
        </div>
        <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '.05em' }}>{label}</span>
      </div>
    </div>
  )
}
