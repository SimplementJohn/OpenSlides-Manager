export default function WatermarkPreview() {
  return (
    <div className="wmp" aria-hidden="true">
      {/* slide background */}
      <div className="wmp-slide">
        {/* fake content lines */}
        <div className="wmp-lines">
          <div className="wmp-line wmp-line--title" />
          <div className="wmp-line wmp-line--m" />
          <div className="wmp-line wmp-line--s" />
          <div className="wmp-line wmp-line--m" style={{ width: '60%' }} />
        </div>
        {/* tiled watermark text — pure CSS, 3×3 grid */}
        <div className="wmp-overlay">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="wmp-stamp">DRAFT</span>
          ))}
        </div>
      </div>
    </div>
  )
}
