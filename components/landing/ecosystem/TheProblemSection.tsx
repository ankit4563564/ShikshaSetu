'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TheProblemSection() {
  return (
    <section className="py-14 md:py-18 bg-[#FFFDF9] border-y border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            THE REAL PROBLEM
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-[#102A43] tracking-tight uppercase leading-tight">
            SCHOOLS HAVE DATA. <br />
            BUT DATA DOESN&apos;T AUTOMATICALLY BECOME ACTION.
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal leading-relaxed">
            Marks, attendance, homework and assessments are already being recorded. But teachers, students and parents still have to figure out what that information actually means and what to do next.
          </p>
        </div>

        {/* 3 Stakeholder Dilemma Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Teacher Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.05)] space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
                👨‍🏫 THE TEACHER
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102A43]">
                &quot;Who needs my attention?&quot;
              </h3>
              <p className="text-sm text-[#102A43]/75 leading-relaxed">
                Teachers manage 40+ students. Information is recorded across registers and spreadsheets, but discovering which 3 students need help on a specific concept before Friday&apos;s exam takes hours of manual review.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-[#2563EB]">
              <span>→ Needs actionable classroom focus</span>
            </div>
          </motion.div>

          {/* 2. Student Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.05)] space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D9488] block">
                🎓 THE STUDENT
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102A43]">
                &quot;What should I improve?&quot;
              </h3>
              <p className="text-sm text-[#102A43]/75 leading-relaxed">
                Students see an isolated score like 58% in Mathematics, but typical portals don&apos;t explain the specific underlying gap (Equivalent Fractions) or provide a 5-minute targeted revision loop.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-[#0D9488]">
              <span>→ Needs relevant, bite-sized practice</span>
            </div>
          </motion.div>

          {/* 3. Parent Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.05)] space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] block">
                🏡 THE PARENT
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102A43]">
                &quot;How can I help?&quot;
              </h3>
              <p className="text-sm text-[#102A43]/75 leading-relaxed">
                Parents receive test report cards weeks later. They want to support their child at home, but don&apos;t know what questions to ask at dinner to reinforce what was taught in class today.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-[#D97706]">
              <span>→ Needs practical, everyday home prompts</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
