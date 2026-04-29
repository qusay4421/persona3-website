import { useState, useEffect } from 'react'
import { sounds } from './sounds'
import mainm  from './assets/mainm.png'
import mainm2 from './assets/mainm2.png'
import mainf  from './assets/mainf.png'

const ITEMS = [
  {
    label: 'ABOUT ME',
    upper: [
      'QUSSAI ALBALKHI',
      'COMPUTER SCIENCE @ UNIVERSITY OF TORONTO',
      'GTA, ONTARIO · GRADUATING 2027',
    ],
    lower: 'qusayalbalkhi29@gmail.com',
    mainImg: mainm,
  },
  {
    label: 'EXPERIENCE',
    upper: [
      'TUTORED 20+ YOUTH LEARNERS IN PROGRAMMING AT EXCEED ROBOTICS',
      "IMPROVED STUDENTS' MATH & CALCULUS GRADES BY 40% AT LADY OF LEARNING",
      'VOLUNTEERED TECH SUPPORT TO 30+ COMMUNITY MEMBERS SINCE 2021',
    ],
    lower: 'TEACHING & COMMUNITY EXPERIENCE',
    mainImg: mainm2,
  },
  {
    label: 'PROJECTS',
    upper: [
      'BUILT A SIGN LANGUAGE DETECTOR USING ML & COMPUTER VISION (IN PROGRESS)',
      'RECREATED BALATRO CARD GAME FROM SCRATCH IN LUA / LÖVE2D',
      'CODED A SOKOBAN GAME ENTIRELY IN RISC-V ASSEMBLY',
    ],
    lower: 'HIGHLIGHT PROJECTS',
    mainImg: mainf,
  },
]

export default function ExperimentalAboutMe({ onBack }) {
  const [active,  setActive]  = useState(null)
  const [animKey, setAnimKey] = useState(0)

  function select(i) {
    sounds.goIntoTab()
    setActive(i)
    setAnimKey(k => k + 1)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (active !== null) { sounds.goOutTab(); setActive(null) }
        else onBack?.()
        return
      }
      if (e.key === 'ArrowLeft') {
        sounds.itemNavigation()
        setActive(prev => prev === null ? ITEMS.length - 1 : ((prev - 1) + ITEMS.length) % ITEMS.length)
        setAnimKey(k => k + 1)
      }
      if (e.key === 'ArrowRight') {
        sounds.itemNavigation()
        setActive(prev => prev === null ? 0 : (prev + 1) % ITEMS.length)
        setAnimKey(k => k + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onBack])

  const item = active !== null ? ITEMS[active] : null

  return (
    <>
      <style>{`
        @keyframes exp-slide-left {
          from { opacity: 0; transform: translateX(-48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes exp-slide-right {
          from { opacity: 0; transform: translateX(48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes exp-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes exp-dim-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── dim overlay ── */
        .exp-dim {
          position: absolute; inset: 0; z-index: 12;
          background: rgba(0,0,0,0.52);
          pointer-events: none;
          animation: exp-dim-in 0.3s ease both;
        }

        /* ── info panel (left diagonal parallelogram) ── */
        .exp-info-bg {
          position: absolute; inset: 0; z-index: 14;
          background: rgba(8,12,40,0.96);
          clip-path: polygon(0% 26%, 63% 10%, 61% 57%, 0% 68%);
          pointer-events: none;
          animation: exp-slide-left 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        /* thin red accent along the top edge */
        .exp-info-accent {
          position: absolute; inset: 0; z-index: 15;
          background: linear-gradient(
            125deg,
            transparent 0%,
            transparent 25.5%,
            #c4001a 25.5%,
            #c4001a calc(25.5% + 4px),
            transparent calc(25.5% + 4px)
          );
          clip-path: polygon(0% 26%, 63% 10%, 61% 11%, 0% 27%);
          pointer-events: none;
          animation: exp-slide-left 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* text sits in rectangular space inside the clipped zone */
        .exp-info-text {
          position: absolute;
          top: 33%;
          left: 8%;
          width: 47%;
          z-index: 17;
          pointer-events: none;
          animation: exp-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.18s both;
        }
        .exp-upper-line {
          font-family: 'Montserrat', sans-serif;
          font-weight: 300;
          font-size: 18px;
          color: #ffffff;
          letter-spacing: 0.5px;
          line-height: 1.6;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .exp-upper-line:last-of-type { border-bottom: none; }
        .exp-lower-line {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 21px;
          letter-spacing: 4px;
          color: rgba(196,0,26,0.9);
          margin-top: 18px;
        }

        /* ── character image panel (irregular polygon matching user sketch) ── */
        .exp-char-wrap {
          position: absolute;
          left: 52%;   /* ← horizontal start of the container (% from left edge of page) */
          top: 0;      /* ← vertical start of the container (0 = top of page) */
          width: 48%;  /* ← container width — must equal (100% - left) to reach the right edge */
          height: 100%; /* ← container height (100% = full page height) */
          z-index: 15;
          overflow: hidden;
          pointer-events: none;
          background: #dcdcdc; /* ← white-grey backdrop behind transparent PNG areas */
          /*
            Clip-path vertices are in LOCAL % coordinates of this container.
            If you change left/width above, recalculate each x as:
              local_x = (global_x - left) / width * 100
            Current mapping (left=52, width=48):
              global 63% → local 23%    global 100% → local 100%
              global 82% → local 63%    global 55%  → local  6%
              global 52% → local  0%
          */
          clip-path: polygon(
            23%  0%,   /* top-left of shape — diagonal boundary starts here */
            100%  0%,  /* top-right corner of page */
            100% 50%,  /* right edge mid-point — diagonal cuts back left from here */
             63% 100%, /* bottom-right — end of the right-side diagonal */
              6% 100%, /* bottom of the left notch */
              6%  78%,  /* notch step (small horizontal ledge) */
              0%  75%   /* notch apex — deepest concave point on the left */
          );
          animation: exp-slide-right 0.5s cubic-bezier(0.22,1,0.36,1) 0.06s both;
        }
        .exp-char-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center; /* ← shift focus point: "center top" keeps face visible */
        } 

        /* ── section selector tabs at bottom ── */
        .exp-tabs {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 20;
          pointer-events: all;
          white-space: nowrap;
        }
        .exp-tab-btn {
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 18px;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.4);
          background: rgba(8,12,40,0.8);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 10px 28px;
          cursor: pointer;
          clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
          transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
          user-select: none;
        }
        .exp-tab-btn:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(20,30,80,0.9);
        }
        .exp-tab-btn.exp-tab-active {
          color: #ffffff;
          background: rgba(196,0,26,0.85);
          border-color: rgba(196,0,26,0.5);
        }

        /* ── keyboard hints ── */
        .exp-hint {
          position: absolute;
          top: 20px; right: 24px;
          z-index: 20;
          display: flex; flex-direction: column;
          gap: 6px; align-items: flex-end;
          pointer-events: none;
        }
        .exp-hint-row {
          font-family: 'Anton', sans-serif;
          font-size: 12px; letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
          display: flex; align-items: center; gap: 7px;
        }
        .exp-hint-key {
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 3px;
          padding: 1px 6px; font-size: 10px;
        }
      `}</style>

      {item && <div key={`dim-${animKey}`}  className="exp-dim" />}
      {item && <div key={`bg-${animKey}`}   className="exp-info-bg" />}
      {item && <div key={`acc-${animKey}`}  className="exp-info-accent" />}

      {item && (
        <div key={`text-${animKey}`} className="exp-info-text">
          {item.upper.map((line, i) => (
            <div key={i} className="exp-upper-line">{line}</div>
          ))}
          <div className="exp-lower-line">{item.lower}</div>
        </div>
      )}

      {item && (
        <div key={`char-${animKey}`} className="exp-char-wrap">
          <img className="exp-char-img" src={item.mainImg} alt="" />
        </div>
      )}

      <div className="exp-tabs">
        {ITEMS.map((it, i) => (
          <button
            key={i}
            className={`exp-tab-btn${active === i ? ' exp-tab-active' : ''}`}
            onClick={() => select(i)}
          >
            {it.label}
          </button>
        ))}
      </div>

      <div className="exp-hint">
        <div className="exp-hint-row"><span className="exp-hint-key">◄ ►</span><span>BROWSE</span></div>
        <div className="exp-hint-row"><span className="exp-hint-key">ESC</span><span>BACK</span></div>
      </div>
    </>
  )
}
