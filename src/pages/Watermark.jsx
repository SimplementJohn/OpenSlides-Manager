import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Droplets, Download, Loader } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useI18n } from '../i18n.jsx'

async function pdfToImages(file) {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const out = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
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
    img.onload = () => res({ dataUrl: url, w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  })

function stampWatermark(src, text, opts) {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const px = Math.round(opts.size * (c.width / 800))
      ctx.font = `bold ${px}px ${opts.font}`
      ctx.globalAlpha = opts.opacity / 100
      ctx.fillStyle = opts.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (opts.mode === 'tiled') {
        const cols = 3, rows = 3
        for (let r = 0; r < rows; r++) {
          for (let col = 0; col < cols; col++) {
            const x = (c.width / cols) * (col + 0.5)
            const y = (c.height / rows) * (r + 0.5)
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate((opts.angle * Math.PI) / 180)
            ctx.fillText(text, 0, 0)
            ctx.restore()
          }
        }
      } else {
        ctx.save()
        ctx.translate(c.width / 2, c.height / 2)
        ctx.rotate((opts.angle * Math.PI) / 180)
        ctx.fillText(text, 0, 0)
        ctx.restore()
      }

      res(c.toDataURL('image/png'))
    }
    img.src = src
  })
}

const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact']
const ANGLES = [{ label: '0°', v: 0 }, { label: '45°', v: 45 }, { label: '90°', v: 90 }, { label: '-45°', v: -45 }]

export default function Watermark() {
  const { t } = useI18n()
  const inputRef = useRef(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [over, setOver] = useState(false)
  const [preview, setPreview] = useState(null)

  const [text, setText]       = useState('CONFIDENTIEL')
  const [angle, setAngle]     = useState(45)
  const [opacity, setOpacity] = useState(30)
  const [size, setSize]       = useState(48)
  const [color, setColor]     = useState('#ff0000')
  const [font, setFont]       = useState('Inter')
  const [mode, setMode]       = useState('center')

  const opts = { angle, opacity, size, color, font, mode }

  const loadFiles = useCallback(async (files) => {
    const list = [...files]
    if (!list.length) return
    setBusy(true); setPages([]); setPreview(null)
    const out = []
    for (const f of list) {
      if (f.type === 'application/pdf') out.push(...await pdfToImages(f))
      else if (f.type.startsWith('image/')) out.push(await readImage(f))
    }
    setPages(out); setBusy(false)
  }, [])

  const onFiles = (e) => loadFiles(e.target.files)
  const onDrop  = (e) => { e.preventDefault(); setOver(false); loadFiles(e.dataTransfer.files) }

  useEffect(() => {
    if (!pages.length || !text.trim()) { setPreview(null); return }
    let cancelled = false
    stampWatermark(pages[0].dataUrl, text, opts).then((url) => {
      if (!cancelled) setPreview(url)
    })
    return () => { cancelled = true }
  }, [pages, text, angle, opacity, size, color, font, mode])

  const exportZip = async () => {
    setExporting(true)
    const zip = new JSZip()
    for (let i = 0; i < pages.length; i++) {
      const url = await stampWatermark(pages[i].dataUrl, text, opts)
      zip.file(`watermark-${String(i + 1).padStart(3, '0')}.png`, url.split(',')[1], { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'watermark.zip')
    setExporting(false)
  }

  const isLandscape = pages.length > 0 && pages[0].w > pages[0].h

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>
      <div className="page-head reveal">
        <span className="tool-badge" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
          <Droplets size={16} />
        </span>
        <h1>{t('wm.title')}</h1>
        <p>{t('wm.sub')}</p>
      </div>

      {!pages.length && !busy && (
        <div
          className={'dropzone' + (over ? ' dz-over' : '')}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <div className="dz-icon"><Droplets size={28} /></div>
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
          <div className="card pag-controls">
            <h3 className="pag-section">{t('pag.cfg')}</h3>

            <label className="field">
              <span>{t('wm.text')}</span>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} maxLength={60} />
            </label>

            <label className="field">
              <span>{t('wm.angle')}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ANGLES.map((a) => (
                  <button key={a.v} className={'btn btn-sm' + (angle === a.v ? ' btn-primary' : ' btn-ghost')}
                    onClick={() => setAngle(a.v)}>{a.label}</button>
                ))}
              </div>
            </label>

            <label className="field">
              <span>{t('wm.mode')}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['center', 'tiled'].map((m) => (
                  <button key={m} className={'btn btn-sm' + (mode === m ? ' btn-primary' : ' btn-ghost')}
                    onClick={() => setMode(m)}>{t(`wm.${m}`)}</button>
                ))}
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
              <input type="range" min={12} max={120} value={size} onChange={(e) => setSize(+e.target.value)} />
            </label>

            <label className="field">
              <span>{t('pag.color')}</span>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 48, height: 32, padding: 2 }} />
            </label>

            <label className="field">
              <span>{t('pag.opacity')} — {opacity}%</span>
              <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(+e.target.value)} />
            </label>

            <p className="pag-info">{pages.length} {t('arr.slides')}</p>

            <button className="btn btn-primary btn-lg" onClick={exportZip} disabled={exporting || !text.trim()} style={{ marginTop: 8, width: '100%' }}>
              {exporting ? <><Loader size={15} className="spin" /> {t('sl.compress')}</> : <><Download size={15} /> {t('pag.export')}</>}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setPages([]); setPreview(null) }} style={{ marginTop: 6, width: '100%' }}>
              {t('pag.reset')}
            </button>
          </div>

          <div className="pag-preview-wrap">
            <p className="pag-preview-label">{t('pag.preview')} — {t('pag.slide1')}</p>
            {preview
              ? <img src={preview} alt="preview" className={'pag-preview-img' + (isLandscape ? ' landscape' : ' portrait')} />
              : <div className="pag-preview-img" style={{ display: 'grid', placeItems: 'center' }}><Loader size={24} className="spin" style={{ color: 'var(--accent)' }} /></div>}
          </div>
        </div>
      )}
    </div>
  )
}
