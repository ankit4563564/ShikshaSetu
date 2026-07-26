'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function SchoolDayScene3_SchoolGPT() {
  const [activePrompt, setActivePrompt] = useState('Why is Aarav struggling in Math?');
  const [activeResponse, setActiveResponse] = useState({
    title: 'Aarav Sharma — Math Diagnostic & Action Plan',
    summary: 'Aarav maintains 94% attendance and 85% in Physics, but experienced an 8% drop in Algebra due to missing 2 lab practice sessions.',
    facts: [
      { label: 'Class Attendance', val: '94%' },
      { label: 'Physics Score', val: '85%' },
      { label: 'Algebra Test', val: '74%' },
      { label: 'Homework Rate', val: '100%' },
    ],
    action: 'Send 1-on-1 revision worksheet & WhatsApp check-in to Aarav\'s parents.',
  });

  const prompts = [
    {
      id: 'math',
      text: 'Why is Aarav struggling in Math?',
      resp: {
        title: 'Aarav Sharma — Math Diagnostic & Action Plan',
        summary: 'Aarav maintains 94% attendance and 85% in Physics, but experienced an 8% drop in Algebra due to missing 2 lab practice sessions.',
        facts: [
          { label: 'Class Attendance', val: '94%' },
          { label: 'Physics Score', val: '85%' },
          { label: 'Algebra Test', val: '74%' },
          { label: 'Homework Rate', val: '100%' },
        ],
        action: 'Send 1-on-1 revision worksheet & WhatsApp check-in to Aarav\'s parents.',
      },
    },
    {
      id: 'draft',
      text: 'Draft parent message',
      resp: {
        title: 'Draft Message for Aarav\'s Parent (WhatsApp)',
        summary: 'Dear Parent, Aarav is doing great in Physics (85%), but needs light practice on Algebra equations. We recommend a 15-minute home review sheet today!',
        facts: [
          { label: 'Recipient', val: 'Aarav\'s Parent' },
          { label: 'Channel', val: 'WhatsApp' },
          { label: 'Tone', val: 'Supportive' },
          { label: 'Status', val: 'Ready to Send' },
        ],
        action: 'Send WhatsApp Notification Now (1-Click)',
      },
    },
    {
      id: 'compare',
      text: 'Compare Class 8A and Class 8B',
      resp: {
        title: 'Class 8A vs Class 8B Performance Overview',
        summary: 'Class 8A leads in Science (88% vs 81%), while Class 8B leads in English (91% vs 84%). Attendance is equal at 94.2%.',
        facts: [
          { label: '8A Science', val: '88%' },
          { label: '8B Science', val: '81%' },
          { label: '8A English', val: '84%' },
          { label: '8B English', val: '91%' },
        ],
        action: 'Share combined revision strategy with Subject HODs.',
      },
    },
    {
      id: 'ptm',
      text: 'Generate PTM summary',
      resp: {
        title: 'PTM Executive Brief — Aarav Sharma (Class 8A)',
        summary: '1-page printable brief covering Attendance (94%), Subject Marks, Strengths in Physics, and Algebra focus points for parent discussion.',
        facts: [
          { label: 'Overall Grade', val: '86%' },
          { label: 'Rank', val: 'Top 15%' },
          { label: 'Conduct', val: 'Excellent' },
          { label: 'PDF Status', val: 'Generated' },
        ],
        action: 'Download & Print PTM Summary Sheet (PDF)',
      },
    },
  ];

  return (
    <section id="schoolgpt" className="w-full bg-[#0b0f19] text-white py-24 sm:py-32 font-body overflow-hidden relative">
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
            Ask anything, get instant answers, take smart actions across attendance, marks, homework, and parent communication.
          </p>
        </div>

        {/* Interactive SchoolGPT Showcase Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Interactive Prompts List */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
              Try an Example Query:
            </span>
            {prompts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePrompt(p.text);
                  setActiveResponse(p.resp);
                }}
                className={`w-full p-4 rounded-[24px] border text-left text-xs font-extrabold transition-all flex items-center justify-between group cursor-pointer ${
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

          {/* Right Live Interactive Response Glass Window */}
          <div className="lg:col-span-7">
            <motion.div
              key={activePrompt}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 bg-slate-900/90 border border-slate-700/80 rounded-[24px] backdrop-blur-xl shadow-2xl space-y-6"
            >
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="font-display text-sm font-extrabold text-white">{activeResponse.title}</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  ✓ Verified School Records
                </span>
              </div>

              {/* Summary Text */}
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeResponse.summary}
              </p>

              {/* Facts Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeResponse.facts.map((f) => (
                  <div key={f.label} className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 font-medium block">{f.label}</span>
                    <span className="font-display text-base font-black text-indigo-300 block">{f.val}</span>
                  </div>
                ))}
              </div>

              {/* Action Box */}
              <div className="p-4 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono text-indigo-400 font-extrabold block uppercase">Suggested Action:</span>
                <p className="text-indigo-200 text-xs font-bold">{activeResponse.action}</p>
              </div>

              {/* Footer Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">SchoolGPT Smart Helper</span>
                <Link
                  href="/teacher"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  <span>Launch SchoolGPT</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
