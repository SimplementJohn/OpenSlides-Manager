import { useEffect, useState } from 'react'

const POSITIONS = ['bl', 'bc', 'br', 'tc', 'tr']
const LABELS = ['1', '1 / 4', 'Page 1', '25 %', '1']

export default function PaginationPreview() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % POSITIONS.length), 1400)
    return () => clearInterval(id)
  }, [])

  const pos = POSITIONS[step]
  const label = LABELS[step]

  return (
    <div className="wmp" aria-hidden="true">
      <div className="wmp-slide">
        <div className="wmp-lines">
          <div className="wmp-line wmp-line--title" style={{ background: 'linear-gradient(90deg,#8b5cf6,#ec4899)', opacity: .85 }} />
          <div className="wmp-line wmp-line--m" />
          <div className="wmp-line wmp-line--s" />
          <div className="wmp-line wmp-line--m" style={{ width: '55%' }} />
        </div>
        <div className={`pgp-num pgp-${pos}`} key={step}>{label}</div>
      </div>
    </div>
  )
}
