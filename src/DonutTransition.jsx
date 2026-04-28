import { useRef, useEffect, useLayoutEffect } from 'react'

const WOBBLE_BANDS = [
  { count: 3,  amp: 0.18, phase: 0.6 },
  { count: 6,  amp: 0.08, phase: 1.2 },
  { count: 11, amp: 0.04, phase: 2.0 },
]

function blobRadius(theta, t, baseR) {
  let r = 1
  for (const b of WOBBLE_BANDS) {
    r += Math.sin(theta * b.count + t * b.phase) * b.amp
  }
  return baseR * r
}

function blobPathD(cx, cy, baseR, t, phaseOffset = 0) {
  if (baseR <= 0) return ''
  const STEPS = 96
  let d = ''
  for (let i = 0; i <= STEPS; i++) {
    const theta = (i / STEPS) * Math.PI * 2 + phaseOffset
    const r = blobRadius(theta, t, baseR)
    const px = cx + Math.cos(theta) * r
    const py = cy + Math.sin(theta) * r
    d += (i === 0 ? 'M' : 'L') + px.toFixed(1) + ',' + py.toFixed(1) + ' '
  }
  return d + 'Z'
}

const easeInPop   = (t) => 1 - Math.pow(1 - t, 2)
const easeInGrow  = (t) => 1 - Math.pow(1 - t, 2.6)
const easeOutHole = (t) => Math.pow(t, 1.4)

const SOURCE_CLIP_ID = 'donut-source-clip'
const POP_R          = 110
const POP_T          = 0.12
const OUTER_FULL_T   = 0.58

// The real destination is already rendered at z:0 (navigation fired immediately).
// sourceClone is a frozen DOM snapshot of the page being left.
// It covers the screen (minus the growing hole) so the destination shows through.
export default function DonutTransition({
  x,
  y,
  sourceClone,
  totalDuration = 867,
  blobColor = 'rgb(0, 60, 255)',
  onComplete,
  onDone,
}) {
  const sourceContainerRef = useRef(null)
  const sourceClipEl       = useRef(null)
  const blobPathEl         = useRef(null)
  const rafRef             = useRef(0)
  const startRef           = useRef(null)
  const doneRef            = useRef(false)

  // Append the frozen clone and immediately set the full-screen clip so the clone
  // is visible from the very first paint (empty clipPath d="" hides everything).
  useLayoutEffect(() => {
    const el = sourceContainerRef.current
    if (!el || !sourceClone) return
    el.appendChild(sourceClone)
    if (sourceClipEl.current) {
      const W = window.innerWidth
      const H = window.innerHeight
      sourceClipEl.current.setAttribute('d', `M0,0 H${W} V${H} H0 Z`)
    }
  }, [sourceClone])

  // Navigate AFTER the clone is painted so the clone is always visible before
  // the old page unmounts — prevents the black-flash between commits.
  useEffect(() => {
    onDone?.()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const W = window.innerWidth
    const H = window.innerHeight
    const maxR = Math.max(
      Math.hypot(x,     y),
      Math.hypot(W - x, y),
      Math.hypot(x,     H - y),
      Math.hypot(W - x, H - y),
    ) * 1.18

    doneRef.current  = false
    startRef.current = null

    const tick = (now) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const wt = elapsed / 1000
      const t  = Math.min(1, elapsed / totalDuration)

      // Outer blob boundary
      let outerR
      if (t < POP_T) {
        outerR = easeInPop(t / POP_T) * POP_R
      } else if (t < OUTER_FULL_T) {
        const t2 = (t - POP_T) / (OUTER_FULL_T - POP_T)
        outerR = POP_R + easeInGrow(t2) * (maxR - POP_R)
      } else {
        outerR = maxR
      }

      // Inner hole — opens after pop, grows to maxR by end
      let innerR = 0
      if (t >= POP_T) {
        const holeT = (t - POP_T) / (1 - POP_T)
        innerR = easeOutHole(holeT) * maxR
      }

      const W2 = window.innerWidth
      const H2 = window.innerHeight

      // Source clip: full screen minus hole (evenodd excludes hole area)
      if (sourceClipEl.current) {
        const fullRect = `M0,0 H${W2} V${H2} H0 Z`
        const holeD    = innerR > 0 ? blobPathD(x, y, innerR, wt, 1.3) : ''
        sourceClipEl.current.setAttribute('d', fullRect + (holeD ? ' ' + holeD : ''))
      }

      // Blob ring tint: outer minus inner (evenodd = ring shape, tints the source clone)
      if (blobPathEl.current) {
        const outerD = outerR > 0 ? blobPathD(x, y, outerR, wt, 0)   : ''
        const innerD = innerR > 0 ? blobPathD(x, y, innerR, wt, 1.3) : ''
        blobPathEl.current.setAttribute('d', outerD + (innerD ? ' ' + innerD : ''))
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else if (!doneRef.current) {
        doneRef.current = true
        onComplete?.()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [x, y, totalDuration, onComplete])

  return (
    <>
      {/* SVG defs: clip path that keeps source visible everywhere except the hole */}
      <svg
        style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={SOURCE_CLIP_ID} clipPathUnits="userSpaceOnUse">
            <path ref={sourceClipEl} clipRule="evenodd" />
          </clipPath>
        </defs>
      </svg>

      {/* Frozen source clone — covers screen minus hole, reveals real destination below */}
      <div
        ref={sourceContainerRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9991,
          clipPath: `url(#${SOURCE_CLIP_ID})`,
          pointerEvents: 'none',
        }}
      />

      {/* Blob ring tint — colors the source clone in the ring area */}
      <svg
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9992,
          width: '100vw',
          height: '100vh',
          mixBlendMode: 'color',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <path ref={blobPathEl} d="" fill={blobColor} fillRule="evenodd" />
      </svg>
    </>
  )
}
