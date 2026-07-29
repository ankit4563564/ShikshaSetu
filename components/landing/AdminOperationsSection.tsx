import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function AdminOperationsSection() {
  return (
    <div className="rounded-2xl p-8 md:p-12 relative overflow-hidden my-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Floating Dark Device Frame */}
        <div className="lg:col-span-7 relative group">
          <div className="relative h-[340px] sm:h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 transition-transform duration-500 group-hover:scale-[1.01]">
            <Image
              src="/images/school_admin_analytics_visual.jpg"
              alt="School Operations Dashboard Showcase"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            {/* Subtle Gradient Frame */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20 pointer-events-none" />
            {/* Window Chrome */}
            <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-4 py-3 bg-gradient-to-b from-slate-950/80 to-transparent z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
              <span className="ml-2 text-[10px] font-mono text-white/50 font-medium">ShikshaSetu Mission Control</span>
            </div>
          </div>
        </div>

        {/* Right Column: Copy on light background */}
        <div className="lg:col-span-5 space-y-5">
          <span className="text-xs font-mono font-bold text-[#0F766E] uppercase tracking-widest bg-[#F4FBF7] px-3.5 py-1 rounded-full border border-[#22C55E]/30">
            CAMPUS OPERATIONS
          </span>

          <h3 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-[#111827] tracking-tight leading-[1.15]">
            Run your entire school <br />
            <span className="text-[#0F766E]">from one place.</span>
          </h3>

          <p className="font-body text-base text-[#4B5563] leading-relaxed max-w-md font-medium">
            Every action from the Parent and Teacher experiences is synchronized automatically through one intelligent operational platform.
          </p>

          {/* Lightweight Outcome List */}
          <div className="flex flex-wrap gap-2.5 text-[13px] font-bold text-[#111827]">
            <span className="flex items-center gap-1.5 bg-[#F4FBF7] px-3 py-1.5 rounded-full border border-[#22C55E]/20">
              <span className="text-[#22C55E] font-extrabold">✓</span> Live Operations
            </span>
            <span className="flex items-center gap-1.5 bg-[#F4FBF7] px-3 py-1.5 rounded-full border border-[#22C55E]/20">
              <span className="text-[#22C55E] font-extrabold">✓</span> AI Insights
            </span>
            <span className="flex items-center gap-1.5 bg-[#F4FBF7] px-3 py-1.5 rounded-full border border-[#22C55E]/20">
              <span className="text-[#22C55E] font-extrabold">✓</span> School Safety
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-[#111827] hover:bg-slate-800 text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all"
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
