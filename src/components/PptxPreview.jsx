import { useEffect, useState } from 'react'
import { FileText, Presentation } from 'lucide-react'

export default function PptxPreview() {
  const [phase, setPhase] = useState(0) // 0=pdf, 1=converting, 2=pptx

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 3), 1300)
    return () => clearInterval(id)
  }, [])

  const Card = ({ icon, label, color, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'pgp-pop .3s ease' }}>
      <div style={{ width: 70, height: 90, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-sm)' }}>
        {icon}
        <div style={{ height: 5, width: '60%', borderRadius: 3, background: 'var(--surface-2)' }} />
        <div style={{ height: 5, width: '45%', borderRadius: 3, background: 'var(--surface-2)' }} />
      </div>
      <span style={{ fontSize: '.6rem', fontWeight: 700, color: accent, letterSpacing: '.04em' }}>{label}</span>
    </div>
  )

  if (phase === 0) return (
    <div className="wmp" aria-hidden="true">
      <Card icon={<FileText size={24} style={{ color: '#ef4444' }} />} label="PDF" accent="#ef4444" />
    </div>
  )

  if (phase === 1) return (
    <div className="wmp" aria-hidden="true">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileText size={20} style={{ color: '#ef4444', opacity: .5 }} />
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: `sp-fill 1s ease-in-out ${i * .2}s infinite` }} />)}
        </div>
        <Presentation size={20} style={{ color: '#6366f1', opacity: .5 }} />
      </div>
    </div>
  )

  return (
    <div className="wmp" aria-hidden="true">
      <Card icon={<Presentation size={24} style={{ color: '#6366f1' }} />} label=".pptx" accent="#6366f1" />
    </div>
  )
}
