import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LayoutGrid, UploadCloud, Copy, Trash2, FileArchive, GripVertical } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useI18n } from '../i18n.jsx'

let uid = 1
const newPage = (src) => ({ id: uid++, src })

// Rendu des pages d'un PDF en images (canvas) via pdf.js — chargé à la demande.
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
    out.push(canvas.toDataURL('image/png'))
  }
  return out
}

const readImage = (file) => new Promise((res) => {
  const r = new FileReader()
  r.onload = (e) => res(e.target.result)
  r.readAsDataURL(file)
})

export default function Arrange() {
  const { t } = useI18n()
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [drag, setDrag] = useState(null)   // index en cours de déplacement
  const inputRef = useRef(null)

  const addFiles = async (files) => {
    const list = [...files]
    if (!list.length) return
    setBusy(true)
    const added = []
    for (const f of list) {
      if (f.type === 'application/pdf') {
        const imgs = await pdfToImages(f)
        imgs.forEach((src) => added.push(newPage(src)))
      } else if (f.type.startsWith('image/')) {
        added.push(newPage(await readImage(f)))
      }
    }
    setPages((p) => [...p, ...added])
    setBusy(false)
  }

  const duplicate = (i) => setPages((p) => [...p.slice(0, i + 1), newPage(p[i].src), ...p.slice(i + 1)])
  const remove = (i) => setPages((p) => p.filter((_, k) => k !== i))

  const onDrop = (i) => {
    if (drag === null || drag === i) return
    setPages((p) => {
      const c = [...p]
      const [moved] = c.splice(drag, 1)
      c.splice(i, 0, moved)
      return c
    })
    setDrag(null)
  }

  const exportZip = async () => {
    if (!pages.length) return
    setBusy(true)
    const zip = new JSZip()
    const pad = String(pages.length).length
    for (let i = 0; i < pages.length; i++) {
      const b64 = pages[i].src.split(',')[1]
      zip.file(`slide-${String(i + 1).padStart(pad, '0')}.png`, b64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'slides-reordered.zip')
    setBusy(false)
  }

  return (
    <div className="container page">
      <Link to="/tools" className="back-link"><ArrowLeft size={15} /> {t('back.tools')}</Link>

      <div className="page-head reveal" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span className="tool-badge"><LayoutGrid size={26} /></span>
        <div>
          <h1>{t('arr.title')}</h1>
          <p style={{ marginTop: 6 }}>{t('arr.sub')}</p>
        </div>
      </div>

      <div
        className={'dropzone' + (over ? ' over' : '')}
        onClick={() => !busy && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files) }}
        role="button" tabIndex={0}
      >
        <div className="dz-icon">{busy ? <span className="loader" /> : <UploadCloud size={28} />}</div>
        <div className="dz-title">{busy ? t('arr.loading') : t('arr.drop')}</div>
        <div className="dz-sub">{t('arr.hint')}</div>
        <input ref={inputRef} className="dz-input" type="file" accept="image/*,application/pdf" multiple
               onChange={(e) => addFiles(e.target.files)} />
      </div>

      {pages.length > 0 && (
        <>
          <div className="arr-bar">
            <span className="arr-count">{pages.length} {t('arr.slides')}</span>
            <button className="btn btn-primary" onClick={exportZip} disabled={busy}>
              <FileArchive size={18} /> {t('arr.export')}
            </button>
          </div>

          <div className="arr-grid">
            {pages.map((p, i) => (
              <div key={p.id}
                className={'arr-card' + (drag === i ? ' dragging' : '')}
                draggable
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                onDragEnd={() => setDrag(null)}
              >
                <div className="arr-num"><GripVertical size={14} /> {i + 1}</div>
                <img src={p.src} alt={`slide ${i + 1}`} draggable="false" />
                <div className="arr-actions">
                  <button title={t('arr.dup')} onClick={() => duplicate(i)}><Copy size={15} /></button>
                  <button title={t('arr.del')} onClick={() => remove(i)} className="arr-del"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
