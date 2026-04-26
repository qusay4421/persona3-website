import { useState, useCallback, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import main1 from './assets/main1.mp4'
import main2 from './assets/main2.mp4'
import main2loop from './assets/main2loop.mp4'
import main3 from './assets/main3.mp4'
import P3Menu from './P3Menu'
import ResumePage from './ResumePage'
import Socials from './Socials'
import AboutMe from './AboutMe'
import VolumePage from './VolumePage'
import SeamlessVideo from './SeamlessVideo'
import CrossfadeVideos from './CrossfadeVideos'
import { sounds } from './sounds'
import './App.css'

function RippleOverlay({ x, y, phase }) {
  const [size, setSize] = useState('0px')

  useEffect(() => {
    if (phase === 'in') {
      const id = requestAnimationFrame(() => setSize('200vmax'))
      return () => cancelAnimationFrame(id)
    } else {
      setSize('0px')
    }
  }, [phase])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: `radial-gradient(circle at ${x}px ${y}px, #00213d 0%, #000c1e 50%, #000610 100%)`,
        clipPath: `circle(${size} at ${x}px ${y}px)`,
        transition: phase === 'in'
          ? 'clip-path 0.45s cubic-bezier(0.4, 0, 1, 1)'
          : 'clip-path 0.4s cubic-bezier(0, 0, 0.6, 1)',
        pointerEvents: 'all',
      }}
    />
  )
}

function IntroScreen({ onEnter }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter') onEnter() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter])

  return (
    <div id="menu-screen">
      <SeamlessVideo src={main1} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
        @keyframes intro-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
        .intro-enter-btn {
          position: absolute;
          bottom: 10vh;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .intro-enter-label {
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 28px;
          letter-spacing: 6px;
          color: #ffffff;
          text-shadow: 0 0 24px rgba(196,0,26,0.9);
          animation: intro-blink 1.4s ease-in-out infinite;
          user-select: none;
        }
        .intro-enter-bar {
          width: 2px;
          height: 32px;
          background: #c4001a;
          animation: intro-blink 1.4s ease-in-out infinite;
        }
      `}</style>
      <button className="intro-enter-btn" onClick={onEnter}>
        <div className="intro-enter-label">PRESS ENTER</div>
        <div className="intro-enter-bar" />
      </button>
    </div>
  )
}

function MenuScreen({ onNavigate, onBack }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <div id="menu-screen">
      <CrossfadeVideos firstSrc={main2} loopSrc={main2loop} />
      <P3Menu onNavigate={onNavigate} />
    </div>
  )
}

export default function App() {
  const [appPhase, setAppPhase] = useState('intro')
  const navigate = useNavigate()
  const lastClick = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [ripple, setRipple] = useState(null)
  const transiting = useRef(false)

  useEffect(() => {
    const onMouseDown = (e) => {
      lastClick.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [])

  const withRipple = useCallback((navFn) => {
    if (transiting.current) return
    transiting.current = true
    const { x, y } = lastClick.current
    setRipple({ x, y, phase: 'in' })
    setTimeout(() => {
      navFn()
      setRipple({ x, y, phase: 'out' })
      setTimeout(() => {
        setRipple(null)
        transiting.current = false
      }, 420)
    }, 460)
  }, [])

  const goToPage = useCallback((path) => {
    sounds.goIntoTab()
    withRipple(() => navigate(path))
  }, [navigate, withRipple])

  const goBack = useCallback(() => {
    sounds.goOutTab()
    withRipple(() => navigate(-1))
  }, [navigate, withRipple])

  const handleEnter = useCallback(() => {
    sounds.goIntoTab()
    withRipple(() => setAppPhase('menu'))
  }, [withRipple])

  const handleBackToIntro = useCallback(() => {
    sounds.goOutTab()
    withRipple(() => setAppPhase('intro'))
  }, [withRipple])

  return (
    <>
      {appPhase === 'intro'
        ? <IntroScreen onEnter={handleEnter} />
        : (
          <Routes>
            <Route path="/"        element={<MenuScreen onNavigate={(page) => goToPage(`/${page}`)} onBack={handleBackToIntro} />} />
            <Route path="/about"   element={<AboutMe    onBack={goBack} />} />
            <Route path="/resume"  element={<ResumePage src={main2} onBack={goBack} />} />
            <Route path="/socials" element={<Socials    onBack={goBack} />} />
            <Route path="/volume"  element={<VolumePage onBack={goBack} />} />
          </Routes>
        )
      }
      {ripple && <RippleOverlay x={ripple.x} y={ripple.y} phase={ripple.phase} />}
    </>
  )
}
