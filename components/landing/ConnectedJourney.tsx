'use client';

import Link from 'next/link';
import { motion, useAnimationFrame } from 'framer-motion';
import { useRef, useState } from 'react';
import Icon from './Icon';

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

          {/* ── Main card ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid overflow-hidden rounded-[28px] shadow-[0_32px_80px_rgba(15,20,80,.18)] lg:grid-cols-[1.55fr_1fr]"
            style={{ background: '#0e1630' }}
          >
            {/* ── Map panel (Realistic Vector & Satellite Hybrid Aesthetic) ──────── */}
            <div className="relative min-h-[520px] overflow-hidden bg-[#e2ebd8]">

              {/* Realistic Map Vector SVG (Water, Parks, Buildings, Highways, Street Labels) */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full pointer-events-none"
                viewBox="0 0 800 480"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Neon Route Glow Filter */}
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f63d2" />
                  </linearGradient>
                </defs>

                {/* 1. Natural Green Parks & Landuse Zones */}
                <rect x="30" y="20" width="160" height="110" rx="16" fill="#bbf7d0" opacity="0.75" />
                <rect x="460" y="260" width="130" height="100" rx="16" fill="#86efac" opacity="0.65" />
                <rect x="660" y="110" width="120" height="110" rx="16" fill="#bbf7d0" opacity="0.7" />
                <rect x="30" y="290" width="130" height="110" rx="16" fill="#bbf7d0" opacity="0.6" />
                <rect x="520" y="20" width="120" height="80" rx="14" fill="#a7f3d0" opacity="0.65" />

                {/* 2. Realistic Blue River & Bridges */}
                <path
                  d="M -10 320 C 180 340, 240 180, 500 160 C 650 150, 750 60, 810 20"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="32"
                  opacity="0.8"
                />
                <path
                  d="M -10 320 C 180 340, 240 180, 500 160 C 650 150, 750 60, 810 20"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="8"
                  opacity="0.3"
                />

                {/* 3. Urban Building Footprints */}
                <g fill="#cbd5e1" opacity="0.65">
                  {/* Block 1 */}
                  <rect x="50" y="150" width="30" height="24" rx="4" />
                  <rect x="90" y="150" width="40" height="24" rx="4" />
                  <rect x="50" y="180" width="80" height="30" rx="4" />
                  
                  {/* Block 2 */}
                  <rect x="220" y="40" width="50" height="35" rx="4" />
                  <rect x="280" y="40" width="60" height="35" rx="4" />
                  <rect x="220" y="85" width="120" height="30" rx="4" />

                  {/* Block 3 */}
                  <rect x="480" y="40" width="30" height="40" rx="4" />
                  <rect x="480" y="90" width="30" height="40" rx="4" />

                  {/* Block 4 */}
                  <rect x="600" y="290" width="50" height="40" rx="4" />
                  <rect x="660" y="290" width="60" height="40" rx="4" />
                  <rect x="600" y="340" width="120" height="35" rx="4" />
                </g>

                {/* 4. Secondary Neighborhood Streets */}
                <g stroke="#ffffff" strokeWidth="9" opacity="0.8" strokeLinecap="round">
                  <path d="M 0 130 Q 400 120 800 130" />
                  <path d="M 0 370 Q 400 380 800 370" />
                  <path d="M 210 0 Q 230 240 210 480" />
                  <path d="M 600 0 Q 580 240 600 480" />
                </g>

                {/* 5. Major Dual-Carriageway Highway */}
                <path d="M 0 240 Q 400 220 800 240" fill="none" stroke="#ffffff" strokeWidth="26" />
                <path d="M 0 240 Q 400 220 800 240" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="10 8" />

                <path d="M 400 0 Q 420 240 400 480" fill="none" stroke="#ffffff" strokeWidth="22" />
                <path d="M 400 0 Q 420 240 400 480" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="10 8" />

                {/* Major Highway Intersections */}
                <circle cx="400" cy="230" r="22" fill="#ffffff" />
                <circle cx="400" cy="230" r="14" fill="#fbbf24" opacity="0.4" />
                <circle cx="210" cy="235" r="14" fill="#ffffff" />
                <circle cx="600" cy="235" r="14" fill="#ffffff" />

                {/* 6. Street Name Labels (Vector Typography) */}
                <text x="70" y="222" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">
                  RING ROAD EXPWY
                </text>
                <text x="412" y="70" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">
                  AUROBINDO MARG
                </text>
                <text x="220" y="360" fill="#475569" fontSize="9" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">
                  SAKET AVE
                </text>
                <text x="610" y="275" fill="#475569" fontSize="9" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">
                  GREEN PARK BLVD
                </text>
                <text x="260" y="195" fill="#0284c7" fontSize="9" fontFamily="sans-serif" fontWeight="800" letterSpacing="0.5">
                  YAMUNA CANAL
                </text>
              </svg>

              {/* Satellite Grid Overlay for Realistic Depth */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Route + moving bus */}
              <BusOnPath />

              {/* Waypoints — matched to path geometry (viewBox 800×480) */}
              {/* Home ≈ M 60 400 → 7.5%, 83% */}
              <Waypoint xPct={7.5} yPct={83} label="Home" state="done" />
              {/* Mid-stop ≈ 260 290 → 32.5%, 60% */}
              <Waypoint xPct={32.5} yPct={60} label="Maple Residency" state="active" />
              {/* School ≈ 710 110 → 88.75%, 23% */}
              <Waypoint xPct={88.75} yPct={23} label="School" state="upcoming" />

              {/* Live status chip — top-left */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute left-5 top-5 flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.1)] backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <motion.span
                    animate={{ scale: [1, 2.5, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold text-[#0e1630]">Bus 04 · Live</p>
                  <p className="text-[9px] text-[#6b7280]">Aarav boarded at 2:43 PM</p>
                </div>
              </motion.div>

              {/* Route progress bar — bottom of map */}
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/20 to-transparent">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Route progress</span>
                  <span className="text-[9px] font-bold text-white/70">68%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '68%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-white"
                  />
                </div>
              </div>
            </div>

            {/* ── Info panel ──────────────────────────────────────────────── */}
            <div className="flex flex-col justify-between p-8 lg:p-10 text-white">

              {/* Top: Next stop + ETA */}
              <div>
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-white/40">Next Stop</p>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <h3 className="text-[1.9rem] font-extrabold leading-none tracking-tight text-white">
                    Maple<br />Residency
                  </h3>
                  {/* ETA badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl bg-[#ffc164] px-4 pt-3 pb-2.5 text-[#1a1400] min-w-[64px]">
                    <span className="text-[2rem] font-extrabold leading-none tabular-nums">04</span>
                    <span className="text-[8px] font-black tracking-widest uppercase mt-1">min eta</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-white/[0.08]" />

                {/* Live telemetry */}
                <div className="space-y-0">
                  <StatRow
                    label="Status"
                    value="On Route"
                    valueColor="text-emerald-400"
                    dot="bg-emerald-400"
                    pulse
                  />
                  <StatRow label="Current speed" value="28 km/h" />
                  <StatRow label="Last GPS ping" value="6 sec ago" />
                  <StatRow label="Arrival confidence" value="High" valueColor="text-emerald-400" />
                  <StatRow label="Guardian notified" value="✓ 2:43 PM" valueColor="text-white/70" />
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-white/[0.08]" />

                {/* Driver */}
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/40 mb-3">Driver</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#53d9c7] text-[13px] font-extrabold text-[#063f38]">
                      RK
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">Rakesh Kumar</p>
                      <p className="text-[11px] text-white/45">Safe driver · ★ 4.9</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA — anchored at bottom */}
              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <p className="text-[12px] text-white/50 mb-4 leading-relaxed">
                  "Your child is on the way home."
                </p>
                <Link
                  href="/parent"
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white/10 border border-white/12 px-5 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/16 hover:border-white/20"
                >
                  Open Parent Portal
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Icon name="arrow" className="h-4 w-4" />
                  </motion.span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
