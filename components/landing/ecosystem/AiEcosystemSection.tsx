'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function AiEcosystemSection() {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const contexts = {
    teacher: {
      role: 'TEACHER',
      question: 'What should I teach next?',
      aiOutput: '3 students in Section 8A struggled with Equivalent Fractions on yesterday’s exit check. Recommended: 10-minute visual fraction bar review in Period 1.',
      tag: 'Teacher Copilot',
      metric: 'Formative Diagnosis',
    },
    student: {
      role: 'STUDENT',
      question: 'What should I learn tonight?',
      aiOutput: 'Revise Equivalent Fractions for 15 minutes. Worked examples & 1-minute cheat sheet are ready on your digital study sheet.',
      tag: 'SchoolMitra Companion',
      metric: '15-Min Focused Study',
    },
    parent: {
      role: 'PARENT',
      question: 'How can I help at home?',
      aiOutput: 'Ask Priya to explain one fractions example in her own words over dinner tonight. Attendance is 98% and overall progress is strong.',
      tag: 'Parent Family Digest',
      metric: 'Supportive Dialogue',
    },
  };

  const current = contexts[activeTab];

  return (
    <section id="ai-intelligence" className="py-16 md:py-20 bg-[#172033] text-white border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
            Context-Grounded Intelligence
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI with context. Not just AI chat.
          </h2>
          <p className="text-base text-stone-300 font-normal leading-relaxed">
            Operating strictly over canonical school records. One single dataset produces three role-specific next actions.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            Teacher AI Context
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            Student AI Context
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'parent'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            Parent AI Context
          </button>
        </div>

        {/* 2-Panel Context Visual Box */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* User Query Left */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-stone-400">
                  {current.role} INQUIRY
                </span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{current.tag}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white leading-snug">
                &quot;{current.question}&quot;
              </h3>
            </div>
            <p className="text-xs text-stone-400 font-medium">
              Grounded in Priya Patel&apos;s live Class 8A performance data.
            </p>
          </div>

          {/* AI Grounded Response Right */}
          <div className="lg:col-span-7 p-6 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                  AI RECOMMENDATION
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {current.metric}
                </span>
              </div>
              <p className="text-sm text-emerald-100 font-medium leading-relaxed bg-black/30 p-3.5 rounded-lg border border-emerald-500/20 font-mono">
                {current.aiOutput}
              </p>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center justify-between">
              <span>Zero hallucinations • Direct database context</span>
              <span className="text-emerald-400 font-bold">Actionable</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
