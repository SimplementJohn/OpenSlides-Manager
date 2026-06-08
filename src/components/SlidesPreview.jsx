// Auto-animated preview — 4 mini slides, loading bar fills progressively (i/n).
export default function SlidesPreview() {
  const N = 4
  return (
    <div className="sp" aria-hidden="true">
      {Array.from({ length: N }, (_, i) => (
        <div className="sp-slide" key={i}>
          <div className="sp-art" />
          <div className="sp-bar">
            <span style={{ '--fill': `${((i + 1) / N) * 100}%`, animationDelay: `${i * 0.4}s` }} />
          </div>
          <div className="sp-count">{i + 1}/{N}</div>
        </div>
      ))}
    </div>
  )
}
