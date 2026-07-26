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
          <div className="md:col-span-2 bg-gradient-to-br from-primary via-primary-container to-slate-900 text-white rounded-[2rem] p-8 border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Gate Entry
                </span>
                <span className="text-white/60 font-mono text-xs">08:14 AM</span>
              </div>
              <h3 className="text-2xl font-bold font-display text-white mb-2">Gate Pass QR &amp; Campus ID Scan</h3>
              <p className="text-white/80 text-sm max-w-md">Instant parent WhatsApp &amp; SMS confirmation the exact second a student scans their campus pass at gate #2.</p>
            </div>

            {/* Workflow Live Preview Graphic */}
            <div className="mt-8 bg-black/30 rounded-xl p-4 border border-white/10 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <p className="text-white font-bold font-sans text-sm">Aarav Sharma (Class 8-B)</p>
                  <p className="text-emerald-400 text-xs">Verified Entry &middot; Parent Notified</p>
                </div>
              </div>
              <Link href="/gate" className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-lg font-sans font-bold transition-colors">
                Open Gate Console →
              </Link>
            </div>
          </div>

          {/* Card 2: SchoolGPT Lesson & Quiz Planner (Tall Box 1-Col) */}
          <div className="bg-primary text-white rounded-[2rem] p-8 border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span> Teacher Assistant
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Lesson &amp; Quiz Creator</h3>
              <p className="text-white/80 text-xs">CBSE-aligned lesson plans, quiz rubrics, and practice worksheets in 1 click.</p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-black/30 border border-white/10 font-mono text-xs">
              <p className="text-secondary-fixed font-bold mb-1">⚡ Generated Quiz 8-B</p>
              <p className="text-white/90 font-sans text-xs">10 Questions &middot; Physics Motion</p>
              <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-white/70 flex justify-between">
                <span>Time Saved</span>
                <span className="text-emerald-300 font-bold">45 Mins</span>
              </div>
            </div>
          </div>

          {/* Card 3: Live Bus Fleet Telemetry (Medium Box 1-Col) */}
          <div className="bg-white/95 rounded-[2rem] p-8 border border-outline-variant/30 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-primary px-3 py-1 rounded-full text-xs font-bold mb-4 border border-outline-variant/20">
                <span className="material-symbols-outlined text-xs">directions_bus</span> Live GPS Tracker
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Live Bus Fleet Tracking</h3>
              <p className="text-slate-600 text-xs">Real-time speed monitoring, route ETA calculation, and automated arrival alerts.</p>
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
          <div className="md:col-span-2 bg-gradient-to-br from-primary via-primary-container to-slate-900 text-white rounded-[2rem] p-8 border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">psychology</span> Student Support
                </span>
                <span className="text-secondary-fixed text-xs font-bold font-mono">Positive Class Climate</span>
              </div>
              <h3 className="text-2xl font-bold font-display text-white mb-2">Student Support &amp; Anonymous Worry Jar</h3>
              <p className="text-white/80 text-sm max-w-lg">Give students a safe digital space to share worries confidentially, giving class teachers early well-being indicators.</p>
            </div>

            <div className="mt-6 bg-black/30 rounded-xl p-4 border border-white/10 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg">
                  💚
                </div>
                <div>
                  <p className="text-white font-bold font-sans text-sm">Class 8-B Climate: Positive</p>
                  <p className="text-white/70 text-xs">All Students Supported Today</p>
                </div>
              </div>
              <Link href="/student" className="bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed text-xs px-4 py-2 rounded-lg font-sans font-bold transition-colors">
                Explore Student Portal →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
