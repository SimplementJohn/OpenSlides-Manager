import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Monitor, ChevronLeft, ChevronRight, Maximize, Minimize, Clock, Edit3 } from 'lucide-react'
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

function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function useNotes(count) {
  const KEY = 'presenter_notes_v1'
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
  })
  const setNote = (idx, val) => {
    setNotes((prev) => {
      const next = { ...prev, [idx]: val }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }
  return [notes, setNote]
}

export default function Present() {
  const { t } = useI18n()
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [idx, setIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [presenting, setPresenting] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [notes, setNote] = useNotes()

  // timer
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // keyboard navigation
  useEffect(() => {
    if (!presenting) return
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') setIdx((i) => Math.min(i + 1, pages.length - 1))
      if (e.key === 'ArrowLeft')  setIdx((i) => Math.max(i - 1, 0))
      if (e.key === 'Escape')     setPresenting(false)
      if (e.key === 'f')          toggleFullscreen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [presenting, pages.length])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const loadFiles = useCallback(async (files) => {
    const list = [...files]
    if (!list.length) return
    setBusy(true); setPages([]); setIdx(0); setElapsed(0); setRunning(false)
    const out = []
    for (const f of list) {
      if (f.type === 'application/pdf') out.push(...await pdfToImages(f))
      else if (f.type.startsWith('image/')) out.push(await readImage(f))
    }
    setPages(out); setBusy(false)
  }, [])

  const onFiles = (e) => loadFiles(e.target.files)
  const onDrop  = (e) => { e.preventDefault(); setOver(false); loadFiles(e.dataTransfer.files) }

  const prev = () => setIdx((i) => Math.max(i - 1, 0))
  const next = () => setIdx((i) => Math.min(i + 1, pages.length - 1))

  const startPresenting = () => { setPresenting(true); setRunning(true) }

  if (presenting && pages.length) {
    return (
      <div ref={containerRef} className="presenter-shell" tabIndex={-1}>
        <div className="presenter-main">
          <img src={pages[idx]} alt={`Slide ${idx + 1}`} className="presenter-current" />
        </div>
        <div className="presenter-panel">
          <div className="presenter-meta">
            <span className="presenter-counter">{idx + 1} / {pages.length}</span>
            <span className="presenter-timer" onClick={() => setRunning((r) => !r)}>
              <Clock size={14} /> {fmtTime(elapsed)}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={toggleFullscreen}>
              {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPresenting(false)}>{t('pres.exit')}</button>
          </div>
          <div className="presenter-next-wrap">
            <p className="presenter-label">{t('pres.next')}</p>
            {pages[idx + 1]
              ? <img src={pages[idx + 1]} alt="next" className="presenter-next" />
              : <div className="presenter-next presenter-end">{t('pres.last')}</div>}
          </div>
          <div className="presenter-notes-wrap">
            <p className="presenter-label"><Edit3 size={12} /> {t('pres.notes')}</p>
            <textarea
              className="presenter-notes"
              value={notes[idx] || ''}
              onChange={(e) => setNote(idx, e.target.value)}
              placeholder={t('pres.notes.ph')}
            />
          </div>
          <div className="presenter-nav">
            <button className="btn btn-ghost" onClick={prev} disabled={idx === 0}><ChevronLeft size={20} /></button>
            <button className="btn btn-ghost" onClick={next} disabled={idx === pages.length - 1}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>
      <div className="page-head reveal">
        <span className="tool-badge" style={{ background: 'linear-gradient(135deg,#10b981,#0ea5e9)' }}>
          <Monitor size={16} />
        </span>
        <h1>{t('pres.title')}</h1>
        <p>{t('pres.sub')}</p>
      </div>

      {!pages.length && !busy && (
        <div
          className={'dropzone' + (over ? ' dz-over' : '')}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <div className="dz-icon"><Monitor size={28} /></div>
          <p className="dz-title">{t('pag.drop')}</p>
          <p className="dz-hint">{t('pag.hint')}</p>
          <input ref={inputRef} type="file" accept="image/*,.pdf" multiple hidden onChange={onFiles} />
        </div>
      )}

      {busy && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Monitor size={28} className="spin" style={{ color: 'var(--accent)' }} />
          <p style={{ marginTop: 12, color: 'var(--muted)' }}>{t('arr.loading')}</p>
        </div>
      )}

      {pages.length > 0 && !busy && (
        <div className="pag-layout">
          <div className="card pag-controls">
            <h3 className="pag-section">{t('pres.cfg')}</h3>
            <p className="pag-info">{pages.length} {t('arr.slides')}</p>
            <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{t('pres.keys')}</p>
            <button className="btn btn-primary btn-lg" onClick={startPresenting} style={{ marginTop: 8, width: '100%' }}>
              <Monitor size={15} /> {t('pres.start')}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPages([])} style={{ marginTop: 6, width: '100%' }}>
              {t('pag.reset')}
            </button>
          </div>

          <div className="pag-preview-wrap">
            <p className="pag-preview-label">{t('pres.notes.all')}</p>
            <div className="pres-notes-grid">
              {pages.map((src, i) => (
                <div key={i} className="pres-note-row">
                  <img src={src} alt={`Slide ${i + 1}`} className="pres-thumb" />
                  <textarea
                    className="pres-note-input"
                    value={notes[i] || ''}
                    onChange={(e) => setNote(i, e.target.value)}
                    placeholder={`${t('pres.notes.ph')} (${i + 1})`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
