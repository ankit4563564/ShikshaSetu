'use client';

import Image from 'next/image';
import { SectionWrapper, Button } from './Primitives';

export function FinalCTAV4() {
  return (
    <SectionWrapper bg="bg-[#F5F8FF]" className="py-12">
      <div className="p-8 sm:p-14 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-[24px] shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-500/20 blur-[150px] pointer-events-none" />

        <div className="lg:col-span-7 space-y-6 relative z-10">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-extrabold uppercase tracking-widest">
            ⚡ SEE IT IN ACTION
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Walk a full school day <br />
            in <span className="text-amber-400">seven minutes.</span>
          </h2>
          <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-lg">
            Explore every role portal and experience real connected school operations.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button href="/sign-in" variant="yellow">Access Portals &rarr;</Button>
            <Button href="/parent" variant="glass" className="text-white border-white/20 hover:bg-white/10">Parent View</Button>
          </div>
        </div>

        <div className="lg:col-span-5 relative h-[220px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl hidden lg:block">
          <Image src="/images/school_admin_analytics_visual.jpg" alt="Live Demo Preview" fill className="object-cover" />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-2xl animate-pulse">
              ▶
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
