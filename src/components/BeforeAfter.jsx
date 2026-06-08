// Auto-animated before/after reveal — shows background removal at a glance.
export default function BeforeAfter({ before, after, alt = '' }) {
  return (
    <div className="ba" aria-hidden="true">
      {/* base: original with background */}
      <img className="ba-img" src={before} alt={alt} draggable="false" loading="lazy" decoding="async" />
      {/* top: cut-out over checkerboard, revealed by moving wipe */}
      <div className="ba-after">
        <img className="ba-img" src={after} alt="" draggable="false" loading="lazy" decoding="async" />
        <span className="ba-line" />
      </div>
    </div>
  )
}
