import { useState, useEffect } from "react";
import { sounds } from "./sounds";

// Edit this list to add, remove, or reorder projects.
const PROJECTS = [
  {
    id: "asl",
    label: "ASL TRANSLATOR",
    desc: "Real-time sign language recognition in the browser. MediaPipe + LSTM, TensorFlow.js.",
    href: "https://github.com/qusay4421/ASLTranslator",
  },
  {
    id: "pathfinder",
    label: "PATHFINDER",
    desc: "UofT course planning dashboard. React, Vite, Supabase.",
    href: "https://github.com/qusay4421/PathFinder",
  },
  {
    id: "dynamo",
    label: "DYNAMO-LITE",
    desc: "Distributed, sharded, replicated key-value store in Go with tunable quorums.",
    href: "https://github.com/qusay4421/dynamo-lite",
  },
  {
    id: "igloo",
    label: "IGLOO SITE",
    desc: "Interactive WebGL studio site. Custom GLSL ice shaders, React Three Fiber, GSAP.",
    href: "https://github.com/qusay4421/igloo-site",
  },
  {
    id: "crdt",
    label: "CRDT-RS",
    desc: "State-based CRDTs in Rust with property tests for the convergence laws.",
    href: "https://github.com/qusay4421/crdt-rs",
  },
];

export default function SideProjects({ onBack }) {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowUp")   { sounds.itemNavigation(); setActive(i => (i - 1 + PROJECTS.length) % PROJECTS.length); }
      if (e.key === "ArrowDown") { sounds.itemNavigation(); setActive(i => (i + 1) % PROJECTS.length); }
      if (e.key === "Enter")     window.open(PROJECTS[active].href, "_blank");
      if (e.key === "Escape" || e.key === "Backspace" || e.key === "ArrowLeft") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onBack]);

  return (
    <div id="menu-screen" style={{ background: "#07070c" }}>
      <style>{`
        .sp-root {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 8vw;
          gap: 10px;
        }

        .sp-title {
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 96px;
          letter-spacing: 2px;
          line-height: 0.9;
          color: #ff2a2a;
          text-shadow: 4px 4px 0 rgba(0,0,0,0.6);
          transform: skewX(-6deg);
          margin-bottom: 28px;
          user-select: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .sp-title.mounted { opacity: 1; }

        .sp-row {
          position: relative;
          cursor: pointer;
          max-width: 720px;
          padding: 10px 22px;
          text-decoration: none;
          opacity: 0;
          transform: translateX(36px) skewX(-6deg);
          transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1), background 0.15s ease;
        }
        .sp-row.mounted { opacity: 1; transform: translateX(0) skewX(-6deg); }
        .sp-row.active  { background: #ffffff; }

        .sp-label {
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 44px;
          letter-spacing: 2px;
          line-height: 0.95;
          color: #3ce2ff;
          transition: color 0.12s ease;
          user-select: none;
          white-space: nowrap;
        }
        .sp-row.active .sp-label { color: #6b0010; }
        .sp-row:hover:not(.active) .sp-label { color: #00d9ff; }

        .sp-desc {
          font-family: 'Anton', sans-serif;
          font-size: 15px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.45);
          margin-top: 4px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.25s ease;
        }
        .sp-row.active .sp-desc { max-height: 60px; color: rgba(60,0,10,0.75); }

        .sp-hint {
          position: absolute;
          bottom: 24px; right: 28px;
          z-index: 20;
          font-family: 'Anton', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.28);
          user-select: none;
        }
      `}</style>

      <div className="sp-root">
        <div className={`sp-title ${mounted ? "mounted" : ""}`}>SIDE PROJECTS</div>
        {PROJECTS.map((p, i) => (
          <a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className={`sp-row ${active === i ? "active" : ""} ${mounted ? "mounted" : ""}`}
            style={{ transitionDelay: mounted ? `${i * 70}ms` : "0ms" }}
            onMouseEnter={() => { sounds.itemNavigation(); setActive(i); }}
          >
            <span className="sp-label">{p.label}</span>
            <div className="sp-desc">{p.desc}</div>
          </a>
        ))}
      </div>

      <div className="sp-hint">ENTER: OPEN &nbsp;·&nbsp; ESC: BACK</div>
    </div>
  );
}
