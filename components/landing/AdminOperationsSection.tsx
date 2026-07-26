import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function AdminOperationsSection() {
  return (
    <div className="rounded-[3rem] p-8 md:p-14 bg-gradient-to-br from-primary via-slate-900 to-slate-950 text-white border border-white/10 shadow-2xl relative overflow-hidden my-12">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        
        {/* Left Column: Hero Dashboard Image (~60% Column Span) */}
        <div className="lg:col-span-7 relative group">
          <div className="relative h-[380px] sm:h-[440px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-slate-900 transition-transform duration-500 group-hover:scale-[1.01]">
            <Image
              src="/images/school_admin_analytics_visual.jpg"
              alt="School Operations Dashboard Showcase"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            {/* Subtle Gradient Frame */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Right Column: Clean, High-Impact Product Reveal Copy (~40% Column Span) */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-xs font-mono font-bold text-secondary-fixed uppercase tracking-widest bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            CAMPUS OPERATIONS
          </span>

          <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Run your entire school <br />
            <span className="text-secondary-fixed glow-text">from one place.</span>
          </h3>

          <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
            Monitor attendance, transport, communication, and administration from one unified workspace.
          </p>

          {/* Lightweight Outcome List */}
          <div className="flex flex-wrap gap-3 text-xs font-bold text-white/90 pt-1">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <span className="text-emerald-400 font-extrabold">✓</span> Live Operations
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <span className="text-emerald-400 font-extrabold">✓</span> AI Insights
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <span className="text-emerald-400 font-extrabold">✓</span> School Safety
            </span>
          </div>

          <div className="pt-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed px-7 py-3.5 rounded-full font-title-md text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Explore School Operations
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
