import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Film, Play, Pause, FileArchive } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Drop from '../Drop.jsx'
import { useI18n } from '../i18n.jsx'

const PRESETS = [
  { name: 'Bleu', color: '#6ea8fe' },
  { name: 'Vert', color: '#22c55e' },
  { name: 'Rouge', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Violet', color: '#a855f7' },
  { name: 'Rose', color: '#ec4899' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'Jaune', color: '#eab308' },
  { name: 'Blanc', color: '#ffffff' },
  { name: 'Noir', color: '#111111' },
]

const MODULE_TYPES = {
  progressbar: {
    label: 'Barre de chargement', icon: '▬',
    defaults: { color: '#6ea8fe', direction: 'ltr', barFrac: 0.15, opacity: 1 },
  },
  counter: {
    label: 'Compteur (1/N)', icon: '#',
    defaults: { color: '#ffffff', size: 0.5, pos: 'br', format: 'i/n' },
  },
  dots: {
    label: 'Points indicateurs', icon: '•••',
    defaults: { color: '#6ea8fe', dim: '#ffffff55', size: 0.25, pos: 'bc' },
  },
}

let uid = 1
const newModule = (type) => ({ id: uid++, type, ...MODULE_TYPES[type].defaults })

export default function LoadingSlides() {
  const { t } = useI18n()
  const [img, setImg] = useState(null)
  const [imgName, setImgName] = useState('')
  const [count, setCount] = useState(10)
  const [modules, setModules] = useState([newModule('progressbar')])
  const [selId, setSelId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [previews, setPreviews] = useState({ first: '', last: '' })
  const [scrubIdx, setScrubIdx] = useState(1)
  const [scrubSrc, setScrubSrc] = useState('')
  const [playing, setPlaying] = useState(false)
  const [fps, setFps] = useState(4)

  const sel = modules.find((m) => m.id === selId) || null

  const addModule = (type) => {
    const m = newModule(type)
    setModules((ms) => [...ms, m])
    setSelId(m.id)
  }
  const removeModule = (id) => setModules((ms) => ms.filter((m) => m.id !== id))
  const patch = (id, p) => setModules((ms) => ms.map((m) => (m.id === id ? { ...m, ...p } : m)))
  const move = (id, dir) => setModules((ms) => {
    const i = ms.findIndex((m) => m.id === id)
    const j = i + dir
    if (j < 0 || j >= ms.length) return ms
    const c = [...ms]
    ;[c[i], c[j]] = [c[j], c[i]]
    return c
  })

  const posXY = (pos, W, H, pad) => {
    const x = pos[1] === 'l' ? pad : pos[1] === 'r' ? W - pad : W / 2
    const y = pos[0] === 't' ? pad : pos[0] === 'b' ? H - pad : H / 2
    return [x, y]
  }

  const drawModule = (ctx, m, i, n, W, H) => {
    const frac = i / n
    if (m.type === 'progressbar') {
      const barH = H * m.barFrac
      ctx.globalAlpha = m.opacity
      ctx.fillStyle = m.color
      if (m.direction === 'ltr') ctx.fillRect(0, H - barH, W * frac, barH)
      else if (m.direction === 'rtl') ctx.fillRect(W - W * frac, H - barH, W * frac, barH)
      else if (m.direction === 'btt') ctx.fillRect(0, H - H * frac, W, H * frac)
      else ctx.fillRect(0, 0, W, H * frac)
      ctx.globalAlpha = 1
    } else if (m.type === 'counter') {
      const fs = H * m.size
      const pad = fs * 0.4
      ctx.font = `bold ${fs}px system-ui, sans-serif`
      ctx.fillStyle = m.color
      ctx.textBaseline = pos2base(m.pos)
      ctx.textAlign = pos2align(m.pos)
      const [x, y] = posXY(m.pos, W, H, pad)
      const txt = m.format === 'i' ? `${i}`
        : m.format === 'pct' ? `${Math.round(frac * 100)}%`
        : `${i}/${n}`
      ctx.fillText(txt, x, y)
    } else if (m.type === 'dots') {
      const r = H * m.size * 0.5
      const gap = r * 3
      const total = (n - 1) * gap
      const [, cy] = posXY(m.pos, W, H, r * 2)
      const startX = W / 2 - total / 2
      for (let k = 0; k < n; k++) {
        ctx.beginPath()
        ctx.arc(startX + k * gap, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = k < i ? m.color : m.dim
        ctx.fill()
      }
    }
  }

  const renderSlide = useCallback((i, n) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const W = canvas.width, H = canvas.height
    for (const m of modules) drawModule(ctx, m, i, n, W, H)
    return canvas
  }, [img, modules])

  useEffect(() => {
    if (!img) { setPreviews({ first: '', last: '' }); return }
    const n = Math.max(1, count)
    setPreviews({
      first: renderSlide(1, n).toDataURL('image/png'),
      last: renderSlide(n, n).toDataURL('image/png'),
    })
  }, [img, count, renderSlide])

  useEffect(() => {
    setScrubIdx((s) => Math.min(Math.max(1, s), Math.max(1, count)))
  }, [count])

  useEffect(() => {
    if (!playing) return
    const n = Math.max(1, count)
    const id = setInterval(() => setScrubIdx((s) => (s >= n ? 1 : s + 1)), 1000 / fps)
    return () => clearInterval(id)
  }, [playing, fps, count])

  useEffect(() => {
    if (!img) { setScrubSrc(''); return }
    const n = Math.max(1, count)
    setScrubSrc(renderSlide(Math.min(scrubIdx, n), n).toDataURL('image/png'))
  }, [img, count, scrubIdx, renderSlide])

  const generate = async () => {
    if (!img) return
    const n = Math.max(1, Math.min(500, Math.floor(count)))
    setBusy(true)
    setStatus(t('sl.generating'))
    const zip = new JSZip()
    const pad = String(n).length
    for (let i = 1; i <= n; i++) {
      const canvas = renderSlide(i, n)
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
      zip.file(`${imgName}-${String(i).padStart(pad, '0')}.png`, blob)
      setStatus(`${t('sl.generating')} ${i}/${n}`)
    }
    setStatus(t('sl.compress'))
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${imgName}-diapos.zip`)
    setStatus(`${t('sl.done')} — ${n}`)
    setBusy(false)
  }

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>

      <div className="page-head reveal" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span className="tool-badge"><Film size={26} /></span>
        <div>
          <h1>{t('tools.slides.t')}</h1>
          <p style={{ marginTop: 6 }}>{t('sl.sub')}</p>
        </div>
      </div>

      <div style={{ maxWidth: img ? 'none' : 620, margin: img ? 0 : '0 auto' }}>
        <Drop img={img} imgName={imgName}
          onLoad={(image, src, name) => { setImg(image); setImgName(name) }} />
      </div>

      {img && (
        <>
          {/* réglages + génération */}
          <div className="card ls-gen">
            <div className="ls-count">
              <label htmlFor="ls-n">{t('sl.count')}</label>
              <input id="ls-n" type="number" min="1" max="500" value={count}
                     onChange={(e) => setCount(Number(e.target.value))} />
              <span className="ls-help">{t('sl.count.help')}</span>
            </div>
            <div className="ls-gen-action">
              <button className="btn btn-primary btn-lg" onClick={generate} disabled={busy}>
                <FileArchive size={18} /> {busy ? t('sl.generating') : t('sl.generate')}
              </button>
              {status && <span className="ls-status">{status}</span>}
            </div>
          </div>

          {/* aperçus départ / fin */}
          <div className="ls-previews">
            <div className="card ls-prev-row">
              <div className="bg-label">{t('sl.first')}</div>
              {previews.first && <div className="ls-imgframe"><img src={previews.first} alt={t('sl.first')} /></div>}
            </div>
            <div className="card ls-prev-row">
              <div className="bg-label">{t('sl.last')} ({Math.max(1, count)})</div>
              {previews.last && <div className="ls-imgframe"><img src={previews.last} alt={t('sl.last')} /></div>}
            </div>
          </div>

          {/* lecteur */}
          <div className="card">
            <div className="ls-player-head">
              <button className="btn btn-primary btn-sm ls-play" onClick={() => setPlaying((p) => !p)}>
                {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? t('sl.pause') : t('sl.play')}
              </button>
              <span className="ls-scrub-label">{t('sl.scrub')} · {scrubIdx} / {Math.max(1, count)}</span>
              <div className="ls-speed">
                <label>{t('sl.speed')} : {fps} {t('sl.fps')}</label>
                <input type="range" min="1" max="30" step="1" value={fps}
                       onChange={(e) => setFps(Number(e.target.value))} />
              </div>
            </div>
            <input type="range" min="1" max={Math.max(1, count)} step="1"
                   value={scrubIdx} style={{ width: '100%' }}
                   onChange={(e) => setScrubIdx(Number(e.target.value))} />
            {scrubSrc && <div className="ls-imgframe" style={{ marginTop: 14 }}><img src={scrubSrc} alt={`${scrubIdx}`} /></div>}
          </div>
        </>
      )}
    </div>
  )
}

const btnMini = {
  background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--line)',
  borderRadius: 6, padding: '4px 8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="color" value={value.slice(0, 7)} onChange={(e) => onChange(e.target.value)} />
        <input type="text" value={value} spellCheck={false}
          style={{ width: 110, padding: '8px 10px', background: '#fff',
            border: '1px solid var(--line)', borderRadius: 8, color: 'var(--text)', fontFamily: 'monospace' }}
          onChange={(e) => {
            let v = e.target.value.trim()
            if (v && !v.startsWith('#')) v = '#' + v
            onChange(v)
          }} />
      </div>
    </div>
  )
}

const POS_OPTIONS = [
  ['tl', 'Haut gauche'], ['tc', 'Haut centre'], ['tr', 'Haut droite'],
  ['cl', 'Milieu gauche'], ['cc', 'Centre'], ['cr', 'Milieu droite'],
  ['bl', 'Bas gauche'], ['bc', 'Bas centre'], ['br', 'Bas droite'],
]

function ProgressEditor({ m, patch }) {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {PRESETS.map((p) => (
          <button key={p.name} title={p.name} onClick={() => patch(m.id, { color: p.color })}
            className={'ls-chip' + (m.color === p.color ? ' sel' : '')}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: p.color, border: '1px solid var(--line)' }} />
            {p.name}
          </button>
        ))}
      </div>
      <div className="row">
        <ColorField label="Couleur" value={m.color} onChange={(v) => patch(m.id, { color: v })} />
        <div className="field">
          <label>Sens</label>
          <select value={m.direction} onChange={(e) => patch(m.id, { direction: e.target.value })}>
            <option value="ltr">Gauche → Droite</option>
            <option value="rtl">Droite → Gauche</option>
            <option value="btt">Bas → Haut</option>
            <option value="ttb">Haut → Bas</option>
          </select>
        </div>
        <div className="field">
          <label>Hauteur barre: {Math.round(m.barFrac * 100)}%</label>
          <input type="range" min="0.02" max="1" step="0.02" value={m.barFrac}
                 onChange={(e) => patch(m.id, { barFrac: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label>Opacité: {Math.round(m.opacity * 100)}%</label>
          <input type="range" min="0.1" max="1" step="0.05" value={m.opacity}
                 onChange={(e) => patch(m.id, { opacity: Number(e.target.value) })} />
        </div>
      </div>
    </>
  )
}

function CounterEditor({ m, patch }) {
  return (
    <div className="row">
      <ColorField label="Couleur" value={m.color} onChange={(v) => patch(m.id, { color: v })} />
      <div className="field">
        <label>Format</label>
        <select value={m.format} onChange={(e) => patch(m.id, { format: e.target.value })}>
          <option value="i/n">1 / N</option>
          <option value="i">1</option>
          <option value="pct">Pourcentage</option>
        </select>
      </div>
      <div className="field">
        <label>Position</label>
        <select value={m.pos} onChange={(e) => patch(m.id, { pos: e.target.value })}>
          {POS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Taille: {Math.round(m.size * 100)}%</label>
        <input type="range" min="0.1" max="1" step="0.05" value={m.size}
               onChange={(e) => patch(m.id, { size: Number(e.target.value) })} />
      </div>
    </div>
  )
}

function DotsEditor({ m, patch }) {
  return (
    <div className="row">
      <ColorField label="Point actif" value={m.color} onChange={(v) => patch(m.id, { color: v })} />
      <ColorField label="Point inactif" value={m.dim} onChange={(v) => patch(m.id, { dim: v })} />
      <div className="field">
        <label>Position</label>
        <select value={m.pos} onChange={(e) => patch(m.id, { pos: e.target.value })}>
          {POS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Taille: {Math.round(m.size * 100)}%</label>
        <input type="range" min="0.05" max="0.6" step="0.05" value={m.size}
               onChange={(e) => patch(m.id, { size: Number(e.target.value) })} />
      </div>
    </div>
  )
}

function pos2base(pos) { return pos[0] === 't' ? 'top' : pos[0] === 'b' ? 'bottom' : 'middle' }
function pos2align(pos) { return pos[1] === 'l' ? 'left' : pos[1] === 'r' ? 'right' : 'center' }
