'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function AiEcosystemSection() {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const contexts = {
    teacher: {
      role: 'TEACHER',
      question: 'What should I teach next?',
      inputData: 'Unit Test 1: Priya scored 58% (3 questions missed in Section B fractions)',
      aiInsight: 'Equivalent Fractions: Denominator multiplication rule misunderstood',
      recommendedAction: '5-minute visual fraction bar comparison review in Period 1 tomorrow',
      tag: 'Teacher Copilot',
      metric: 'Formative Diagnosis',
    },
    student: {
      role: 'STUDENT',
      question: 'What should I learn tonight?',
      inputData: 'Mathematics: 58% on Fractions • 2 homework attempts pending',
      aiInsight: 'Ready for worked examples & 1-minute visual cheat sheet',
      recommendedAction: 'Personalized 15-minute digital revision notebook + 3 quick check questions',
      tag: 'SchoolMitra Companion',
      metric: '15-Min Focused Study',
    },
    parent: {
      role: 'PARENT',
      question: 'How can I help at home?',
      inputData: '98% attendance • 58% Mathematics • All assignments submitted on time',
      aiInsight: 'Overall progress healthy; only fractions requires light evening practice',
      recommendedAction: 'Ask Priya to explain one fractions example in her own words over dinner tonight',
      tag: 'Parent Family Digest',
      metric: 'Supportive Dialogue',
    },
  };

  const current = contexts[activeTab];

  return (
    <section id="ai-intelligence" className="py-16 md:py-20 bg-[#102A43] text-white border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB] bg-blue-900/40 border border-blue-400/30 px-2.5 py-0.5 rounded">
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
                ? 'bg-[#2563EB] text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)]'
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
                ? 'bg-[#F59E0B] text-white shadow-[0_4px_14px_rgba(245,158,11,0.3)]'
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
                ? 'bg-[#F97360] text-white shadow-[0_4px_14px_rgba(249,115,96,0.3)]'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            Parent AI Context
          </button>
        </div>

        {/* 3-Tier Color Flow: Real Data (White/Cream) -> AI Insight (Blue) -> Action (Amber) -> Outcome (Mint) */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* Tier 1: Real Data */}
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-stone-400">
                01 • CANONICAL DATA
              </span>
              <span className="text-xs font-mono font-bold text-[#FFF9F0]">Input</span>
            </div>
            <h4 className="font-display text-sm font-bold text-white">
              Raw Learning Evidence
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed font-mono bg-black/30 p-3 rounded-lg border border-white/5">
              {current.inputData}
            </p>
          </div>

          {/* Tier 2: AI Insight (Blue) */}
          <div className="p-5 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-blue-400">
                02 • AI DIAGNOSIS
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">Insight</span>
            </div>
            <h4 className="font-display text-sm font-bold text-white">
              Concept Misconception
            </h4>
            <p className="text-xs text-blue-100 leading-relaxed font-mono bg-black/30 p-3 rounded-lg border border-blue-500/20">
              {current.aiInsight}
            </p>
          </div>

          {/* Tier 3: Recommended Action (Amber) */}
          <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                03 • NEXT ACTION
              </span>
              <span className="text-xs font-mono font-bold text-[#16A085]">Outcome</span>
            </div>
            <h4 className="font-display text-sm font-bold text-white">
              Actionable Plan
            </h4>
            <p className="text-xs text-amber-100 leading-relaxed font-mono bg-black/30 p-3 rounded-lg border border-amber-500/20">
              {current.recommendedAction}
            </p>
          </div>
        </motion.div>

        {/* Verification Guarantee */}
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="text-[#16A085] font-bold">✓</span>
            <span className="text-stone-300 font-medium">Grounded strictly in verified database facts. Zero hallucinations.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">{current.metric}</span>
        </div>
      </div>
    </section>
  );
}
