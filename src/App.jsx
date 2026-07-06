import { useState, useCallback, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { main1, main2, main2loop } from './videoUrls'
import P3Menu from './P3Menu'
import ResumePage from './ResumePage'
import Socials from './Socials'
import AboutMe from './AboutMe'
import VolumePage from './VolumePage'
import SideProjects from './SideProjects'
import SeamlessVideo from './SeamlessVideo'
import CrossfadeVideos from './CrossfadeVideos'
import DonutTransition from './DonutTransition'
import MusicBars from './MusicBars'
import { sounds, musicPlayPause, musicNext, musicPrev } from './sounds'
import './App.css'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <div style={{
      position: 'absolute', top: 16, right: 16, zIndex: 20,
      fontFamily: "'Anton', sans-serif", color: '#fff',
      textAlign: 'right', pointerEvents: 'none',
      background: 'rgba(0,0,0,0.45)', borderRadius: 4,
      padding: '6px 12px', lineHeight: 1.25,
      border: '1px solid rgba(255,255,255,0.15)',
    }}>
      <div style={{ fontSize: 18, letterSpacing: 3, fontStyle: 'italic' }}>
        {now.getMonth() + 1}/{now.getDate()}&nbsp;<span style={{ fontSize: 13, letterSpacing: 2 }}>{DAYS[now.getDay()]}</span>
      </div>
      <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.85 }}>
        {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
      </div>
    </div>
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
      <MusicBars />
      <Clock />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
        @keyframes intro-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
        .intro-enter-btn {
          position: absolute;
          bottom: calc(10vh + 100px);
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
  const navigate   = useNavigate()
  const lastClick  = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const transiting = useRef(false)
  const [donutState, setDonutState] = useState(null)

  useEffect(() => {
    const onMouseDown = (e) => {
      lastClick.current = { x: e.clientX, y: e.clientY }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
        lastClick.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      }
      if (e.code === 'Space')                                { e.preventDefault(); musicPlayPause() }
      if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); musicNext() }
      if (e.ctrlKey && e.key === 'ArrowLeft')  { e.preventDefault(); musicPrev() }
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [])

  const startDonut = useCallback((onDone) => {
    if (transiting.current) return
    transiting.current = true
    const { x, y } = lastClick.current

    const sourceEl = document.getElementById('menu-screen')
    const sourceClone = sourceEl ? sourceEl.cloneNode(true) : null
    if (sourceClone) {
      sourceClone.querySelectorAll('audio').forEach(a => a.remove())
      const liveVideos = sourceEl ? [...sourceEl.querySelectorAll('video')] : []
      sourceClone.querySelectorAll('video').forEach((clonedV, i) => {
        const liveV = liveVideos[i]
        try {
          const canvas = document.createElement('canvas')
          canvas.width = liveV.videoWidth
          canvas.height = liveV.videoHeight
          canvas.getContext('2d').drawImage(liveV, 0, 0)
          const img = document.createElement('img')
          img.src = canvas.toDataURL('image/jpeg', 0.85)
          img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;'
          clonedV.replaceWith(img)
        } catch {
          clonedV.muted = true
        }
      })
    }

    setDonutState({ x, y, sourceClone, onDone })
  }, [])

  const handleDonutComplete = useCallback(() => {
    setDonutState(null)
    transiting.current = false
  }, [])

  const goToPage = useCallback((page) => {
    sounds.goIntoTab()
    startDonut(() => navigate(`/${page}`))
  }, [startDonut, navigate])

  const goBack = useCallback(() => {
    sounds.goOutTab()
    startDonut(() => navigate(-1))
  }, [startDonut, navigate])

  const handleEnter = useCallback(() => {
    sounds.goIntoTab()
    startDonut(() => setAppPhase('menu'))
  }, [startDonut])

  const handleBackToIntro = useCallback(() => {
    sounds.goOutTab()
    startDonut(() => setAppPhase('intro'))
  }, [startDonut])

  return (
    <>
      {appPhase === 'intro'
        ? <IntroScreen onEnter={handleEnter} />
        : (
          <Routes>
            <Route path="/"        element={<MenuScreen onNavigate={goToPage} onBack={handleBackToIntro} />} />
            <Route path="/about"   element={<AboutMe    onBack={goBack} />} />
            <Route path="/resume"  element={<ResumePage src={main2} onBack={goBack} />} />
            <Route path="/socials" element={<Socials    onBack={goBack} />} />
            <Route path="/volume"  element={<VolumePage onBack={goBack} />} />
            <Route path="/volume"  element={<VolumePage onBack={goBack} />} />
            <Route path="/sideproj" element={<SideProjects onBack={goBack} />} />
          </Routes>
        )
      }
      {donutState && (
        <DonutTransition
          x={donutState.x}
          y={donutState.y}
          sourceClone={donutState.sourceClone}
          onDone={donutState.onDone}
          onComplete={handleDonutComplete}
        />
      )}
    </>
  )
}
