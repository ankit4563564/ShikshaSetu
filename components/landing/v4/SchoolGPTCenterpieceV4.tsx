'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Primitives';

export function SchoolGPTCenterpieceV4() {
  const [activePrompt, setActivePrompt] = useState('Why is Aarav struggling in Math?');
  const [activeResponse, setActiveResponse] = useState({
    title: 'Aarav Sharma — Academic Diagnostic',
    summary: 'Aarav exhibits 92% attendance but dropped 8% in Algebra due to missing 2 homework assignments.',
    evidence: ['Algebra Test: 74%', 'Homework Submission: 68%', 'Attendance: 92%'],
    recommendation: 'Recommend assigning 1-on-1 revision worksheet & scheduling parent check-in.',
  });

  const prompts = [
    { text: 'Why is Aarav struggling in Math?', resp: { title: 'Aarav Sharma — Math Diagnostic', summary: 'Aarav scored 92% overall but dropped in Algebra due to missed lab practice.', evidence: ['Math Score: 92%', 'Physics: 85%', 'Homework: 100%'], recommendation: 'Assign Algebra practice sheet.' } },
    { text: 'Draft parent message', resp: { title: 'Draft Message for Aarav\'s Parent', summary: 'Dear Parent, Aarav is excelling in Physics (85%) but needs light practice in Math Algebra.', evidence: ['Verified Record', 'Class 8A'], recommendation: 'Send via WhatsApp with 1 click.' } },
    { text: 'Compare Class 8A and 8B', resp: { title: 'Class 8A vs Class 8B Comparison', summary: 'Class 8A leads in Science (88% vs 81%) while Class 8B leads in English (91% vs 84%).', evidence: ['Term 3 Exam Results', '38 Students per class'], recommendation: 'Share cross-section study group plan.' } },
    { text: 'Generate PTM summary', resp: { title: 'PTM Executive Brief — Aarav Sharma', summary: '1-page printable summary covering Attendance (94%), Marks (92%), Conduct & Homework.', evidence: ['PDF Builder Ready', 'Gradebook Verified'], recommendation: 'Print or export PDF.' } },
  ];

  return (
    <section className="w-full bg-[#0b0f19] text-white py-24 sm:py-32 font-body overflow-hidden relative">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-[160px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-extrabold uppercase tracking-widest">
            ⚡ SCHOOLGPT AI
          </span>
          <h2 className="font-display text-3xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Your AI assistant for <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              every school moment.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            Ask anything, get instant answers, take smart actions across attendance, marks, homework, and parent communication.
          </p>
        </div>

        {/* Interactive AI Showcase Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Prompt Chips */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
              Try an Example Query:
            </span>
            {prompts.map((p) => (
              <button
                key={p.text}
                type="button"
                onClick={() => {
                  setActivePrompt(p.text);
                  setActiveResponse(p.resp);
                }}
                className={`w-full p-4 rounded-[24px] border text-left text-xs font-extrabold transition-all flex items-center justify-between group ${
                  activePrompt === p.text
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <span>{p.text}</span>
                <span className="text-slate-400 group-hover:text-white transition-colors">&rarr;</span>
              </button>
            ))}
          </div>

          {/* Right Live AI Response Glass Window */}
          <div className="lg:col-span-7">
            <motion.div
              key={activePrompt}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 bg-slate-900/90 border border-slate-700/80 rounded-[24px] backdrop-blur-xl shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="font-display text-sm font-extrabold text-white">{activeResponse.title}</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  ✓ Verified School Data
                </span>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-medium">
                <p>{activeResponse.summary}</p>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Evidence:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeResponse.evidence.map((ev) => (
                      <span key={ev} className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold">
                        • {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl">
                  <span className="text-[10px] font-mono text-indigo-400 font-extrabold block uppercase">Recommendation:</span>
                  <p className="text-indigo-200 text-xs font-bold pt-0.5">{activeResponse.recommendation}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">SchoolGPT Core v4</span>
                <Button href="/teacher" variant="primary" className="py-2 text-[11px]">Run Query Live &rarr;</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
