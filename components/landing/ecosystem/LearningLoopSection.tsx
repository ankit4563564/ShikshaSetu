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
      role: 'Classroom Evidence',
      scoreBadge: 'Initial: 58%',
      headline: 'Teacher sees student evidence on Support Radar',
      story:
        'Priya scores 58% on her weekly Mathematics unit test. Instead of remaining an isolated number on a grade sheet, the system tracks specific concept questions.',
      actionDetail: 'Formative diagnosis triggered automatically from assessment items.',
    },
    {
      num: '02',
      stage: 'Understand',
      actor: 'AI Brain',
      role: 'Concept Analysis',
      scoreBadge: 'Gap Identified',
      headline: 'AI pinpoints the specific learning misconception',
      story:
        'The diagnostic engine identifies that Priya understands integer arithmetic, but struggles with multiplying denominators in Equivalent Fractions.',
      actionDetail: 'Misconception isolated to 1 subtopic (Concept #M8-F02).',
    },
    {
      num: '03',
      stage: 'Act',
      actor: 'Teacher Copilot',
      role: 'Pedagogy Plan',
      scoreBadge: '5-Min Review',
      headline: 'Teacher gets recommended next teaching action',
      story:
        'Teacher Copilot suggests a 5-minute visual fraction bar comparison for Class 8A before progressing to mixed fractions. Teacher approves with one tap.',
      actionDetail: 'Integrated into tomorrow’s Period 1 lesson plan.',
    },
    {
      num: '04',
      stage: 'Learn',
      actor: 'Student',
      role: 'Personalized Study',
      scoreBadge: '15-Min Notebook',
      headline: 'Priya receives 15-minute digital revision notes',
      story:
        'On Priya’s portal, SchoolMitra delivers a lined digital study sheet complete with worked examples, 1-minute cheat sheets, and common exam trap warnings.',
      actionDetail: 'Digital lined study sheet with step-by-step worked examples.',
    },
    {
      num: '05',
      stage: 'Check',
      actor: 'Self Assessment',
      role: 'Mastery Verification',
      scoreBadge: '3 / 3 Correct',
      headline: 'Priya completes interactive 3-question quick check',
      story:
        'Priya completes 3 quick practice problems. When she simplifies 6/8 to 3/4 correctly, SchoolMitra confirms her mastery in real-time memory.',
      actionDetail: 'Instant feedback verifies conceptual understanding.',
    },
    {
      num: '06',
      stage: 'Improve',
      actor: 'Progress Engine',
      role: 'Verified Growth',
      scoreBadge: 'Score: 78%',
      headline: 'ShikshaSetu measures verified understanding improvement',
      story:
        'On the follow-up recheck, Priya’s score rises from 58% to 78%. The canonical grade record updates across Teacher, Student, and Parent views simultaneously.',
      actionDetail: 'Canonical database updated (+20% measurable growth).',
    },
    {
      num: '07',
      stage: 'Connect',
      actor: 'Parent',
      role: 'Home Partnership',
      scoreBadge: 'Dinner Prompt',
      headline: 'Parent receives meaningful, actionable context',
      story:
        'Rajesh Patel gets a warm digest note: "Priya mastered equivalent fractions today! Ask her to explain one problem to you tonight." Anxiety is replaced with support.',
      actionDetail: 'Home encouragement active; loops back to Step 01 Observe.',
    },
  ];

  const current = stages[activeStep];

  return (
    <section id="learning-loop" className="py-20 bg-[#FAF9F6] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
            Real Student Journey: 58% &rarr; 78%
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            From data to measurable improvement.
          </h2>
          <p className="text-base text-stone-600 font-normal leading-relaxed">
            Follow how a single learning gap in Mathematics transforms into mastery across the continuous ShikshaSetu feedback loop.
          </p>
        </div>

        {/* Clean Editorial Stage Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {stages.map((s, idx) => {
            const isCurrent = activeStep === idx;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-[#172033] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span className="font-mono opacity-60">{s.num}</span>
                <span>{s.stage}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Editorial Card */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-8 sm:p-10 rounded-2xl bg-white border border-stone-300 shadow-sm space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Story Description Left */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded">
                  Step {current.num} • {current.actor}
                </span>
                <span className="text-xs font-bold text-[#16836A] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                  {current.role}
                </span>
                <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded">
                  {current.scoreBadge}
                </span>
              </div>

              <h3 className="font-display text-2xl font-black text-[#172033] leading-snug">
                {current.headline}
              </h3>

              <p className="text-sm text-stone-600 font-normal leading-relaxed max-w-2xl">
                {current.story}
              </p>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 flex items-center gap-2">
                <span className="text-[#16836A] font-bold">✓</span>
                <span>{current.actionDetail}</span>
              </div>
            </div>

            {/* Stage Summary Right */}
            <div className="lg:col-span-4 p-6 rounded-xl bg-[#FAF9F6] border border-stone-200 text-center space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                Loop Sequence
              </span>
              <div className="font-display text-lg font-bold text-[#172033]">
                {current.stage} &rarr; {stages[(activeStep + 1) % stages.length].stage}
              </div>
              <p className="text-xs text-stone-500">
                Loops continuously back to Step 01 (Observe) for every subsequent learning topic.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
