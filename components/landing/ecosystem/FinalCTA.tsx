'use client';

import React from 'react';
import Link from 'next/link';
import { useLandingModal } from '../LandingModalContext';
import { motion } from 'framer-motion';

export function FinalCTA() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="py-24 bg-[#172033] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
            Intelligent Learning Ecosystem
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to connect your school around every learner?
          </h2>
          <p className="text-base sm:text-lg text-stone-300 font-normal leading-relaxed">
            Experience the single source of truth that turns daily classroom data into personalized next actions.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={openRoleSelector}
            className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-600 text-white font-display text-sm font-bold px-8 py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch Live Interactive Demo</span>
            <span className="font-bold">&rarr;</span>
          </button>

          <Link
            href="/contact"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-display text-sm font-bold border border-white/20 transition-all text-center"
          >
            Schedule a School Consultation
          </Link>
        </div>

        {/* Quick Portal Switcher Grid */}
        <div className="pt-6 border-t border-white/10 max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            href="/teacher"
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-bold transition-all text-center"
          >
            Teacher Portal &rarr;
          </Link>
          <Link
            href="/student"
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-bold transition-all text-center"
          >
            Student Portal &rarr;
          </Link>
          <Link
            href="/parent"
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-bold transition-all text-center"
          >
            Parent Portal &rarr;
          </Link>
          <Link
            href="/admin"
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-bold transition-all text-center"
          >
            Admin Portal &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
