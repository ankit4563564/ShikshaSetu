'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLandingModal } from '../LandingModalContext';

export function FinalCTA() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-blue-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-white/10 border border-white/10 px-3.5 py-1 rounded-full backdrop-blur-md">
          Start Today
        </span>

        <h2 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Don&apos;t just manage your school. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Understand every learner.
          </span>
        </h2>

        <p className="text-base sm:text-xl text-indigo-200/80 font-medium max-w-2xl mx-auto leading-relaxed">
          Connect teachers, students, and parents through one intelligent learning ecosystem built around one live student journey.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openRoleSelector}
            className="w-full sm:w-auto bg-white text-slate-900 font-display text-sm font-black px-8 py-4 rounded-2xl shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore ShikshaSetu Portals</span>
            <span className="text-indigo-600 font-bold">&rarr;</span>
          </motion.button>

          <a
            href="#learning-loop"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-display text-sm font-black border border-white/15 backdrop-blur-md transition-all text-center"
          >
            See the Learning Journey
          </a>
        </div>
      </div>
    </section>
  );
}
