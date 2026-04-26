import { useRef, useEffect, useState } from 'react';

const WOBBLE_BANDS = [
  { count: 3, amp: 0.18, phase: 0.6 },
  { count: 6, amp: 0.08, phase: 1.2 },
  { count: 11, amp: 0.04, phase: 2.0 },
];

function blobRadius(theta, t, baseR) {
  let r = 1;
  for (const b of WOBBLE_BANDS) {
    r += Math.sin(theta * b.count + t * b.phase) * b.amp;
  }
  return baseR * r;
}

function blobPathD(cx, cy, baseR, t, phaseOffset = 0) {
  if (baseR <= 0) return '';
  const STEPS = 96;
  let d = '';
  for (let i = 0; i <= STEPS; i++) {
    const theta = (i / STEPS) * Math.PI * 2 + phaseOffset;
    const r = blobRadius(theta, t, baseR);
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r;
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
  }
  return d + 'Z';
}

const easeInPop  = (t) => 1 - Math.pow(1 - t, 2);
const easeInGrow = (t) => 1 - Math.pow(1 - t, 2.6);
const easeOutHole = (t) => Math.pow(t, 1.6);

const DEFAULTS = {
  popRadius: 110,
  popDuration: 0.30,
  blobColor: 'rgb(0, 60, 255)',
  blendMode: 'color',
};

let CLIP_ID_COUNTER = 0;

export default function RippleTransition({
  x,
  y,
  phase,
  inDuration = 920,
  outDuration = 380,
  popRadius = DEFAULTS.popRadius,
  popDuration = DEFAULTS.popDuration,
  blobColor = DEFAULTS.blobColor,
  blendMode = DEFAULTS.blendMode,
}) {
  const [id] = useState(() => `ink-hole-${++CLIP_ID_COUNTER}`);
  const donutPathRef = useRef(null);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const outerREndRef = useRef(0);

  useEffect(() => {
    const donutEl = donutPathRef.current;
    if (!donutEl) return;
    cancelAnimationFrame(rafRef.current);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const corners = [[0, 0], [W, 0], [0, H], [W, H]]
      .map(([cx, cy]) => Math.hypot(cx - x, cy - y));
    const maxR = Math.max(...corners) * 1.18;

    startRef.current = 0;

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const wt = elapsed / 1000;

      let outerR;
      let innerR;

      if (phase === 'in') {
        const t = Math.min(1, elapsed / inDuration);
        if (t < popDuration) {
          outerR = easeInPop(t / popDuration) * popRadius;
        } else {
          const t2 = (t - popDuration) / (1 - popDuration);
          outerR = popRadius + easeInGrow(t2) * (maxR - popRadius);
        }
        innerR = 0;
        outerREndRef.current = outerR;
        donutEl.setAttribute('fill-opacity', '0.65');

        if (t < 1) rafRef.current = requestAnimationFrame(tick);
        else {
          outerREndRef.current = maxR;
          donutEl.setAttribute('fill-opacity', '1');
          donutEl.setAttribute('d', blobPathD(x, y, maxR, wt, 0));
          return;
        }
      } else {
        const outOuter = outerREndRef.current || maxR;
        const t = Math.min(1, elapsed / outDuration);
        outerR = outOuter;
        innerR = easeOutHole(t) * outOuter;
        donutEl.setAttribute('fill-opacity', '1');

        if (t < 1) rafRef.current = requestAnimationFrame(tick);
        else {
          donutEl.setAttribute('d', '');
          return;
        }
      }

      const outerD = blobPathD(x, y, outerR, wt, 0);
      const innerD = innerR > 0 ? blobPathD(x, y, innerR, wt, 1.3) : '';
      donutEl.setAttribute('d', outerD + ' ' + innerD);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [x, y, phase, inDuration, outDuration, popRadius, popDuration]);

  return (
    <svg
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        mixBlendMode: phase === 'in' ? blendMode : 'normal',
      }}
      aria-hidden="true"
    >
      <path
        ref={donutPathRef}
        d=""
        fill={phase === 'in' ? blobColor : '#000810'}
        fillRule="evenodd"
      />
    </svg>
  );
}
