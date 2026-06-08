import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Film, Play, Pause, FileArchive } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Drop from '../Drop.jsx'
import { useI18n } from '../i18n.jsx'

// Barre de chargement gauche→droite, hauteur 15% en bas. Réglages fixes pour l'instant.
const BAR = { color: '#6366f1', barFrac: 0.15 }

export default function LoadingSlides() {
  const { t } = useI18n()
  const [img, setImg] = useState(null)
  const [imgName, setImgName] = useState('')
  const [count, setCount] = useState(10)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [previews, setPreviews] = useState({ first: '', last: '' })
  const [scrubIdx, setScrubIdx] = useState(1)
  const [scrubSrc, setScrubSrc] = useState('')
  const [playing, setPlaying] = useState(false)
  const [fps, setFps] = useState(4)

  // Dessine l'image + barre remplie à i/n sur un canvas.
  const renderSlide = useCallback((i, n) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const W = canvas.width, H = canvas.height
    ctx.fillStyle = BAR.color
    ctx.fillRect(0, H - H * BAR.barFrac, W * (i / n), H * BAR.barFrac)
    return canvas
  }, [img])

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
