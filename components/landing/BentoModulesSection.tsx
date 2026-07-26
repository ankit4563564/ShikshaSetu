import React from 'react';
import Link from 'next/link';

export function BentoModulesSection() {
  return (
    <section className="py-section-gap bg-textured" id="modules">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold">Integrated Campus Workflows</span>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Built for <span className="text-primary font-bold">Real School Days</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
            Every module previews a live operational workflow — eliminating paper logs, manual calls, and disconnected systems.
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Gate Security Console (Wide Box 2-Cols) */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-primary-container to-slate-950 text-white rounded-[2rem] p-8 border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Gate Telemetry
                </span>
                <span className="text-slate-400 font-mono text-xs">08:14:02 AM</span>
              </div>
              <h3 className="text-2xl font-bold font-display text-white mb-2">Gate Pass QR &amp; Campus ID Scan</h3>
              <p className="text-slate-300 text-sm max-w-md">Instant parent SMS confirmation the exact second a student scans their RFID or QR campus pass at gate #2.</p>
            </div>

            {/* Workflow Live Preview Graphic */}
            <div className="mt-8 bg-slate-950/80 rounded-xl p-4 border border-white/10 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <p className="text-white font-bold font-sans text-sm">Aarav Sharma (Class 8-B)</p>
                  <p className="text-emerald-400 text-xs">Verified Entry &middot; Guardian Notified</p>
                </div>
              </div>
              <Link href="/gate" className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-lg font-sans font-bold transition-colors">
                Open Gate Console →
              </Link>
            </div>
          </div>

          {/* Card 2: SchoolGPT Lesson & Quiz Planner (Tall Box 1-Col) */}
          <div className="bg-slate-950 text-white rounded-[2rem] p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span> AI Workstation
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Auto-Lesson &amp; Assessment Generator</h3>
              <p className="text-slate-400 text-xs">CBSE-aligned lesson plans, quiz rubrics, and differentiated learning tracks in 1 click.</p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-amber-500/30 font-mono text-xs">
              <p className="text-amber-400 font-bold mb-1">⚡ Generated Quiz 8-B</p>
              <p className="text-slate-300 font-sans text-xs">10 Questions &middot; Physics Motion</p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>Preparation Saved</span>
                <span className="text-emerald-400 font-bold">45 Mins</span>
              </div>
            </div>
          </div>

          {/* Card 3: Live Bus Fleet Telemetry (Medium Box 1-Col) */}
          <div className="bg-white/95 rounded-[2rem] p-8 border border-outline-variant/30 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-secondary-container/20 text-secondary-container-on border border-secondary-container/40 px-3 py-1 rounded-full text-xs font-bold mb-4">
                <span className="material-symbols-outlined text-xs">directions_bus</span> GPS Telemetry
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Bus Fleet Live GPS</h3>
              <p className="text-slate-600 text-xs">Real-time driver speed monitoring, route ETA calculation, and automated geofence alerts.</p>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 font-mono text-xs flex justify-between items-center">
              <div>
                <p className="font-bold font-sans text-slate-900">Bus 04 &middot; On Route</p>
                <p className="text-[10px] text-slate-500">Speed: 28 km/h &middot; ETA: 4 mins</p>
              </div>
              <span className="text-emerald-600 font-bold text-sm">99.4% On-Time</span>
            </div>
          </div>

          {/* Card 4: Student Worry Jar & Emotional Well-Being (Wide Box 2-Cols) */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-indigo-950 text-white rounded-[2rem] p-8 border border-indigo-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">psychology</span> Student Emotional Support
                </span>
                <span className="text-indigo-300 text-xs font-bold font-mono">92% Positive Climate</span>
              </div>
              <h3 className="text-2xl font-bold font-display text-white mb-2">Anonymous Worry Jar &amp; Class Climate</h3>
              <p className="text-slate-300 text-sm max-w-lg">Give students a safe digital space to share worries confidentially, giving counselors and class teachers early well-being indicators.</p>
            </div>

            <div className="mt-6 bg-slate-950/80 rounded-xl p-4 border border-indigo-500/30 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-lg">
                  💚
                </div>
                <div>
                  <p className="text-white font-bold font-sans text-sm">Class 8-B Mood Check: Uplifted</p>
                  <p className="text-slate-400 text-xs">0 Unresolved Stress Flags Today</p>
                </div>
              </div>
              <Link href="/student" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-sans font-bold transition-colors">
                Explore Student Portal →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
