import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileCheck2 } from 'lucide-react'
import { useI18n } from '../i18n.jsx'

const FORMATS = ['.pptx', '.pdf', '.key', '.png', '.jpg']

export default function Dropzone() {
  const { t } = useI18n()
  const [over, setOver] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const nav = useNavigate()

  const accept = useCallback((f) => {
    if (!f) return
    setFile(f)
    setLoading(true)
    // simulation import/analyse -> redirige vers éditeur
    setTimeout(() => { setLoading(false); nav('/customize') }, 1400)
  }, [nav])

  // drag & drop sur tout le site
  useEffect(() => {
    let depth = 0
    const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files')
    const onEnter = (e) => { if (hasFiles(e)) { e.preventDefault(); depth++; setOver(true) } }
    const onOver = (e) => { if (hasFiles(e)) e.preventDefault() }
    const onLeave = () => { depth = Math.max(0, depth - 1); if (depth === 0) setOver(false) }
    const onDrop = (e) => {
      const f = e.dataTransfer?.files?.[0]
      if (f) { e.preventDefault(); depth = 0; setOver(false); accept(f) }
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [accept])

  return (
    <>
    {over && !loading && (
      <div className="drop-overlay">
        <div className="drop-overlay-inner">
          <UploadCloud size={48} />
          <div className="drop-overlay-text">{t('dz.drop')}</div>
        </div>
      </div>
    )}
    <div
      className={'dropzone' + (over ? ' over' : '')}
      onClick={() => !loading && inputRef.current.click()}
      onKeyDown={(e) => { if (!loading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current.click() } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); accept(e.dataTransfer.files[0]) }}
      role="button" tabIndex={0}
    >
      <div className="dz-icon">
        {loading ? <span className="loader" /> : file ? <FileCheck2 size={28} /> : <UploadCloud size={28} />}
      </div>
      <div className="dz-title">
        {loading ? t('dz.analyzing') : file ? file.name : t('dz.drop')}
      </div>
      <div className="dz-sub">
        {loading ? t('dz.prep') : t('dz.hint')}
      </div>
      {!loading && (
        <div className="dz-formats">
          {FORMATS.map((f) => <span key={f} className="chip">{f}</span>)}
        </div>
      )}
      <input ref={inputRef} className="dz-input" type="file"
        accept=".pptx,.pdf,.key,image/*"
        onChange={(e) => accept(e.target.files[0])} />
    </div>
    </>
  )
}
