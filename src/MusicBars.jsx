import { useEffect, useRef } from 'react'
import { getMusicAnalyser, resumeMusicCtx, getMusicVolume } from './sounds'

const BAR_COUNT       = 80
const GAP             = 3
const LOWER_FREQ      = 50
const UPPER_FREQ      = 10000
const NOISE_REDUCTION = 0.77
const SENSITIVITY     = 1.5

const BAR_AMP = Array.from({ length: BAR_COUNT }, () => 0.5 + Math.random() * 0.5)

export default function MusicBars() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const setSize = () => {
      canvas.width  = window.innerWidth
      canvas.height = Math.round(window.innerHeight * 0.225)
    }
    setSize()
    window.addEventListener('resize', setSize)

    const analyser  = getMusicAnalyser()
    const bufferLen = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLen)
    const smoothed  = new Float32Array(BAR_COUNT)

    // Resume AudioContext on any user interaction
    resumeMusicCtx()
    const resume = () => resumeMusicCtx()
    document.addEventListener('click',   resume)
    document.addEventListener('keydown', resume)

    // Log-scale frequency map: LOWER_FREQ → UPPER_FREQ
    const nyquist = 24000 // standard 48 kHz sample rate / 2
    const freqMap = Array.from({ length: BAR_COUNT }, (_, i) => {
      const hz = LOWER_FREQ * Math.pow(UPPER_FREQ / LOWER_FREQ, i / (BAR_COUNT - 1))
      return Math.min(Math.round((hz / nyquist) * bufferLen), bufferLen - 1)
    })

    const fallSpeed = (1 - NOISE_REDUCTION) * 0.4
    let rafId

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      // Square-root curve: boosts low volumes without affecting the top end
      const volScale = Math.sqrt(getMusicVolume() / 10)

      const ctx = canvas.getContext('2d')
      const W   = canvas.width
      const H   = canvas.height
      ctx.clearRect(0, 0, W, H)

      const barW = (W - GAP * (BAR_COUNT - 1)) / BAR_COUNT

      for (let i = 0; i < BAR_COUNT; i++) {
        const target = Math.min(1,
          (dataArray[freqMap[i]] / 255) * BAR_AMP[i] * SENSITIVITY * volScale
        )

        smoothed[i] += target > smoothed[i]
          ? (target - smoothed[i]) * 0.5
          : (target - smoothed[i]) * fallSpeed

        const val  = Math.max(0.01, smoothed[i])
        const barH = Math.max(3, val * H)
        const x    = i * (barW + GAP)

        ctx.globalAlpha = 0.4 + val * 0.6
        ctx.fillStyle   = '#ffffff'
        ctx.fillRect(x, H - barH, barW, barH)
      }
      ctx.globalAlpha = 1
    }

    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', setSize)
      document.removeEventListener('click',   resume)
      document.removeEventListener('keydown', resume)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '22.5vh',
        pointerEvents: 'none',
        zIndex: 15,
      }}
    />
  )
}
