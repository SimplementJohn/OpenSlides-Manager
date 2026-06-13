import { useEffect, useState } from 'react'
import { GripVertical } from 'lucide-react'

const SEQUENCES = [
  [1, 2, 3, 4],
  [3, 1, 2, 4],
  [3, 4, 1, 2],
  [1, 2, 3, 4],
]

const COLORS = {
  1: '#6366f1',
  2: '#0ea5e9',
  3: '#f59e0b',
  4: '#10b981',
}

const ITEM_H = 32
const GAP = 8
const STRIDE = ITEM_H + GAP

export default function ArrangePreview() {
  const [order, setOrder] = useState(SEQUENCES[0])
  const [seqIdx, setSeqIdx] = useState(0)
  const [dragged, setDragged] = useState(null)

  useEffect(() => {
    const id = setInterval(() => {
      setSeqIdx((i) => {
        const next = (i + 1) % SEQUENCES.length
        setOrder(SEQUENCES[next])
        // highlight the slide that moved most
        const prev = SEQUENCES[i]
        const cur = SEQUENCES[next]
        const moved = cur.find((n, pos) => prev.indexOf(n) !== pos)
        setDragged(moved ?? null)
        return next
      })
    }, 1200)
    return () => clearInterval(id)
  }, [])

  const totalH = 4 * ITEM_H + 3 * GAP

  return (
    <div className="ap" aria-hidden="true" style={{ position: 'relative', height: totalH }}>
      {[1, 2, 3, 4].map((n) => {
        const pos = order.indexOf(n)
        const isActive = n === dragged
        return (
          <div
            key={n}
            className={'ap-slide' + (isActive ? ' ap-slide--active' : '')}
            style={{ top: pos * STRIDE }}
          >
            <GripVertical size={10} className="ap-grip" />
            <div
              className="ap-thumb"
              style={{
                background: n === 3
                  ? `linear-gradient(90deg, #f59e0b, #ec4899)`
                  : COLORS[n],
                opacity: isActive ? 1 : 0.35,
              }}
            />
            <span className="ap-num">{n}</span>
          </div>
        )
      })}
    </div>
  )
}
