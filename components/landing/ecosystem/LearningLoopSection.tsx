'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function LearningLoopSection() {
  const [activeStep, setActiveStep] = useState(0);

  const stages = [
    {
      num: '01',
      stage: 'Observe',
      actor: 'Teacher',
      scoreBadge: 'Initial: 58%',
      headline: 'Teacher sees student evidence on Support Radar',
      story: 'Priya scores 58% on weekly unit test. Rather than an archived mark, specific question errors are mapped to concept standards.',
    },
    {
      num: '02',
      stage: 'Understand',
      actor: 'AI Engine',
      scoreBadge: 'Gap Identified',
      headline: 'AI pinpoints the specific misconception',
      story: 'SchoolGPT identifies that Priya understands basic arithmetic, but struggles with multiplying denominators in Equivalent Fractions.',
    },
    {
      num: '03',
      stage: 'Act',
      actor: 'Teacher',
      scoreBadge: '5-Min Review',
      headline: 'Teacher gets recommended classroom action',
      story: 'Teacher Copilot suggests a 5-minute visual fraction bar comparison for Class 8A before moving to mixed fractions. Teacher approves.',
    },
    {
      num: '04',
      stage: 'Learn',
      actor: 'Student',
      scoreBadge: '15-Min Notebook',
      headline: 'Priya receives 15-minute digital revision notes',
      story: 'SchoolMitra generates a lined study sheet with step-by-step worked examples, 1-minute cheat sheets, and common exam trap warnings.',
    },
    {
      num: '05',
      stage: 'Check',
      actor: 'Student',
      scoreBadge: '3 / 3 Correct',
      headline: 'Priya completes interactive quick check',
      story: 'Priya solves 3 quick practice problems. Simplifying 6/8 to 3/4 confirms her mastery in real-time memory.',
    },
    {
      num: '06',
      stage: 'Improve',
      actor: 'Ecosystem',
      scoreBadge: 'Score: 78%',
      headline: 'ShikshaSetu measures verified mastery improvement',
      story: 'On the recheck assessment, Priya’s score rises from 58% to 78%. All 3 portals update simultaneously from the single database.',
    },
    {
      num: '07',
      stage: 'Connect',
      actor: 'Parent',
      scoreBadge: 'Dinner Prompt',
      headline: 'Parent receives encouraging context',
      story: 'Rajesh Patel gets a warm digest note: "Priya mastered fractions today! Ask her to explain one problem tonight." Loop continues for next topic.',
    },
  ];

  const current = stages[activeStep];

  return (
    <section id="learning-loop" className="py-16 md:py-20 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
            The Continuous Feedback Loop
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            How data turns into measurable improvement.
          </h2>
          <p className="text-base text-stone-600 font-normal leading-relaxed">
            Follow Priya&apos;s journey as a 58% Mathematics score transforms into 78% mastery across the loop.
          </p>
        </div>

        {/* Compact Horizontal Timeline Stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {stages.map((s, idx) => {
            const isCurrent = activeStep === idx;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#172033] text-white shadow-xs'
                    : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span className="font-mono text-[11px] opacity-60">{s.num}</span>
                <span>{s.stage}</span>
              </button>
            );
          })}
        </div>

        {/* Unified Story Card */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-7 sm:p-9 rounded-2xl bg-[#FAF9F6] border border-stone-300 space-y-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  Step {current.num} • {current.actor}
                </span>
                <span className="text-xs font-mono font-bold text-stone-700 bg-white border border-stone-200 px-2 py-0.5 rounded">
                  {current.scoreBadge}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-[#172033]">
                {current.headline}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed max-w-2xl font-normal">
                {current.story}
              </p>
            </div>

            <div className="lg:col-span-4 p-4 rounded-xl bg-white border border-stone-200 text-center space-y-1.5 shadow-2xs">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-stone-400">
                Next In Sequence
              </span>
              <div className="font-display text-sm font-bold text-[#172033]">
                {current.stage} &rarr; {stages[(activeStep + 1) % stages.length].stage}
              </div>
              <span className="text-[11px] text-[#16836A] font-bold block">
                ✓ Continuous Loop Active
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
