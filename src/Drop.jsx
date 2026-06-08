import { useEffect, useRef, useState, useCallback } from 'react'
import { UploadCloud, ImageIcon } from 'lucide-react'
import { useI18n } from './i18n.jsx'

// zone d'upload partagée: drag / clic / coller. onLoad(image, src, name)
export default function Drop({ img, imgName, onLoad }) {
  const { t } = useI18n()
  const [over, setOver] = useState(false)
  const fileRef = useRef(null)

  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const image = new Image()
      image.onload = () =>
        onLoad(image, e.target.result, file.name.replace(/\.[^.]+$/, '') || 'image')
      image.src = e.target.result
    }
    reader.readAsDataURL(file)
  }, [onLoad])

  useEffect(() => {
    const onPaste = (e) => {
      const item = [...e.clipboardData.items].find((i) => i.type.startsWith('image/'))
      if (item) loadFile(item.getAsFile())
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [loadFile])

  // drag & drop sur tout le site
  useEffect(() => {
    let depth = 0
    const hasImg = (e) => [...(e.dataTransfer?.types || [])].includes('Files')
    const onEnter = (e) => { if (hasImg(e)) { e.preventDefault(); depth++; setOver(true) } }
    const onOver = (e) => { if (hasImg(e)) e.preventDefault() }
    const onLeave = () => { depth = Math.max(0, depth - 1); if (depth === 0) setOver(false) }
    const onDrop = (e) => {
      const f = [...(e.dataTransfer?.files || [])].find((x) => x.type.startsWith('image/'))
      if (f) { e.preventDefault(); depth = 0; setOver(false); loadFile(f) }
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
  }, [loadFile])

  return (
    <>
    {over && (
      <div className="drop-overlay">
        <div className="drop-overlay-inner">
          <UploadCloud size={48} />
          <div className="drop-overlay-text">{t('drop.title')}</div>
        </div>
      </div>
    )}
    <div
      className={'dropzone' + (over ? ' over' : '')}
      onClick={() => fileRef.current.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current.click() } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); loadFile(e.dataTransfer.files[0]) }}
      role="button" tabIndex={0}
    >
      <div className="dz-icon">{img ? <ImageIcon size={28} /> : <UploadCloud size={28} />}</div>
      <div className="dz-title">
        {img ? `${imgName} — ${img.naturalWidth}×${img.naturalHeight}px` : t('drop.title')}
      </div>
      <div className="dz-sub">{img ? t('drop.change') : t('drop.hint')}</div>
      <input ref={fileRef} className="dz-input" type="file" accept="image/*"
             onChange={(e) => loadFile(e.target.files[0])} />
    </div>
    </>
  )
}
