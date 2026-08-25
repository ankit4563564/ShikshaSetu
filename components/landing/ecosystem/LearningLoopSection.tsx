'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function LearningLoopSection() {
  const [activeStep, setActiveStep] = useState(0);

  const scenarioStages = [
    {
      num: '01',
      stage: 'Observe',
      actor: '👩‍🏫 Teacher',
      badge: 'Real Classroom Evidence',
      metricBefore: 'Unit Test: 58%',
      metricAfter: 'Misconception Flagged',
      headline: 'Teacher observes learning evidence on Support Radar',
      story:
        'During the weekly Mathematics unit assessment, Priya scores 58%. Rather than an obscure mark on a spreadsheet, the system tracks specific question responses.',
      uiCard: {
        title: 'Class 8A Assessment Intake',
        detail: 'Priya Patel • Mathematics Unit Test 1',
        tag: 'Score: 58/100',
        action: 'Formative diagnosis triggered automatically',
      },
    },
    {
      num: '02',
      stage: 'Understand',
      actor: '🧠 AI Brain',
      badge: 'Concept Level Diagnosis',
      metricBefore: '58% Raw Score',
      metricAfter: 'Identified: Equivalent Fractions',
      headline: 'AI pinpoints the specific conceptual misconception',
      story:
        'SchoolGPT analyzes error patterns across Section 8A: Priya understands integer arithmetic, but struggles with multiplying denominators when finding equivalent fractions.',
      uiCard: {
        title: 'Learning Gap Diagnosis',
        detail: 'Concept #M8-F02: Equivalent Fractions Simplification',
        tag: '3 Students Impacted',
        action: 'Pinpointed: Non-general failure, isolated to 1 subtopic',
      },
    },
    {
      num: '03',
      stage: 'Act',
      actor: '✨ Teacher Copilot',
      badge: 'Pedagogy Recommendation',
      metricBefore: 'Unsure what to teach',
      metricAfter: '5-Min Visual Review Planned',
      headline: 'Teacher receives targeted, differentiated teaching action',
      story:
        'Teacher Copilot suggests: "Spend 5 minutes tomorrow using visual fraction bars to illustrate equivalence before moving to mixed fractions." Teacher approves the plan with one click.',
      uiCard: {
        title: 'Recommended Micro-Intervention',
        detail: 'Visual bar comparison model for Section 8A',
        tag: 'Approved by Teacher',
        action: 'Integrated into tomorrow’s period 1 lesson plan',
      },
    },
    {
      num: '04',
      stage: 'Learn',
      actor: '🎓 Student Learner',
      badge: 'Digital Study Notebook',
      metricBefore: '58% Confidence',
      metricAfter: '15-Min Focused Study',
      headline: 'Priya receives personalized digital revision notes',
      story:
        'On Priya’s student portal, SchoolMitra generates a lined digital study sheet with worked fraction examples, 1-minute cheat sheets, and common exam trap warnings.',
      uiCard: {
        title: 'AI Revision Notes Studio',
        detail: 'Topic: Equivalent Fractions & Simplifying',
        tag: '15-Min Targeted Notebook',
        action: 'Cheat sheet + worked examples ready',
      },
    },
    {
      num: '05',
      stage: 'Check',
      actor: '⚡ Self Assessment',
      badge: 'Confidence Verification',
      metricBefore: 'Reviewing Notes',
      metricAfter: '3/3 Quick Check Correct',
      headline: 'Priya completes interactive 3-question quick check',
      story:
        'Priya solves 3 quick practice problems. When she simplifies 6/8 to 3/4 correctly, SchoolMitra provides instant encouraging feedback.',
      uiCard: {
        title: 'Interactive Concept Check',
        detail: '3 Formative Quiz Items Completed',
        tag: '3 / 3 Correct (100%)',
        action: 'Mastery confirmed in realtime memory',
      },
    },
    {
      num: '06',
      stage: 'Improve',
      actor: '📈 Progress Engine',
      badge: 'Measurable Mastery Growth',
      metricBefore: 'Initial: 58%',
      metricAfter: 'Mastery Score: 78%',
      headline: 'ShikshaSetu measures verified understanding improvement',
      story:
        'On the follow-up recheck, Priya’s score rises from 58% to 78%. All records update across Teacher, Student, and Parent portals simultaneously.',
      uiCard: {
        title: 'Canonical Grade Sync',
        detail: 'Priya Patel • Mathematics Progress',
        tag: 'Updated: 78% (+20% Growth)',
        action: 'Canonical database updated & synced across all portals',
      },
    },
    {
      num: '07',
      stage: 'Connect',
      actor: '👨‍👩‍👧 Parent Guardian',
      badge: 'Home Support Sync',
      metricBefore: 'Anxious interrogation',
      metricAfter: 'Warm dinner conversation',
      headline: 'Parent receives meaningful, actionable context',
      story:
        'Rajesh Patel gets a warm digest note: "Priya mastered equivalent fractions today! Ask her to explain one problem to you tonight." Home anxiety is replaced with encouragement.',
      uiCard: {
        title: 'Parent Today Family Digest',
        detail: 'Rajesh Patel • Encouragement Prompt',
        tag: 'Family Partnership Active',
        action: 'Loops back to Step 01 Observe for next unit topic',
      },
    },
  ];

  const current = scenarioStages[activeStep];

  return (
    <section id="learning-loop" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Real Student Journey: 58% &rarr; 78%
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            From data to measurable improvement.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Follow how a single learning gap in Mathematics transforms into mastery across the continuous ShikshaSetu feedback loop.
          </p>
        </div>

        {/* Continuous Step Tabs */}
        <div className="flex items-center justify-start lg:justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {scenarioStages.map((s, idx) => {
            const isSelected = activeStep === idx;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <span>{s.actor.split(' ')[0]}</span>
                <span>{s.num} {s.stage}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Showcase Card */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Story Description Left */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-black uppercase tracking-widest text-indigo-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  Step {current.num} • {current.actor}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  ✓ {current.badge}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
                {current.headline}
              </h3>

              <p className="text-sm sm:text-base text-indigo-200/90 font-medium leading-relaxed max-w-2xl">
                {current.story}
              </p>

              {/* Data Transformation Metric Pill */}
              <div className="pt-2 flex items-center gap-3 text-xs font-mono font-bold">
                <span className="px-3 py-1 rounded-lg bg-white/10 text-rose-300 border border-white/10">
                  {current.metricBefore}
                </span>
                <span className="text-indigo-400">&rarr;</span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {current.metricAfter}
                </span>
              </div>
            </div>

            {/* Simulated Live Product Card Right */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">
                  ShikshaSetu Live Event
                </span>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">
                  {current.uiCard.tag}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-sm font-black text-white">
                  {current.uiCard.title}
                </h4>
                <p className="text-xs text-indigo-200 font-medium">
                  {current.uiCard.detail}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
                <span>⚡</span>
                <span>{current.uiCard.action}</span>
              </div>

              <p className="text-[10px] text-slate-400 font-mono text-center pt-1">
                Loops to Step {scenarioStages[(activeStep + 1) % scenarioStages.length].num} ({scenarioStages[(activeStep + 1) % scenarioStages.length].stage}) &rarr;
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
