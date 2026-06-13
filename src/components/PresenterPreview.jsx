import { useEffect, useState } from 'react'
import { ChevronRight, Clock } from 'lucide-react'

export default function PresenterPreview() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const elapsed = tick % 60
  const timer = `00:${elapsed.toString().padStart(2, '0')}`
  const slideIdx = Math.floor(tick / 3) % 4

  return (
    <div className="wmp" aria-hidden="true">
      <div style={{ width: '100%', height: '100%', display: 'flex', gap: 5, padding: 4 }}>
        {/* current slide */}
        <div style={{ flex: 2, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 6, display: 'flex', flexDirection: 'column', padding: '8px', gap: 5, overflow: 'hidden' }}>
          <div style={{ height: 9, borderRadius: 3, background: 'linear-gradient(90deg,#10b981,#0ea5e9)', width: '60%', opacity: .85 }} />
          <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', width: '80%' }} />
          <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', width: '55%' }} />
          <div style={{ marginTop: 'auto', fontSize: '.45rem', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
            {slideIdx + 1} / 4
          </div>
        </div>
        {/* panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* next slide mini */}
          <div style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 4, display: 'flex', flexDirection: 'column', padding: '5px', gap: 3 }}>
            <div style={{ fontSize: '.4rem', color: 'var(--muted)', marginBottom: 2 }}>next</div>
            <div style={{ height: 5, borderRadius: 2, background: 'var(--line)', width: '70%' }} />
            <div style={{ height: 5, borderRadius: 2, background: 'var(--line)', width: '50%' }} />
          </div>
          {/* timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 4px', background: 'var(--surface-2)', borderRadius: 4 }}>
            <Clock size={8} style={{ color: 'var(--muted)' }} />
            <span style={{ fontSize: '.45rem', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{timer}</span>
          </div>
          {/* nav */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ChevronRight size={12} style={{ color: 'var(--accent)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
