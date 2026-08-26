'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function LearningLoopSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      num: '1',
      title: '1. Identify Gap',
      badge: '58% Gap',
      badgeColor: 'text-[#F59E0B] bg-[#FFF9F0] border-[#F59E0B]/30',
      desc: 'AI detects Equivalent Fractions concept issue (58%) from daily assessment telemetry.',
    },
    {
      num: '2',
      title: '2. Teacher Review',
      badge: '5-Min Action',
      badgeColor: 'text-[#2563EB] bg-[#EFF6FF] border-[#2563EB]/20',
      desc: 'Teacher assigns focused 5-minute visual fraction bar intervention & guided examples.',
    },
    {
      num: '3',
      title: '3. Student Revision',
      badge: '15-Min Mitra',
      badgeColor: 'text-[#F59E0B] bg-[#FFF9F0] border-[#F59E0B]/30',
      desc: 'Priya engages with personalized lined digital study notes and worked practice traps.',
    },
    {
      num: '4',
      title: '4. Mastery Check',
      badge: '78% Mastery',
      badgeColor: 'text-[#16A085] bg-[#E6F7F2] border-[#16A085]/30',
      desc: 'Final assessment shows significant verified growth across all three portals simultaneously.',
    },
  ];

  return (
    <section id="learning-loop" className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Headline */}
        <div className="text-center space-y-1.5">
          <h2 className="font-display text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight uppercase">
            58% TO 78% MASTERY: THE CONTINUOUS LEARNING LOOP
          </h2>
          <p className="text-xs font-mono text-[#102A43]/60 uppercase tracking-wider">
            Illustrative Student Growth Journey • DPS R.K. Puram Demo Dataset
          </p>
        </div>

        {/* 4 Connected Horizontal Stages with Sequential Hover/Step Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {steps.map((s, idx) => (
            <motion.div
              key={s.num}
              onMouseEnter={() => setActiveStep(idx)}
              onMouseLeave={() => setActiveStep(null)}
              whileHover={{ y: -3 }}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                activeStep === idx
                  ? 'bg-white border-[#2563EB]/40 shadow-[0_8px_24px_rgba(37,99,235,0.1)]'
                  : 'bg-white/80 border-[#102A43]/10 shadow-2xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                  {idx < steps.length - 1 && (
                    <span className="hidden lg:inline text-stone-300 font-bold text-base">&rarr;</span>
                  )}
                </div>
                <h3 className="font-display text-sm sm:text-base font-bold text-[#102A43]">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#102A43]/75 leading-relaxed font-normal">
                  {s.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-[#102A43]/50">
                <span>Stage 0{idx + 1}</span>
                <span className="text-[#16A085] font-bold">Continuous Loop</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
