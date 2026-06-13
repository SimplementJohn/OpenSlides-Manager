import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Hash, Download, Loader } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useI18n } from '../i18n.jsx'

// ─── helpers ────────────────────────────────────────────────────────────────

async function pdfToImages(file, scale = 1.5) {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const out = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    out.push({ dataUrl: canvas.toDataURL('image/png'), w: viewport.width, h: viewport.height })
  }
  return out
}

const readImage = (file) =>
  new Promise((res) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      res({ dataUrl: url, w: img.naturalWidth, h: img.naturalHeight })
    }
    img.src = url
  })

function formatLabel(fmt, n, total, startAt) {
  const cur = n + startAt
  switch (fmt) {
    case 'n':       return `${cur}`
    case 'n/t':     return `${cur} / ${total + startAt - 1}`
    case 'page n':  return `Page ${cur}`
    case 'pct':     return `${Math.round((n / total) * 100)} %`
    default:        return `${cur}`
  }
}

const POS_GRID = [
  ['tl', 'tc', 'tr'],
  ['ml', 'mc', 'mr'],
  ['bl', 'bc', 'br'],
]

function posToCoords(pos, w, h, margin) {
  const row = Math.floor(['tl','tc','tr','ml','mc','mr','bl','bc','br'].indexOf(pos) / 3)
  const col = ['tl','tc','tr','ml','mc','mr','bl','bc','br'].indexOf(pos) % 3
  const x = col === 0 ? margin : col === 1 ? w / 2 : w - margin
  const y = row === 0 ? margin * 1.5 : row === 1 ? h / 2 : h - margin * 0.8
  const align = col === 0 ? 'left' : col === 1 ? 'center' : 'right'
  return { x, y, align }
}

function stampCanvas(src, label, opts) {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const margin = Math.round(Math.max(c.width, c.height) * 0.04)
      const px = Math.round(opts.size * (c.width / 800))
      ctx.font = `${opts.bold ? 'bold ' : ''}${px}px ${opts.font}`
      ctx.globalAlpha = opts.opacity / 100
      ctx.fillStyle = opts.color
      ctx.textBaseline = 'middle'

      const { x, y, align } = posToCoords(opts.pos, c.width, c.height, margin)
      ctx.textAlign = align

      // subtle shadow for readability
      ctx.shadowColor = opts.color === '#ffffff' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
      ctx.shadowBlur = px * 0.4

      ctx.fillText(label, x, y)
      res(c.toDataURL('image/png'))
    }
    img.src = src
  })
}

// ─── component ──────────────────────────────────────────────────────────────

const FORMATS = ['n', 'n/t', 'page n', 'pct']
const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact']

export default function Pagination() {
  const { t } = useI18n()
  const inputRef = useRef(null)
  const canvasRef = useRef(null)

  const [pages, setPages] = useState([])   // { dataUrl, w, h }
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [over, setOver] = useState(false)

  // controls
  const [fmt, setFmt]         = useState('n/t')
  const [pos, setPos]         = useState('bc')
  const [font, setFont]       = useState('Inter')
  const [size, setSize]       = useState(32)
  const [color, setColor]     = useState('#ffffff')
  const [opacity, setOpacity] = useState(90)
  const [startAt, setStartAt] = useState(1)
  const [bold, setBold]       = useState(false)
  const [preview, setPreview] = useState(null)  // stamped dataUrl

  const opts = { fmt, pos, font, size, color, opacity, startAt, bold }

  // ── file loading ──────────────────────────────────────────────────────────
  const loadFiles = useCallback(async (files) => {
    const list = [...files]
    if (!list.length) return
    setBusy(true)
    setPages([])
    setPreview(null)
    const out = []
    for (const f of list) {
      if (f.type === 'application/pdf') {
        const imgs = await pdfToImages(f)
        out.push(...imgs)
      } else if (f.type.startsWith('image/')) {
        out.push(await readImage(f))
      }
    }
    setPages(out)
    setBusy(false)
  }, [])

  const onFiles = (e) => loadFiles(e.target.files)
  const onDrop  = (e) => { e.preventDefault(); setOver(false); loadFiles(e.dataTransfer.files) }

  // ── live preview (page 0) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!pages.length) { setPreview(null); return }
    let cancelled = false
    const label = formatLabel(fmt, 1, pages.length, startAt)
    stampCanvas(pages[0].dataUrl, label, opts).then((url) => {
      if (!cancelled) setPreview(url)
    })
    return () => { cancelled = true }
  }, [pages, fmt, pos, font, size, color, opacity, startAt, bold])

  // ── export ────────────────────────────────────────────────────────────────
  const exportZip = async () => {
    setExporting(true)
    const zip = new JSZip()
    for (let i = 0; i < pages.length; i++) {
      const label = formatLabel(fmt, i + 1, pages.length, startAt)
      const url = await stampCanvas(pages[i].dataUrl, label, opts)
      const b64 = url.split(',')[1]
      zip.file(`slide-${String(i + 1).padStart(3, '0')}.png`, b64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'pagination.zip')
    setExporting(false)
  }

  // ─── UI ──────────────────────────────────────────────────────────────────
  const isLandscape = pages.length > 0 && pages[0].w > pages[0].h

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>

      <div className="page-head reveal">
        <span className="tool-badge" style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
          <Hash size={16} />
        </span>
        <h1>{t('pag.title')}</h1>
        <p>{t('pag.sub')}</p>
      </div>

      {/* dropzone */}
      {!pages.length && !busy && (
        <div
          className={'dropzone' + (over ? ' dz-over' : '')}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <div className="dz-icon"><Hash size={28} /></div>
          <p className="dz-title">{t('pag.drop')}</p>
          <p className="dz-hint">{t('pag.hint')}</p>
          <input ref={inputRef} type="file" accept="image/*,.pdf" multiple hidden onChange={onFiles} />
        </div>
      )}

      {busy && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Loader size={28} className="spin" style={{ color: 'var(--accent)' }} />
          <p style={{ marginTop: 12, color: 'var(--muted)' }}>{t('arr.loading')}</p>
        </div>
      )}

      {pages.length > 0 && !busy && (
        <div className="pag-layout">

          {/* ── controls ── */}
          <div className="card pag-controls">
            <h3 className="pag-section">{t('pag.cfg')}</h3>

            <label className="field">
              <span>{t('pag.format')}</span>
              <select value={fmt} onChange={(e) => setFmt(e.target.value)}>
                {FORMATS.map((f) => <option key={f} value={f}>{
                  f === 'n' ? '3' : f === 'n/t' ? '3 / 12' : f === 'page n' ? 'Page 3' : '25 %'
                }</option>)}
              </select>
            </label>

            <label className="field">
              <span>{t('pag.pos')}</span>
              <div className="pos-grid">
                {POS_GRID.map((row, ri) => row.map((p) => (
                  <button
                    key={p}
                    className={'pos-cell' + (pos === p ? ' active' : '')}
                    onClick={() => setPos(p)}
                    title={p}
                  />
                )))}
              </div>
            </label>

            <label className="field">
              <span>{t('pag.font')}</span>
              <select value={font} onChange={(e) => setFont(e.target.value)}>
                {FONTS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>

            <label className="field">
              <span>{t('pag.size')} — {size}px</span>
              <input type="range" min={10} max={80} value={size} onChange={(e) => setSize(+e.target.value)} />
            </label>

            <label className="field">
              <span>{t('pag.color')}</span>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 48, height: 32, padding: 2 }} />
            </label>

            <label className="field">
              <span>{t('pag.opacity')} — {opacity}%</span>
              <input type="range" min={10} max={100} value={opacity} onChange={(e) => setOpacity(+e.target.value)} />
            </label>

            <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} />
              <span>{t('pag.bold')}</span>
            </label>

            <label className="field">
              <span>{t('pag.start')}</span>
              <input type="number" min={0} max={999} value={startAt}
                onChange={(e) => setStartAt(Math.max(0, +e.target.value))}
                style={{ width: 70 }} />
            </label>

            <p className="pag-info">{pages.length} {t('arr.slides')}</p>

            <button
              className="btn btn-primary btn-lg"
              onClick={exportZip}
              disabled={exporting}
              style={{ marginTop: 8, width: '100%' }}
            >
              {exporting
                ? <><Loader size={15} className="spin" /> {t('sl.compress')}</>
                : <><Download size={15} /> {t('pag.export')}</>}
            </button>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setPages([]); setPreview(null) }}
              style={{ marginTop: 6, width: '100%' }}
            >
              {t('pag.reset')}
            </button>
          </div>

          {/* ── preview ── */}
          <div className="pag-preview-wrap">
            <p className="pag-preview-label">{t('pag.preview')} — {t('pag.slide1')}</p>
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className={'pag-preview-img' + (isLandscape ? ' landscape' : ' portrait')}
              />
            ) : (
              <div className="pag-preview-img" style={{ display: 'grid', placeItems: 'center' }}>
                <Loader size={24} className="spin" style={{ color: 'var(--accent)' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
