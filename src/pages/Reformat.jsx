import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Maximize2, Download, Loader } from 'lucide-react'
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
    canvas.width = viewport.width; canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    out.push(canvas.toDataURL('image/png'))
  }
  return out
}

const readImage = (file) =>
  new Promise((res) => {
    const r = new FileReader()
    r.onload = (e) => res(e.target.result)
    r.readAsDataURL(file)
  })

const RATIOS = [
  { label: '16:9', w: 1920, h: 1080 },
  { label: '4:3',  w: 1600, h: 1200 },
  { label: '1:1',  w: 1080, h: 1080 },
  { label: 'A4 portrait', w: 794, h: 1123 },
]

function reformatCanvas(src, tw, th, fitMode, bg) {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = tw; c.height = th
      const ctx = c.getContext('2d')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, tw, th)

      const sw = img.naturalWidth, sh = img.naturalHeight
      const sr = sw / sh, tr = tw / th

      let dx, dy, dw, dh
      if (fitMode === 'stretch') {
        dx = 0; dy = 0; dw = tw; dh = th
      } else if (fitMode === 'fill') {
        if (sr > tr) { dh = th; dw = th * sr; dx = (tw - dw) / 2; dy = 0 }
        else         { dw = tw; dh = tw / sr; dy = (th - dh) / 2; dx = 0 }
      } else { // fit (letterbox)
        if (sr > tr) { dw = tw; dh = tw / sr; dy = (th - dh) / 2; dx = 0 }
        else         { dh = th; dw = th * sr; dx = (tw - dw) / 2; dy = 0 }
      }

      ctx.drawImage(img, dx, dy, dw, dh)
      res(c.toDataURL('image/png'))
    }
    img.src = src
  })
}

export default function Reformat() {
  const { t } = useI18n()
  const inputRef = useRef(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [over, setOver] = useState(false)
  const [preview, setPreview] = useState(null)

  const [ratioIdx, setRatioIdx] = useState(0)
  const [fitMode, setFitMode]   = useState('fit')
  const [bg, setBg]             = useState('#000000')
  const [customW, setCustomW]   = useState(1280)
  const [customH, setCustomH]   = useState(720)
  const [useCustom, setUseCustom] = useState(false)

  const tw = useCustom ? customW : RATIOS[ratioIdx].w
  const th = useCustom ? customH : RATIOS[ratioIdx].h

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
    if (!pages.length) { setPreview(null); return }
    let cancelled = false
    reformatCanvas(pages[0], tw, th, fitMode, bg).then((url) => {
      if (!cancelled) setPreview(url)
    })
    return () => { cancelled = true }
  }, [pages, tw, th, fitMode, bg])

  const exportZip = async () => {
    setExporting(true)
    const zip = new JSZip()
    for (let i = 0; i < pages.length; i++) {
      const url = await reformatCanvas(pages[i], tw, th, fitMode, bg)
      zip.file(`slide-${String(i + 1).padStart(3, '0')}.png`, url.split(',')[1], { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'reformat.zip')
    setExporting(false)
  }

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>
      <div className="page-head reveal">
        <span className="tool-badge" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
          <Maximize2 size={16} />
        </span>
        <h1>{t('rf.title')}</h1>
        <p>{t('rf.sub')}</p>
      </div>

      {!pages.length && !busy && (
        <div
          className={'dropzone' + (over ? ' dz-over' : '')}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <div className="dz-icon"><Maximize2 size={28} /></div>
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
              <span>{t('rf.ratio')}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {RATIOS.map((r, i) => (
                  <button key={r.label}
                    className={'btn btn-sm' + (!useCustom && ratioIdx === i ? ' btn-primary' : ' btn-ghost')}
                    onClick={() => { setRatioIdx(i); setUseCustom(false) }}>{r.label}</button>
                ))}
                <button className={'btn btn-sm' + (useCustom ? ' btn-primary' : ' btn-ghost')}
                  onClick={() => setUseCustom(true)}>{t('rf.custom')}</button>
              </div>
            </label>

            {useCustom && (
              <div className="field" style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <input type="number" min={100} max={4000} value={customW} onChange={(e) => setCustomW(+e.target.value)} style={{ width: 70 }} />
                <span>×</span>
                <input type="number" min={100} max={4000} value={customH} onChange={(e) => setCustomH(+e.target.value)} style={{ width: 70 }} />
                <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>px</span>
              </div>
            )}

            <label className="field">
              <span>{t('rf.fit')}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['fit', 'fill', 'stretch'].map((m) => (
                  <button key={m} className={'btn btn-sm' + (fitMode === m ? ' btn-primary' : ' btn-ghost')}
                    onClick={() => setFitMode(m)}>{t(`rf.${m}`)}</button>
                ))}
              </div>
            </label>

            {fitMode === 'fit' && (
              <label className="field">
                <span>{t('rf.bg')}</span>
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 48, height: 32, padding: 2 }} />
              </label>
            )}

            <p className="pag-info">{pages.length} {t('arr.slides')} → {tw}×{th}px</p>

            <button className="btn btn-primary btn-lg" onClick={exportZip} disabled={exporting} style={{ marginTop: 8, width: '100%' }}>
              {exporting ? <><Loader size={15} className="spin" /> {t('sl.compress')}</> : <><Download size={15} /> {t('pag.export')}</>}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setPages([]); setPreview(null) }} style={{ marginTop: 6, width: '100%' }}>
              {t('pag.reset')}
            </button>
          </div>

          <div className="pag-preview-wrap">
            <p className="pag-preview-label">{t('pag.preview')} — {t('pag.slide1')}</p>
            {preview
              ? <img src={preview} alt="preview" className="pag-preview-img" style={{ aspectRatio: `${tw}/${th}` }} />
              : <div className="pag-preview-img" style={{ display: 'grid', placeItems: 'center' }}><Loader size={24} className="spin" style={{ color: 'var(--accent)' }} /></div>}
          </div>
        </div>
      )}
    </div>
  )
}
