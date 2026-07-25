'use client';

import Link from 'next/link';
import { motion, useAnimationFrame } from 'framer-motion';
import { useRef, useState } from 'react';
import Icon from './Icon';
import InteractiveTransitMap from '../shared/InteractiveTransitMap';

// ─── Route geometry ────────────────────────────────────────────────────────────
// viewBox 0 0 800 480. Path goes: Home (bottom-left) → Mid-stop → School (top-right)
const ROUTE_PATH = 'M 60 400 C 140 340, 180 370, 260 290 S 390 190, 470 240 S 600 310, 710 110';

function getPointAt(path: SVGPathElement, t: number) {
  const len = path.getTotalLength();
  return path.getPointAtLength(t * len);
}

// ─── Bus that animates along the SVG path ──────────────────────────────────────
function BusOnPath() {
  const pathRef = useRef<SVGPathElement>(null);
  const [pos, setPos] = useState({ x: 60, y: 400 });
  const progressRef = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!pathRef.current) return;
    progressRef.current = (progressRef.current + delta / 14000) % 1;
    const pt = getPointAt(pathRef.current, progressRef.current);
    setPos({ x: pt.x, y: pt.y });
  });

  return (
    <>
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 800 480"
        preserveAspectRatio="none"
      >
        {/* Travelled path (solid, lighter) */}
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="rgba(99,120,220,0.25)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Active route (animated draw-in) */}
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="#4f63d2"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="12 10"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Measurement-only invisible path */}
        <path ref={pathRef} d={ROUTE_PATH} fill="none" stroke="none" />
      </svg>

      {/* Bus icon, precisely positioned along path */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          left: `${(pos.x / 800) * 100}%`,
          top: `${(pos.y / 480) * 100}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-[#4f63d2]/50"
          style={{ width: 52, height: 52, marginLeft: -4, marginTop: -4 }}
        />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-[#4f63d2] text-white shadow-[0_8px_24px_rgba(79,99,210,.5)]">
          <Icon name="bus" className="h-5 w-5" />
        </div>
      </div>
    </>
  );
}

// ─── Map pin component ──────────────────────────────────────────────────────────
function Waypoint({
  xPct,
  yPct,
  label,
  state,
}: {
  xPct: number;
  yPct: number;
  label: string;
  state: 'done' | 'active' | 'upcoming';
}) {
  const dotStyles = {
    done: 'bg-[#4f63d2]/40 border-[#4f63d2]/40',
    active: 'bg-[#4f63d2] border-white shadow-[0_0_0_4px_rgba(79,99,210,.25)]',
    upcoming: 'bg-white border-[#c5cde8]',
  };
  const labelStyles = {
    done: 'text-[#9aa0be]',
    active: 'text-[#1a2050] font-extrabold',
    upcoming: 'text-[#6b7280]',
  };

  return (
    <div
      className="absolute z-10 flex flex-col items-center gap-1"
      style={{ left: `${xPct}%`, top: `${yPct}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* Active pulse */}
      {state === 'active' && (
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute h-5 w-5 rounded-full bg-[#4f63d2]/30"
        />
      )}
      <div className={`h-4 w-4 rounded-full border-2 ${dotStyles[state]}`} />
      <span
        className={`whitespace-nowrap rounded-md bg-white/90 px-2 py-0.5 text-[9px] tracking-wide shadow-sm backdrop-blur-sm ${labelStyles[state]}`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Stat row ──────────────────────────────────────────────────────────────────
function StatRow({
  label,
  value,
  valueColor = 'text-white',
  dot,
  pulse,
}: {
  label: string;
  value: string;
  valueColor?: string;
  dot?: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.07] last:border-0">
      <span className="flex items-center gap-2 text-[11px] font-medium text-white/50 tracking-wide">
        {dot && (
          <span className="relative flex h-1.5 w-1.5">
            {pulse && (
              <motion.span
                animate={{ scale: [1, 2.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inline-flex h-full w-full rounded-full ${dot} opacity-75`}
              />
            )}
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dot}`} />
          </span>
        )}
        {label}
      </span>
      <span className={`text-[12px] font-bold tabular-nums ${valueColor}`}>{value}</span>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function ConnectedJourney() {
  return (
    <>
      <section id="tracking" className="bg-[#f0f3ff] py-24 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* ── Section header ─────────────────────────────────────────────── */}
          {/* Balanced: eyebrow + headline left, supporting copy + live chip right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-end mb-12">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-[#4f63d2]">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                />
                Live Tracking
              </span>
              <h2 className="mt-3 text-[2.6rem] md:text-[3.25rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#0e1630]">
                The map parents<br />
                actually want<br className="hidden md:inline" /> to watch.
              </h2>
            </div>
            <div className="flex flex-col justify-end gap-5">
              <p className="text-[15px] leading-7 text-[#4a5380] max-w-sm">
                One living view of every moment that matters — not a vague "bus on route" notification.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Real-time GPS', 'Guardian alerts', 'Attendance sync'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#4f63d2]/20 bg-[#4f63d2]/8 px-3.5 py-1.5 text-[11px] font-semibold text-[#4f63d2]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Interactive Transit Map (Mapbox/Leaflet Light Vector Real-Road Map) ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <InteractiveTransitMap
              showInfoPanel={true}
              parentPortalHref="/parent"
              nextStopName="Maple Residency"
              etaMins="04"
              driverName="Rakesh Kumar"
              busNumber="Bus 04"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
