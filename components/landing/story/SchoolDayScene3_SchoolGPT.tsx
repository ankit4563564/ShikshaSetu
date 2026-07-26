'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function SchoolDayScene3_SchoolGPT() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'evidence' | 'action'>('analysis');

  return (
    <section className="w-full bg-[#0b0f19] text-white py-24 sm:py-32 font-body overflow-hidden relative">
      {/* Deep Space Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-[160px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-16 relative z-10">
        {/* Scene Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-extrabold uppercase tracking-widest">
            SCENE 3 • AI INTELLIGENCE 11:30 AM
          </span>
          <h2 className="font-display text-3xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            SchoolGPT notices <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              what humans miss.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            While analyzing mid-day classroom logs, SchoolGPT flags early academic drops, explains the root cause using verified facts, and drafts actionable support notes.
          </p>
        </div>

        {/* Cinematic Glass Showcase Container */}
        <div className="max-w-4xl mx-auto p-6 sm:p-10 bg-slate-900/90 border border-slate-700/80 rounded-[24px] backdrop-blur-xl shadow-2xl space-y-6">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-display text-sm font-extrabold text-white">
                SchoolGPT Ambient Intelligence • Aarav Sharma Flag
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
              ✓ Verified Gradebook Data
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'analysis' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. AI Analysis
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'evidence' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Verified Facts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('action')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'action' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. 1-Click WhatsApp Action
            </button>
          </div>

          {/* Dynamic Content Display */}
          <div className="space-y-4 min-h-[140px] text-xs text-slate-300 leading-relaxed font-medium">
            {activeTab === 'analysis' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <h4 className="font-bold text-white text-sm">📌 Finding: Early Algebra Support Needed</h4>
                <p>
                  Aarav Sharma maintains 94% attendance and 85% in Physics, but experienced an 8% drop in Algebra tests following 2 missed lab assignments.
                </p>
              </motion.div>
            )}

            {activeTab === 'evidence' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold">• Algebra Test Score: 74%</span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold">• Physics Score: 85%</span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold">• Homework Rate: 100%</span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold">• Class Attendance: 94%</span>
              </motion.div>
            )}

            {activeTab === 'action' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl space-y-2">
                <h4 className="font-bold text-emerald-300 text-xs">💬 Draft Message to Parent:</h4>
                <p className="text-slate-200 text-xs italic">
                  &ldquo;Dear Parent, Aarav is excelling in Physics (85%) but needs a quick 15-min practice on Algebra equations. We recommend a light revision sheet today!&rdquo;
                </p>
                <div className="pt-2">
                  <button type="button" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md transition-all">
                    ⚡ Send via WhatsApp (1-Click)
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
