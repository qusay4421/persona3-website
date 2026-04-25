import { useState, useCallback, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import main1 from './assets/main1.mp4'
import main2 from './assets/main2.mp4'
import main3 from './assets/main3.mp4'
import main3loop from './assets/main3loop.mp4'
import P3Menu from './P3Menu'
import ResumePage from './ResumePage'
import Socials from './Socials'
import AboutMe from './AboutMe'
import VolumePage from './VolumePage'
import { sounds } from './sounds'
import './App.css'

function IntroScreen({ onEnter }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter') onEnter() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter])

  return (
    <div id="menu-screen">
      <video src={main1} autoPlay loop muted playsInline />
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
  const [looping, setLooping] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleEnded = () => setLooping(true)
    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <div id="menu-screen">
      {looping
        ? <video src={main3loop} autoPlay loop muted playsInline />
        : <video ref={videoRef} src={main3} autoPlay muted playsInline />
      }
      <P3Menu onNavigate={onNavigate} />
    </div>
  )
}

export default function App() {
  const [appPhase, setAppPhase] = useState('intro')
  const navigate = useNavigate()

  const goToPage = useCallback((path) => {
    sounds.goIntoTab()
    navigate(path)
  }, [navigate])

  const goBack = useCallback(() => {
    sounds.goOutTab()
    navigate(-1)
  }, [navigate])

  const handleEnter = useCallback(() => {
    sounds.goIntoTab()
    setAppPhase('menu')
  }, [])

  const handleBackToIntro = useCallback(() => {
    sounds.goOutTab()
    setAppPhase('intro')
  }, [])

  return appPhase === 'intro'
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
