import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Presentation, Download, Loader } from 'lucide-react'
import { useI18n } from '../i18n.jsx'

async function pdfToImages(file, scale) {
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
    canvas.width = viewport.width; canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    out.push(canvas.toDataURL('image/jpeg', 0.92))
  }
  return out
}

async function buildPptx(images, slideFormat, onProgress) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  const [sw, sh] = slideFormat === '4:3' ? [10, 7.5] : [13.33, 7.5]
  pptx.defineLayout({ name: 'CUSTOM', width: sw, height: sh })
  pptx.layout = 'CUSTOM'

  for (let i = 0; i < images.length; i++) {
    const slide = pptx.addSlide()
    slide.addImage({ data: images[i], x: 0, y: 0, w: sw, h: sh })
    onProgress(Math.round(((i + 1) / images.length) * 90))
  }

  return pptx.write({ outputType: 'blob' })
}

export default function PdfToPptx() {
  const { t } = useI18n()
  const inputRef = useRef(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [over, setOver] = useState(false)
  const [quality, setQuality] = useState('medium')
  const [slideFormat, setSlideFormat] = useState('16:9')

  const scaleMap = { low: 1, medium: 1.5, high: 2 }

  const loadFile = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') return
    setBusy(true); setPages([]); setProgress(0)
    const imgs = await pdfToImages(file, scaleMap[quality])
    setPages(imgs); setBusy(false)
  }, [quality])

  const onFiles = (e) => loadFile(e.target.files[0])
  const onDrop  = (e) => { e.preventDefault(); setOver(false); loadFile(e.dataTransfer.files[0]) }

  const exportPptx = async () => {
    setExporting(true); setProgress(0)
    const blob = await buildPptx(pages, slideFormat, setProgress)
    setProgress(100)
    const { saveAs } = await import('file-saver')
    saveAs(blob, 'slides.pptx')
    setExporting(false)
  }

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>
      <div className="page-head reveal">
        <span className="tool-badge" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <Presentation size={16} />
        </span>
        <h1>{t('pdf2pptx.title')}</h1>
        <p>{t('pdf2pptx.sub')}</p>
      </div>

      {!pages.length && !busy && (
        <div
          className={'dropzone' + (over ? ' dz-over' : '')}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <div className="dz-icon"><Presentation size={28} /></div>
          <p className="dz-title">{t('pdf2pptx.drop')}</p>
          <p className="dz-hint">{t('pdf2pptx.hint')}</p>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" hidden onChange={onFiles} />
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
              <span>{t('pdf2pptx.format')}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['16:9', '4:3'].map((f) => (
                  <button key={f} className={'btn btn-sm' + (slideFormat === f ? ' btn-primary' : ' btn-ghost')}
                    onClick={() => setSlideFormat(f)}>{f}</button>
                ))}
              </div>
            </label>

            <label className="field">
              <span>{t('pdf2pptx.quality')}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['low', 'medium', 'high'].map((q) => (
                  <button key={q} className={'btn btn-sm' + (quality === q ? ' btn-primary' : ' btn-ghost')}
                    onClick={() => setQuality(q)}>{t(`pdf2pptx.q.${q}`)}</button>
                ))}
              </div>
            </label>

            <p className="pag-info">{pages.length} {t('arr.slides')}</p>

            {exporting && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: 999, transition: 'width .3s' }} />
                </div>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4 }}>{progress}%</p>
              </div>
            )}

            <button className="btn btn-primary btn-lg" onClick={exportPptx} disabled={exporting} style={{ marginTop: 8, width: '100%' }}>
              {exporting ? <><Loader size={15} className="spin" /> {t('pdf2pptx.building')}</> : <><Download size={15} /> {t('pdf2pptx.export')}</>}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setPages([]); setProgress(0) }} style={{ marginTop: 6, width: '100%' }}>
              {t('pag.reset')}
            </button>
          </div>

          <div className="pag-preview-wrap">
            <p className="pag-preview-label">{t('pag.preview')} — {t('pag.slide1')}</p>
            <img src={pages[0]} alt="preview" className="pag-preview-img landscape" />
            {pages.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {pages.slice(0, 8).map((p, i) => (
                  <img key={i} src={p} alt="" style={{ height: 48, borderRadius: 4, border: '1px solid var(--line)', objectFit: 'cover' }} />
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
