import { useEffect, useRef, useState } from 'react'

export default function CrossfadeVideos({ firstSrc, loopSrc, className = '', style }) {
  const [firstDone, setFirstDone] = useState(false)
  const firstRef = useRef(null)
  const loopRef  = useRef(null)

  useEffect(() => {
    const el     = firstRef.current
    const loopEl = loopRef.current
    if (!el || !loopEl) return

    const onEnded = () => setFirstDone(true)

    const onTimeUpdate = () => {
      if (!el.duration || isNaN(el.duration)) return
      if (el.duration - el.currentTime <= 0.1 && loopEl.paused) {
        loopEl.play().catch(() => {})
      }
    }

    el.addEventListener('ended', onEnded)
    el.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [firstSrc])

  const base = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }

  return (
    <div className={`crossfade-videos ${className}`} style={{ position: 'absolute', inset: 0, ...style }}>
      <video ref={loopRef} src={loopSrc} loop muted playsInline preload="auto" style={{ ...base, zIndex: 1 }} />
      <video ref={firstRef} src={firstSrc} autoPlay muted playsInline
        style={{ ...base, zIndex: 2, opacity: firstDone ? 0 : 1 }} />
    </div>
  )
}
