'use client';

import React from 'react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="pt-16 md:pt-20 pb-20 bg-textured">
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-gutter">
        <div className="bg-primary rounded-[2rem] p-10 md:p-12 text-center relative overflow-hidden shadow-xl">
          {/* Decorative Background Elements */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: "url('/shikshasetu_banner.png')" }}
          />
          <div className="absolute -top-[50%] -left-[20%] w-[70%] h-[100%] rounded-full bg-primary-fixed/20 blur-[80px] pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 glass-panel-light border-white/20 px-4 py-1.5 rounded-full">
              <span className="font-label-sm text-[13px] text-on-surface tracking-wider font-bold">SCHOOL PILOT PROGRAM</span>
            </div>
            <h2 className="font-display-lg text-headline-lg md:text-display-lg text-white">
              Bring ShikshaSetu to your school.
            </h2>
            <p className="font-body-lg text-[17px] text-white/90 max-w-xl mx-auto font-medium leading-relaxed">
              Start with one class. Pilot the core workflows with your teachers, parents, and school staff.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/contact"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-8 py-3.5 rounded-xl font-title-md text-[15px] font-extrabold shadow-lg hover:scale-[1.02] transition-all inline-flex items-center gap-2"
              >
                Request a Pilot →
              </Link>
              <Link
                href="/login"
                className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-7 py-3.5 rounded-xl font-title-md text-[15px] font-bold transition-all hover:scale-[1.02] inline-flex items-center gap-2"
              >
                Access Portal →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
