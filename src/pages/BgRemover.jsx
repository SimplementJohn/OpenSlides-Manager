import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Scissors, Download, RotateCcw } from 'lucide-react'
import { saveAs } from 'file-saver'
import { removeBackground } from '@imgly/background-removal'
import Drop from '../Drop.jsx'
import { useI18n } from '../i18n.jsx'

const MESSAGES = {
  fr: [
    'Réveil du modèle…',
    'Téléchargement des neurones…',
    'Repérage du sujet…',
    'Découpage au pixel près…',
    'Gomme magique en action…',
    'On vire ce fond moche…',
    'Polissage des contours…',
    'Presque là, promis…',
    'Magie noire en cours…',
  ],
  en: [
    'Waking up the model…',
    'Downloading some neurons…',
    'Spotting the subject…',
    'Cutting pixel by pixel…',
    'Magic eraser engaged…',
    'Yeeting that ugly background…',
    'Polishing the edges…',
    'Almost there, pinky promise…',
    'Doing forbidden math…',
  ],
}

export default function BgRemover() {
  const { t, lang } = useI18n()
  const [img, setImg] = useState(null)
  const [imgSrc, setImgSrc] = useState('')
  const [imgName, setImgName] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [pct, setPct] = useState(0)
  const [msgIdx, setMsgIdx] = useState(0)
  const [err, setErr] = useState('')
  const tick = useRef(null)
  const cycle = useRef(null)
  const startRef = useRef(0)
  const assets = useRef({})   // {key: {cur, tot}} pour téléchargement réel

  const msgs = MESSAGES[lang] || MESSAGES.fr
  const TAU = 7000            // constante de temps de l'estimation (ms)

  // pendant le travail: messages + barre = max(téléchargement réel, estimation temps)
  useEffect(() => {
    if (!busy) { clearInterval(tick.current); clearInterval(cycle.current); return }
    cycle.current = setInterval(() => setMsgIdx((i) => (i + 1) % msgs.length), 1700)
    tick.current = setInterval(() => {
      const elapsed = performance.now() - startRef.current
      const timeEst = 99 * (1 - Math.exp(-elapsed / TAU))   // asymptote 99%, jamais figé
      let dl = 0
      const a = Object.values(assets.current)
      const sumTot = a.reduce((s, x) => s + (x.tot || 0), 0)
      const sumCur = a.reduce((s, x) => s + (x.cur || 0), 0)
      if (sumTot > 0) dl = (sumCur / sumTot) * 96            // téléchargement réel mappé 0-96%
      setPct((p) => Math.min(99, Math.max(p, dl, timeEst)))
    }, 120)
    return () => { clearInterval(tick.current); clearInterval(cycle.current) }
  }, [busy, msgs.length])

  const run = async () => {
    if (!imgSrc) return
    assets.current = {}
    startRef.current = performance.now()
    setBusy(true); setErr(''); setResultUrl(''); setPct(1); setMsgIdx(0)
    try {
      const blob = await removeBackground(imgSrc, {
        progress: (key, cur, tot) => { assets.current[key] = { cur, tot } },
      })
      setPct(100)
      setResultUrl(URL.createObjectURL(blob))
    } catch (e) {
      setErr(t('bg.error') + ': ' + e.message)
    }
    setBusy(false)
  }

  const reset = () => { setImg(null); setImgSrc(''); setResultUrl(''); setErr(''); setPct(0); assets.current = {} }

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>

      <div className="page-head reveal" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span className="tool-badge"><Scissors size={26} /></span>
        <div>
          <h1>{t('tools.bg.t')}</h1>
          <p style={{ marginTop: 6 }}>{t('bg.sub')}</p>
        </div>
      </div>

      {!img && (
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <Drop img={img} imgName={imgName}
            onLoad={(image, src, name) => { setImg(image); setImgSrc(src); setImgName(name); setResultUrl('') }} />
        </div>
      )}

      {img && (
        <div className="bg-grid">
          <div className="card">
            <div className="bg-label">{t('bg.original')}</div>
            <div className="bg-frame"><img src={imgSrc} alt={imgName} /></div>
          </div>

          <div className="card">
            <div className="bg-label">{t('bg.result')}</div>
            <div className="bg-frame checker">
              {resultUrl
                ? <img src={resultUrl} alt="result" />
                : busy
                  ? <div className="dt-loading">
                      <Scissors size={26} className="dt-scissors" />
                      <div className="dt-msg">{msgs[msgIdx]}</div>
                    </div>
                  : <div className="bg-empty"><Scissors size={30} /></div>}
            </div>
          </div>
        </div>
      )}

      {/* barre de chargement orange */}
      {busy && (
        <div className="dt-progress">
          <div className="dt-track"><div className="dt-fill" style={{ width: `${pct}%` }} /></div>
          <div className="dt-pct">{Math.round(pct)}%</div>
        </div>
      )}

      {img && (
        <div className="bg-actions">
          {!resultUrl && (
            <button className="btn btn-primary btn-lg" onClick={run} disabled={busy}>
              <Scissors size={18} /> {busy ? t('bg.running') : t('bg.run')}
            </button>
          )}
          {resultUrl && (
            <button className="btn btn-primary btn-lg" onClick={() => saveAs(resultUrl, `${imgName}-detoure.png`)}>
              <Download size={18} /> {t('bg.download')}
            </button>
          )}
          <button className="btn btn-ghost btn-lg" onClick={reset} disabled={busy}>
            <RotateCcw size={18} /> {t('bg.again')}
          </button>
          {err && <span className="bg-status" style={{ color: '#dc2626' }}>{err}</span>}
          {resultUrl && !err && <span className="bg-status" style={{ color: 'var(--green)' }}>{t('bg.done')} ✓</span>}
        </div>
      )}
    </div>
  )
}
