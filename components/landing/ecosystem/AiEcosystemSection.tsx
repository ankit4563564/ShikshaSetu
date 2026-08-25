'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function AiEcosystemSection() {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const layers = {
    teacher: {
      role: 'Teacher Copilot',
      tag: 'Classroom Intelligence',
      dataInput: 'Unit Test 1: Priya scored 58% (3 questions missed in Section B)',
      aiDiagnosis: 'Equivalent Fractions: Denominator multiplication rule misunderstood',
      actionOutput: 'Recommended: 5-minute visual fraction bar review in Period 1 tomorrow',
      metric: '3 Students Flagged in Class 8A',
    },
    student: {
      role: 'SchoolMitra Study Engine',
      tag: 'Learner Companion',
      dataInput: 'Mathematics: 58% on Fractions • 2 homework attempts pending',
      aiDiagnosis: 'Ready for worked examples & 1-minute visual cheat sheet',
      actionOutput: 'Personalized 15-minute digital revision notebook + 3 quick check questions',
      metric: '15-Min Focused Session',
    },
    parent: {
      role: 'Parent Family Digest',
      tag: 'Home Partnership',
      dataInput: '98% attendance • 58% Mathematics • All homework completed on time',
      aiDiagnosis: 'Academic progress healthy; only fractions requires light evening practice',
      actionOutput: 'Suggested prompt: "Ask Priya to explain one fractions question to you tonight"',
      metric: 'Positive Family Support',
    },
  };

  const current = layers[activeTab];

  return (
    <section id="ai-intelligence" className="py-24 bg-[#172033] text-white border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
            Intelligence Layer
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI that diagnoses, explains, and recommends.
          </h2>
          <p className="text-base text-stone-300 font-normal leading-relaxed">
            Not a generic chatbot. An intelligent data layer that converts raw school signals into clear next actions for teachers, students, and parents.
          </p>
        </div>

        {/* Role Selector */}
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
            Teacher Intelligence
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
            Student Intelligence
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
            Parent Intelligence
          </button>
        </div>

        {/* 3-Tier Data to Action Architecture Flow */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Tier 1: Real School Data */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-stone-400">
                01 • Canonical School Data
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">Input</span>
            </div>
            <h4 className="font-display text-sm font-bold text-white">
              Raw Learning Evidence
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed font-mono bg-black/30 p-3 rounded-lg border border-white/5">
              {current.dataInput}
            </p>
          </div>

          {/* Tier 2: AI Understanding */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-blue-400">
                02 • AI Diagnosis
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">Understanding</span>
            </div>
            <h4 className="font-display text-sm font-bold text-white">
              Concept Misconception
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed font-mono bg-black/30 p-3 rounded-lg border border-white/5">
              {current.aiDiagnosis}
            </p>
          </div>

          {/* Tier 3: Next Best Action */}
          <div className="p-6 rounded-xl bg-blue-900/30 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                03 • Next Best Action
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">Outcome</span>
            </div>
            <h4 className="font-display text-sm font-bold text-white">
              Recommended Intervention
            </h4>
            <p className="text-xs text-emerald-200 leading-relaxed font-mono bg-black/30 p-3 rounded-lg border border-emerald-500/20">
              {current.actionOutput}
            </p>
          </div>
        </motion.div>

        {/* Grounding Guarantee */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="text-[#16836A] font-bold">✓</span>
            <span className="text-stone-300 font-medium">Grounded strictly in verified database facts. Zero hallucinations or fabricated scores.</span>
          </div>
          <span className="text-[11px] font-mono text-blue-400 font-bold">{current.metric}</span>
        </div>
      </div>
    </section>
  );
}
