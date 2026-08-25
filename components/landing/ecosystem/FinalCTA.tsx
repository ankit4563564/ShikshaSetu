'use client';

import React from 'react';
import Link from 'next/link';
import { useLandingModal } from '../LandingModalContext';

export function FinalCTA() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="py-20 bg-[#172033] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
            Intelligent Learning Ecosystem
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Don&apos;t just manage your school. <br />
            Understand every learner.
          </h2>
          <p className="text-base text-stone-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Connect teachers, students, and parents through one intelligent learning ecosystem.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            type="button"
            onClick={openRoleSelector}
            className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-600 text-white font-display text-sm font-bold px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore ShikshaSetu</span>
            <span className="font-bold">&rarr;</span>
          </button>

          <a
            href="#the-difference"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-display text-sm font-bold border border-white/20 transition-all text-center"
          >
            See the Learning Journey
          </a>
        </div>

        {/* Direct Portal Jump Grid */}
        <div className="pt-6 border-t border-white/10 max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <Link
            href="/teacher"
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-bold transition-all text-center"
          >
            Teacher Portal &rarr;
          </Link>
          <Link
            href="/student"
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-bold transition-all text-center"
          >
            Student Portal &rarr;
          </Link>
          <Link
            href="/parent"
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-bold transition-all text-center"
          >
            Parent Portal &rarr;
          </Link>
          <Link
            href="/admin"
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-bold transition-all text-center"
          >
            Admin Portal &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
