export default function SeamlessVideo({ src, className = '', style }) {
  const base = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
  return (
    <div className={`seamless-video ${className}`} style={{ position: 'absolute', inset: 0, ...style }}>
      <video src={src} autoPlay loop muted playsInline style={base} />
    </div>
  )
}
