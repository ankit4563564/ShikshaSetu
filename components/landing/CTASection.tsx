'use client';

import React from 'react';
import Link from 'next/link';
import { useLandingModal } from './LandingModalContext';

export function CTASection() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="py-section-gap bg-textured pb-32">
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-gutter">
        <div className="bg-primary rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative Background Elements */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: "url('/shikshasetu_banner.png')" }}
          />
          <div className="absolute -top-[50%] -left-[20%] w-[70%] h-[100%] rounded-full bg-primary-fixed/20 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 glass-panel-light border-white/20 px-4 py-1.5 rounded-full">
              <span className="font-label-sm text-label-sm text-on-surface tracking-wider font-bold">SEE IT IN ACTION</span>
            </div>
            <h2 className="font-display-lg text-headline-lg md:text-display-lg text-white">
              Experience the connected school day.
            </h2>
            <p className="font-body-lg text-body-lg text-white/90 max-w-xl mx-auto font-medium">
              Step directly into the Parent or Teacher portal and experience how one AI intelligence layer links home and campus in real time.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Link
                href="/parent"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-7 py-3.5 rounded-full font-title-md text-sm font-extrabold shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                Open Parent Experience →
              </Link>
              <Link
                href="/teacher"
                className="bg-teal-600 hover:bg-teal-500 text-white px-7 py-3.5 rounded-full font-title-md text-sm font-extrabold shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                Open Teacher Experience →
              </Link>
              <button
                type="button"
                onClick={openRoleSelector}
                className="bg-white/10 border border-white/30 text-white px-7 py-3.5 rounded-full font-title-md text-sm font-bold hover:bg-white/20 transition-all hover:scale-105"
              >
                Experience ShikshaSetu
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
