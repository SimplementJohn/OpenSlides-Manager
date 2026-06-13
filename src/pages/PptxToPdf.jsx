import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileOutput, Download, Loader } from 'lucide-react'
import { saveAs } from 'file-saver'
import { useI18n } from '../i18n.jsx'

// Accepts slide images (png/jpg) and builds a PDF via pdf-lib.
// Full PPTX parsing in-browser is out of scope for v1; user exports images from PowerPoint first.
// We also accept PDF as input (re-export as same PDF for round-trip convenience).

async function imagesToPdf(pages, orientation) {
  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()
  for (const { dataUrl } of pages) {
    const base64 = dataUrl.split(',')[1]
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    let img
    if (dataUrl.startsWith('data:image/png')) img = await pdfDoc.embedPng(bytes)
    else img = await pdfDoc.embedJpg(bytes)

    const { width: iw, height: ih } = img
    let pw, ph
    if (orientation === 'auto') {
      pw = iw; ph = ih
    } else if (orientation === '16:9') {
      pw = 960; ph = 540
    } else {
      pw = 800; ph = 600
    }

    const page = pdfDoc.addPage([pw, ph])
    const scale = Math.min(pw / iw, ph / ih)
    const dw = iw * scale, dh = ih * scale
    page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh })
  }
  return pdfDoc.save()
}

const readImage = (file) =>
  new Promise((res) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => res({ dataUrl: url, w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  })

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
    out.push({ dataUrl: canvas.toDataURL('image/png'), w: viewport.width, h: viewport.height })
  }
  return out
}

export default function PptxToPdf() {
  const { t } = useI18n()
  const inputRef = useRef(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [over, setOver] = useState(false)
  const [orientation, setOrientation] = useState('auto')
  const [progress, setProgress] = useState(0)

  const loadFiles = useCallback(async (files) => {
    const list = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    if (!list.length) return
    setBusy(true); setPages([])
    const out = []
    for (const f of list) {
      if (f.type === 'application/pdf') out.push(...await pdfToImages(f))
      else if (f.type.startsWith('image/')) out.push(await readImage(f))
    }
    setPages(out); setBusy(false)
  }, [])

  const onFiles = (e) => loadFiles(e.target.files)
  const onDrop  = (e) => { e.preventDefault(); setOver(false); loadFiles(e.dataTransfer.files) }

  const exportPdf = async () => {
    setExporting(true); setProgress(0)
    const bytes = await imagesToPdf(pages, orientation)
    setProgress(100)
    saveAs(new Blob([bytes], { type: 'application/pdf' }), 'slides.pdf')
    setExporting(false)
  }

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>
      <div className="page-head reveal">
        <span className="tool-badge" style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>
          <FileOutput size={16} />
        </span>
        <h1>{t('p2p.title')}</h1>
        <p>{t('p2p.sub')}</p>
      </div>

      {!pages.length && !busy && (
        <div
          className={'dropzone' + (over ? ' dz-over' : '')}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <div className="dz-icon"><FileOutput size={28} /></div>
          <p className="dz-title">{t('p2p.drop')}</p>
          <p className="dz-hint">{t('p2p.hint')}</p>
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
              <span>{t('p2p.orient')}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['auto', '16:9', '4:3'].map((o) => (
                  <button key={o} className={'btn btn-sm' + (orientation === o ? ' btn-primary' : ' btn-ghost')}
                    onClick={() => setOrientation(o)}>{o === 'auto' ? t('rf.auto') : o}</button>
                ))}
              </div>
            </label>

            <p className="pag-info">{pages.length} {t('arr.slides')}</p>

            <button className="btn btn-primary btn-lg" onClick={exportPdf} disabled={exporting} style={{ marginTop: 8, width: '100%' }}>
              {exporting ? <><Loader size={15} className="spin" /> {t('p2p.building')}</> : <><Download size={15} /> {t('p2p.export')}</>}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPages([])} style={{ marginTop: 6, width: '100%' }}>
              {t('pag.reset')}
            </button>
          </div>

          <div className="pag-preview-wrap">
            <p className="pag-preview-label">{t('pag.preview')} — {t('pag.slide1')}</p>
            <img src={pages[0].dataUrl} alt="preview" className={'pag-preview-img' + (pages[0].w > pages[0].h ? ' landscape' : ' portrait')} />
            {pages.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {pages.slice(0, 8).map((p, i) => (
                  <img key={i} src={p.dataUrl} alt="" style={{ height: 48, borderRadius: 4, border: '1px solid var(--line)', objectFit: 'cover' }} />
                ))}
                {pages.length > 8 && <span style={{ fontSize: '.75rem', color: 'var(--muted)', alignSelf: 'center' }}>+{pages.length - 8}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
