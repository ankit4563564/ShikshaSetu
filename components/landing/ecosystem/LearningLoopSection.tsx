'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function LearningLoopSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Observe',
      role: 'Faculty',
      icon: '👁️',
      headline: 'Teacher sees actual student evidence',
      detail: 'Exit tickets, homework logs, and attendance indicators are aggregated without manual paperwork.',
      pill: 'Classroom Data',
    },
    {
      num: '02',
      title: 'Understand',
      role: 'AI Brain',
      icon: '🧠',
      headline: 'AI identifies the meaningful learning gap',
      detail: 'Instead of raw averages, SchoolGPT pinpoints specific misconceptions (e.g. Equivalent Fractions simplification).',
      pill: 'Concept Analysis',
    },
    {
      num: '03',
      title: 'Act',
      role: 'Teaching Copilot',
      icon: '✨',
      headline: 'Teacher gets recommended next teaching action',
      detail: 'Suggested 5-minute visual review before progressing to advanced mixed fractions.',
      pill: 'Targeted Differentiated Plan',
    },
    {
      num: '04',
      title: 'Learn',
      role: 'Student',
      icon: '📖',
      headline: 'Student receives personalized digital study notebook',
      detail: 'Priya gets 1-minute cheat sheets, worked examples, and exam trap alerts on her portal.',
      pill: '15-min Active Study',
    },
    {
      num: '05',
      title: 'Check',
      role: 'Self Assessment',
      icon: '⚡',
      headline: 'Student completes quick interactive check',
      detail: 'Interactive 3-question quiz verifies mastery immediately after reading revision notes.',
      pill: 'Confidence Verification',
    },
    {
      num: '06',
      title: 'Improve',
      role: 'Progress Engine',
      icon: '📈',
      headline: 'ShikshaSetu measures whether understanding improved',
      detail: 'Growth trend updates in real-time (+14%) and marks update automatically across all views.',
      pill: 'Measurable Mastery',
    },
    {
      num: '07',
      title: 'Connect',
      role: 'Parent',
      icon: '👨‍👩‍👧',
      headline: 'Parent receives meaningful, actionable context',
      detail: 'A warm dinner note: "Ask Priya to explain one fractions problem tonight — she just mastered it!"',
      pill: 'Home Support Sync',
    },
  ];

  return (
    <section id="learning-loop" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            The 7-Step Cycle
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            From data to better learning.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Every observation triggers intelligence, action, and feedback. The ecosystem continuously loops back to keep everyone aligned.
          </p>
        </div>

        {/* Continuous Progress Track */}
        <div className="relative">
          <div className="flex items-center justify-start lg:justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-3 scrollbar-none">
            {steps.map((s, idx) => {
              const isCurrent = activeStep === idx;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                      : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.num} {s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Showcase Card */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs font-black uppercase tracking-widest text-indigo-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  Step {steps[activeStep].num} • {steps[activeStep].role}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  ✓ {steps[activeStep].pill}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-4xl font-black text-white leading-tight">
                {steps[activeStep].headline}
              </h3>

              <p className="text-sm sm:text-base text-indigo-200/90 font-medium leading-relaxed max-w-2xl">
                {steps[activeStep].detail}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl text-center space-y-3">
              <span className="text-5xl">{steps[activeStep].icon}</span>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
                Continuous Improvement
              </span>
              <p className="text-xs text-white/90 font-semibold">
                Loops to Step {steps[(activeStep + 1) % steps.length].num} ({steps[(activeStep + 1) % steps.length].title}) &rarr;
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
