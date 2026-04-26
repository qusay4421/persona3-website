import { useEffect, useRef, useState } from 'react'

export default function CrossfadeVideos({ firstSrc, loopSrc, className = '', style }) {
  const [phase, setPhase] = useState('first')
  const firstRef = useRef(null)

  useEffect(() => {
    const el = firstRef.current
    if (!el || phase !== 'first') return
    const onEnded = () => setPhase('loop')
    el.addEventListener('ended', onEnded)
    return () => el.removeEventListener('ended', onEnded)
  }, [phase, firstSrc])

  const base = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }

  return (
    <div className={`crossfade-videos ${className}`} style={{ position: 'absolute', inset: 0, ...style }}>
      {phase === 'first'
        ? <video ref={firstRef} key="first" src={firstSrc} autoPlay muted playsInline style={base} />
        : <video key="loop" src={loopSrc} autoPlay loop muted playsInline style={base} />
      }
    </div>
  )
}
