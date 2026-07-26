import React from 'react';
import Image from 'next/image';

export function AdminOperationsSection() {
  return (
    <div className="rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-slate-900 via-primary to-slate-950 text-white border border-primary-fixed-dim/30 ambient-shadow grid grid-cols-1 md:grid-cols-2 gap-12 items-center hover:-translate-y-1 transition-all duration-300">
      {/* Large Operations Center Desktop UI Visual */}
      <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary-fixed/20 bg-slate-950 flex items-center justify-center">
        <Image
          src="/images/school_admin_analytics_visual.jpg"
          alt="A modern school operations command center dashboard screen with telemetry graphs."
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        {/* Floating Command Center Widget Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-primary-fixed/40 text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/20 text-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">dashboard</span>
            </div>
            <div>
              <p className="text-xs font-bold text-primary-fixed">Campus Mission Control</p>
              <p className="text-[10px] text-slate-300">1,420 Active Students &middot; 42 Buses Live</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/40">
            All Systems Normal
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary-fixed/15 border border-primary-fixed/30 px-3.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-primary-fixed text-sm">domain</span>
          <span className="font-label-sm text-label-sm text-primary-fixed font-bold uppercase tracking-wider">Campus Operations Command Center</span>
        </div>
        <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
          Unified School Operations &amp; Intelligence
        </h3>
        <p className="font-body-lg text-body-lg text-slate-300 font-medium">
          Command your entire campus from a single pane of glass — gate entry security, bus fleet GPS, attendance sync, and automated fee &amp; parent communications.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-white bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 font-semibold">
            <span className="material-symbols-outlined text-sm text-primary-fixed">sensor_door</span> Gate Telemetry
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-white bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 font-semibold">
            <span className="material-symbols-outlined text-sm text-primary-fixed">shield</span> Safety Matrix
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-white bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 font-semibold">
            <span className="material-symbols-outlined text-sm text-primary-fixed">analytics</span> Predictive Admin
          </span>
        </div>
        <button type="button" className="mt-4 flex items-center gap-2 font-title-md text-title-md text-primary-fixed hover:text-white transition-colors font-extrabold">
          Explore Operations Center <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
