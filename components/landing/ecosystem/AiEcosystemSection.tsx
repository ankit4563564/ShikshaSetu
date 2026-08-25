'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function AiEcosystemSection() {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'parent'>('student');

  const ais = {
    student: {
      name: 'SchoolMitra',
      role: 'Student Learning Companion',
      avatar: '🤖',
      badge: 'Grounded in NCERT Syllabus',
      userQuery: 'I don&apos;t understand why 2/4 and 1/2 are the same.',
      aiResponse:
        'Think of a delicious pizza cut into 4 slices. If you eat 2 slices, you’ve eaten half the pizza! Mathematically: 2/4 ÷ 2/2 = 1/2. Ready to try a 10-second check question?',
      action: 'Generates 1-Minute Digital Study Sheet',
    },
    teacher: {
      name: 'Teacher Copilot',
      role: 'Classroom Intelligence & Studio',
      avatar: '✨',
      badge: 'Pedagogy & Lesson Assistant',
      userQuery: 'What should I review in tomorrow’s Math class?',
      aiResponse:
        '3 students in Section 8A struggled with Equivalent Fractions on yesterday’s exit ticket. I recommend a 5-minute visual pizza-slice comparison before progressing to mixed operations.',
      action: 'Drafts Differentiated Exit Ticket & Lesson Plan',
    },
    parent: {
      name: 'Parent Digest AI',
      role: 'Actionable Family Guide',
      avatar: '💡',
      badge: 'Multilingual Family Assistant',
      userQuery: 'How is Priya doing in school this week?',
      aiResponse:
        'Priya is maintaining 98% attendance and submitted all assignments on time! In Mathematics, she is reviewing fractions. Try asking her to explain one problem to you over dinner.',
      action: 'Provides Warm, Reassuring Family Prompts',
    },
  };

  const current = ais[activeTab];

  return (
    <section id="ai-intelligence" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-white/10 border border-white/10 px-3.5 py-1 rounded-full backdrop-blur-md">
            Grounded Intelligence
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            AI that doesn&apos;t just answer. <br className="hidden sm:inline" />
            It helps you decide what&apos;s next.
          </h2>
          <p className="text-base sm:text-lg text-indigo-200/80 font-medium leading-relaxed">
            Not a generic chatbot. Three purpose-built AI engines operating on the same canonical school data.
          </p>
        </div>

        {/* AI Engine Switcher */}
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'student'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span>🤖</span>
            <span>Student Mitra</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'teacher'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span>✨</span>
            <span>Teacher Copilot</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'parent'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span>💡</span>
            <span>Parent Guide</span>
          </button>
        </div>

        {/* Dialog Demonstration Container */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto p-6 sm:p-10 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl">
                {current.avatar}
              </div>
              <div>
                <h4 className="font-display text-sm font-black text-white">{current.name}</h4>
                <p className="text-[11px] text-indigo-300 font-medium">{current.role}</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              {current.badge}
            </span>
          </div>

          {/* Chat Demonstration */}
          <div className="space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="p-4 rounded-2xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold max-w-md shadow-md">
                &quot;{current.userQuery}&quot;
              </div>
            </div>

            {/* AI message */}
            <div className="flex justify-start">
              <div className="p-5 rounded-2xl bg-white/10 border border-white/15 text-indigo-100 text-xs sm:text-sm font-medium max-w-lg leading-relaxed space-y-3">
                <p>{current.aiResponse}</p>
                <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] font-bold text-indigo-300">
                  <span>⚡</span>
                  <span>{current.action}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Factual Integrity Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center max-w-2xl mx-auto text-xs font-black text-indigo-200">
          🔒 SAME CANONICAL SCHOOL DATA • DIFFERENT ROLES • DIFFERENT ACTION
        </div>
      </div>
    </section>
  );
}
