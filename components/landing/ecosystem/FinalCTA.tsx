'use client';

import React from 'react';
import Link from 'next/link';
import { useLandingModal } from '../LandingModalContext';

export function FinalCTA() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="py-16 md:py-24 bg-[#102A43] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="font-mono text-xs font-bold text-amber-300 tracking-widest uppercase block">
            THE CONNECTED FUTURE
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight">
            DON&apos;T JUST MANAGE YOUR SCHOOL. <br />
            UNDERSTAND EVERY LEARNER.
          </h2>
          <p className="text-base sm:text-lg text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            ShikshaSetu connects school information to the next meaningful action.
          </p>
        </div>

        {/* Visual Pipeline Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-5 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md font-mono text-xs sm:text-sm font-bold text-amber-300">
          <span>DATA</span>
          <span className="text-white/40">→</span>
          <span>UNDERSTANDING</span>
          <span className="text-white/40">→</span>
          <span>ACTION</span>
          <span className="text-white/40">→</span>
          <span className="text-emerald-400">OUTCOME</span>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={openRoleSelector}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-display text-sm font-bold shadow-lg shadow-blue-500/25 transition cursor-pointer"
          >
            Explore ShikshaSetu →
          </button>
          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-display text-sm font-bold transition"
          >
            Schedule a Demo →
          </Link>
        </div>
      </div>
    </section>
  );
}
