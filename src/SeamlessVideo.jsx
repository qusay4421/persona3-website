import { useEffect, useRef } from 'react'

export default function SeamlessVideo({ src, className = '', style, videoRef: externalRef }) {
  const internalRef = useRef(null)
  const ref = externalRef ?? internalRef

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.play().catch(() => {
      v.muted = true
      v.play()
    })
  }, [src])

  const base = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
  return (
    <div className={`seamless-video ${className}`} style={{ position: 'absolute', inset: 0, ...style }}>
      <video ref={ref} src={src} autoPlay loop playsInline style={base} />
    </div>
  )
}
