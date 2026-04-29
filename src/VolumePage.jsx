import { useState, useEffect, useRef } from "react"
import {
  sounds, getVolume, setVolume, getMusicVolume, setMusicVolume,
  SONGS, getMusicState, setMusicCallback, getMusicProgress, musicSeek,
  musicPlayPause, musicNext, musicPrev, musicSetTrack, musicToggleShuffle,
} from "./sounds"
import bgVideo from "./assets/main3.mp4"

const RADIO_TOTAL = SONGS.length + 1

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00"
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`
}

function VolumeSlider({ label, level, isFocused, onFocus, onSetLevel }) {
  return (
    <div
      className={`vol-slider${isFocused ? " focused" : ""}`}
      onClick={onFocus}
      onMouseEnter={onFocus}
    >
      <div className="vol-slider-header">
        <span className="vol-slider-cursor">{isFocused ? "►" : " "}</span>
        <span className="vol-slider-label">{label}</span>
      </div>
      <div className="vol-track">
        <div className="vol-bars">
          {Array.from({ length: 10 }, (_, i) => {
            const filled    = i < level
            const heightPct = 30 + (i + 1) * 7
            return (
              <div
                key={i}
                className="vol-bar"
                style={{
                  height: `${heightPct}%`,
                  background: filled
                    ? (isFocused ? "#ff2a2a" : "rgba(255,100,100,0.5)")
                    : "rgba(255,255,255,0.1)",
                  boxShadow: filled && isFocused ? "0 0 8px rgba(255,42,42,0.5)" : "none",
                }}
                onClick={(e) => { e.stopPropagation(); onSetLevel(i + 1) }}
              />
            )
          })}
        </div>
        <div className="vol-number" style={{ opacity: isFocused ? 1 : 0.4 }}>{level}</div>
      </div>
    </div>
  )
}

export default function VolumePage({ onBack }) {
  const [mounted,    setMounted]    = useState(false)
  const [focus,      setFocus]      = useState(0)
  const [radioIdx,   setRadioIdx]   = useState(0)
  const [sfxLevel,   setSfxLevel]   = useState(getVolume)
  const [musicLevel, setMusicLevel] = useState(getMusicVolume)
  const [progress,   setProgress]   = useState({ current: 0, duration: 0 })

  const init = getMusicState()
  const [trackIdx, setTrackIdx] = useState(init.idx)
  const [playing,  setPlaying]  = useState(init.playing)
  const [shuffle,  setShuffle]  = useState(init.shuffle)

  const progressBarRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setMusicCallback(({ idx, playing: p, shuffle: s }) => {
      setTrackIdx(idx); setPlaying(p); setShuffle(s)
    })
    return () => setMusicCallback(null)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setProgress(getMusicProgress()), 500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Backspace") { onBack(); return }

      if (focus === 0 || focus === 1) {
        if (e.key === "ArrowRight") adjustVol(1)
        if (e.key === "ArrowLeft")  adjustVol(-1)
        if (e.key === "ArrowUp") {
          sounds.itemNavigation()
          if (focus === 0) { setFocus(2); setRadioIdx(RADIO_TOTAL - 1) }
          else              setFocus(0)
        }
        if (e.key === "ArrowDown") {
          sounds.itemNavigation()
          if (focus === 1) { setFocus(2); setRadioIdx(0) }
          else              setFocus(1)
        }
      } else {
        if (e.key === "ArrowUp") {
          sounds.itemNavigation()
          if (radioIdx === 0) setFocus(1)
          else                setRadioIdx(r => r - 1)
        }
        if (e.key === "ArrowDown") {
          sounds.itemNavigation()
          if (radioIdx >= RADIO_TOTAL - 1) setFocus(0)
          else                              setRadioIdx(r => r + 1)
        }
        if (e.key === "Enter") {
          sounds.goIntoTab()
          if (radioIdx < SONGS.length) musicSetTrack(radioIdx)
          else                         musicToggleShuffle()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [focus, radioIdx, sfxLevel, musicLevel, onBack])

  function adjustVol(delta) {
    if (focus === 0) {
      const next = Math.max(1, Math.min(10, sfxLevel + delta))
      if (next === sfxLevel) return
      setSfxLevel(next); setVolume(next); sounds.volume()
    } else {
      const next = Math.max(1, Math.min(10, musicLevel + delta))
      if (next === musicLevel) return
      setMusicLevel(next); setMusicVolume(next)
    }
  }

  function setSfx(level)   { setSfxLevel(level);   setVolume(level);      sounds.volume() }
  function setMusic(level) { setMusicLevel(level);  setMusicVolume(level) }

  function handleProgressClick(e) {
    const rect = progressBarRef.current.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    musicSeek(pct * progress.duration)
  }

  const progressPct = progress.duration > 0
    ? (progress.current / progress.duration) * 100
    : 0

  return (
    <div id="menu-screen">
      <video src={bgVideo} autoPlay loop muted playsInline />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&display=swap');

        .vp-overlay {
          position: absolute; inset: 0; z-index: 10;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none; gap: 64px;
        }

        .vol-panel {
          pointer-events: all;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1);
        }
        .vol-panel.mounted { opacity: 1; transform: translateY(0); }

        .vol-panel-title {
          font-family: 'Anton', sans-serif; font-style: italic;
          font-size: 52px; letter-spacing: 4px; color: #ffffff;
          text-shadow: 0 0 24px rgba(196,0,26,0.8); margin-bottom: 16px;
        }

        .vol-slider {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 18px 24px; width: 340px; cursor: pointer;
          opacity: 0.38; transition: opacity 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          border: 1px solid transparent;
          clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        }
        .vol-slider.focused {
          opacity: 1;
          background: rgba(196,0,26,0.08);
          border-color: rgba(196,0,26,0.3);
        }

        .vol-slider-header { display: flex; align-items: center; gap: 10px; }

        .vol-slider-cursor {
          font-family: 'Anton', sans-serif; font-size: 16px; color: #ff2a2a;
          width: 16px; text-align: center; user-select: none;
        }

        .vol-slider-label {
          font-family: 'Anton', sans-serif; font-style: italic;
          font-size: 28px; letter-spacing: 4px; color: #ffffff;
        }

        .vol-track { display: flex; align-items: center; gap: 16px; }

        .vol-bars { display: flex; align-items: flex-end; gap: 5px; height: 52px; }

        .vol-bar {
          width: 19px; border-radius: 2px 2px 0 0; cursor: pointer;
          transition: background 0.15s ease, height 0.15s cubic-bezier(0.22,1,0.36,1);
        }
        .vol-bar:hover { filter: brightness(1.4); }

        .vol-number {
          font-family: 'Anton', sans-serif; font-style: italic;
          font-size: 56px; color: #ff2a2a; letter-spacing: 2px; line-height: 1;
          min-width: 48px; text-align: center;
          text-shadow: 0 0 24px rgba(255,42,42,0.5);
          transition: opacity 0.2s ease;
        }

        .vol-divider { width: 90%; height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0; }

        .vol-hint {
          font-family: 'Anton', sans-serif; font-size: 13px; letter-spacing: 3px;
          color: rgba(255,255,255,0.28); display: flex; gap: 20px; margin-top: 10px;
        }
        .vol-hint-key { border: 1px solid rgba(255,255,255,0.2); border-radius: 3px; padding: 1px 6px; font-size: 11px; }
        .vol-hint-row { display: flex; align-items: center; gap: 8px; }

        .music-panel {
          pointer-events: all;
          display: flex; flex-direction: column; align-items: stretch;
          width: min(420px, 38vw); opacity: 0; transform: translateY(24px);
          transition: opacity 0.38s ease 0.08s, transform 0.38s cubic-bezier(0.22,1,0.36,1) 0.08s;
        }
        .music-panel.mounted { opacity: 1; transform: translateY(0); }

        .music-panel-title {
          font-family: 'Anton', sans-serif; font-style: italic;
          font-size: 36px; letter-spacing: 4px; color: #ffffff;
          text-shadow: 0 0 24px rgba(196,0,26,0.8); margin-bottom: 12px; text-align: center;
        }

        .music-track-list {
          display: flex; flex-direction: column;
          background: rgba(8,14,52,0.92); border: 1px solid rgba(133,244,255,0.14);
          overflow: hidden;
        }

        .music-track-row {
          display: grid; grid-template-columns: 32px 1fr auto;
          align-items: center; gap: 10px; padding: 9px 16px 9px 14px;
          cursor: pointer; border-bottom: 1px solid rgba(133,244,255,0.07);
          transition: background 0.12s ease; user-select: none;
        }
        .music-track-row:last-child { border-bottom: none; }
        .music-track-row:hover { background: rgba(20,36,110,0.9); }
        .music-track-row.active { background: #ffffff; }
        .music-track-row.kbd { background: rgba(0,60,120,0.85); outline: 1px solid rgba(133,244,255,0.5); }
        .music-track-row.active.kbd { background: #d8f6ff; outline: 2px solid rgba(133,244,255,0.9); }
        .music-track-row.music-shuffle-row.active { background: rgba(196,0,26,0.22); }
        .music-track-row.music-shuffle-row.kbd { background: rgba(120,0,30,0.5); outline: 1px solid rgba(255,100,130,0.6); }

        .music-track-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 1px;
          color: rgba(133,244,255,0.6); text-align: center;
        }
        .music-track-row.active .music-track-num { color: #c4001a; font-size: 18px; }
        .music-track-row.kbd .music-track-num { color: rgba(133,244,255,1); }
        .music-track-row.music-shuffle-row.active .music-track-num { color: #ff4466; }

        .music-track-title {
          font-family: 'Anton', sans-serif; font-size: 16px; letter-spacing: 1px;
          color: rgba(220,250,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .music-track-row.active .music-track-title { color: #111111; }
        .music-track-row.kbd .music-track-title { color: #ffffff; }
        .music-track-row.music-shuffle-row.active .music-track-title { color: #ff4466; }

        .music-track-artist {
          font-family: 'Bebas Neue', sans-serif; font-size: 12px; letter-spacing: 1.5px;
          color: rgba(133,244,255,0.4); white-space: nowrap; flex-shrink: 0;
        }
        .music-track-row.active .music-track-artist { color: rgba(0,0,0,0.45); }
        .music-track-row.kbd .music-track-artist { color: rgba(133,244,255,0.7); }
        .music-track-row.music-shuffle-row.active .music-track-artist { color: #ff4466; }

        .music-progress-wrap {
          display: flex; flex-direction: column; gap: 5px;
          padding: 10px 14px 6px;
        }

        .music-progress-bar {
          width: 100%; height: 6px; background: rgba(255,255,255,0.1);
          border-radius: 3px; cursor: pointer; position: relative; overflow: hidden;
        }
        .music-progress-bar:hover { background: rgba(255,255,255,0.16); }

        .music-progress-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: #ff2a2a; border-radius: 3px;
          transition: width 0.4s linear;
          box-shadow: 0 0 6px rgba(255,42,42,0.5);
        }

        .music-progress-times {
          display: flex; justify-content: space-between;
          font-family: 'Bebas Neue', sans-serif; font-size: 12px; letter-spacing: 1.5px;
          color: rgba(133,244,255,0.45);
        }

        .music-controls {
          display: flex; align-items: center; justify-content: center;
          margin-top: 10px;
        }

        .music-btn {
          font-family: 'Anton', sans-serif; font-style: italic; font-size: 20px;
          color: rgba(255,255,255,0.55); background: rgba(8,14,52,0.88);
          border: 1px solid rgba(133,244,255,0.14); cursor: pointer;
          padding: 10px 22px; transition: color 0.15s ease, background 0.15s ease;
          user-select: none; letter-spacing: 2px;
        }
        .music-btn:first-child { clip-path: polygon(0 0, 100% 0, 100% 100%, 6px 100%); }
        .music-btn:last-child  { clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 100%, 0 100%); }
        .music-btn:hover { color: #ff2a2a; background: rgba(20,36,110,0.95); }
        .music-play-btn { font-size: 24px; padding: 10px 28px; color: #ff2a2a; border-left: none; border-right: none; }
        .music-play-btn:hover { color: #ff6666; }

        .vol-hint-media {
          font-family: 'Anton', sans-serif; font-size: 11px; letter-spacing: 2px;
          color: rgba(255,255,255,0.2); display: flex; gap: 14px; margin-top: 6px;
        }

      `}</style>

      <div className="vp-overlay">

        <div className={`vol-panel${mounted ? " mounted" : ""}`}>
          <div className="vol-panel-title">VOLUME</div>

          <VolumeSlider
            label="SFX"
            level={sfxLevel}
            isFocused={focus === 0}
            onFocus={() => { sounds.itemNavigation(); setFocus(0) }}
            onSetLevel={setSfx}
          />

          <div className="vol-divider" />

          <VolumeSlider
            label="MUSIC"
            level={musicLevel}
            isFocused={focus === 1}
            onFocus={() => { sounds.itemNavigation(); setFocus(1) }}
            onSetLevel={setMusic}
          />

          <div className="vol-hint">
            <div className="vol-hint-row"><span className="vol-hint-key">◄ ►</span><span>ADJUST</span></div>
            <div className="vol-hint-row"><span className="vol-hint-key">↑ ↓</span><span>SWITCH</span></div>
            <div className="vol-hint-row"><span className="vol-hint-key">ESC</span><span>BACK</span></div>
          </div>
        </div>

        <div className={`music-panel${mounted ? " mounted" : ""}`}>
          <div className="music-panel-title">RADIO</div>

          <div className="music-track-list">
            {SONGS.map((s, i) => {
              const isPlaying = trackIdx === i
              const isKbd     = focus === 2 && radioIdx === i
              return (
                <div
                  key={i}
                  className={["music-track-row", isPlaying ? "active" : "", isKbd ? "kbd" : ""].join(" ").trim()}
                  onClick={() => { sounds.goIntoTab(); musicSetTrack(i) }}
                >
                  <span className="music-track-num">
                    {isPlaying && playing ? "►" : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="music-track-title">{s.title}</span>
                  <span className="music-track-artist">{s.artist}</span>
                </div>
              )
            })}
            <div
              className={["music-track-row music-shuffle-row", shuffle ? "active" : "", focus === 2 && radioIdx === SONGS.length ? "kbd" : ""].join(" ").trim()}
              onClick={() => { sounds.goIntoTab(); musicToggleShuffle() }}
            >
              <span className="music-track-num">⇌</span>
              <span className="music-track-title">SHUFFLE</span>
              <span className="music-track-artist">{shuffle ? "ON" : "OFF"}</span>
            </div>
          </div>

          <div className="music-progress-wrap">
            <div className="music-progress-bar" ref={progressBarRef} onClick={handleProgressClick}>
              <div className="music-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="music-progress-times">
              <span>{formatTime(progress.current)}</span>
              <span>{formatTime(progress.duration)}</span>
            </div>
          </div>

          <div className="music-controls">
            <button className="music-btn" onClick={() => { sounds.itemNavigation(); musicPrev() }}>◄◄</button>
            <button className="music-btn music-play-btn" onClick={() => { sounds.goIntoTab(); musicPlayPause() }}>
              {playing ? "⏸" : "▶"}
            </button>
            <button className="music-btn" onClick={() => { sounds.itemNavigation(); musicNext() }}>▶▶</button>
          </div>
        </div>

      </div>
    </div>
  )
}
