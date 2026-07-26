'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LiveTransitSection() {
  const stops = [
    { time: '07:01 AM', label: 'Gate Entry', status: 'done', color: 'text-emerald-400' },
    { time: '07:15 AM', label: 'Boarding Start', status: 'done', color: 'text-emerald-400' },
    { time: '07:24 AM', label: 'En Route (28 km/h)', status: 'active', color: 'text-sky-400 font-bold animate-pulse' },
    { time: '07:34 AM', label: 'Arrived at Stop', status: 'upcoming', color: 'text-slate-400' },
    { time: '07:42 AM', label: 'Classroom Arrival', status: 'upcoming', color: 'text-slate-400' },
  ];

  return (
    <section className="bg-indigo-950 py-24 sm:py-32 text-white overflow-hidden relative font-body">
      {/* Glow effects */}
      <div className="absolute top-1/3 left-10 w-96 h-96 rounded-full bg-indigo-500/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-extrabold uppercase tracking-widest">
              ⚡ LIVE PARENT VIEW
            </span>

            <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              The map parents actually <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">want to watch.</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Live bus locations, safe arrivals, instant updates — total transparency for every child&apos;s journey.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/demo"
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span>How it works</span>
                <span>&rarr;</span>
              </Link>
              <Link
                href="/parent"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all active:scale-95"
              >
                See live demo
              </Link>
            </div>
          </div>

          {/* Right Live Transit Dark Visualizer Card */}
          <div className="lg:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden relative"
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-display text-base sm:text-lg font-black text-white">
                    Maple Residency • Saket Route #4
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Bus KL-05-AB-1234 • Driver: Ramesh Kumar</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live GPS Active
                </span>
              </div>

              {/* Transit Map Visual */}
              <div className="relative h-[220px] w-full rounded-2xl overflow-hidden border border-slate-800">
                <Image
                  src="/images/parent_live_bus_map_visual.jpg"
                  alt="Live Bus GPS Map Visual"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Stop Timeline */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {stops.map((st) => (
                  <div key={st.label} className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-0.5">
                    <span className={`text-[10px] font-mono block ${st.color}`}>{st.time}</span>
                    <strong className="text-white text-[11px] block truncate">{st.label}</strong>
                  </div>
                ))}
              </div>

              {/* Bottom Active Stop Banner */}
              <div className="p-4 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase text-indigo-400 block">Next Stop:</span>
                  <h4 className="font-display text-sm font-extrabold text-white">Nehru Nagar (ETA 4 mins)</h4>
                </div>
                <Link
                  href="/parent"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xs transition-all"
                >
                  Open Parent App &rarr;
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
