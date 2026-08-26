'use client';

import React from 'react';

export function LearningLoopSection() {
  const steps = [
    { num: '01', title: 'OBSERVE', desc: 'Teacher logs marks, attendance, and classroom observations.', color: 'text-[#2563EB]', bg: 'bg-blue-50' },
    { num: '02', title: 'UNDERSTAND', desc: 'System identifies concept-level gaps and learning strengths.', color: 'text-[#0D9488]', bg: 'bg-teal-50' },
    { num: '03', title: 'ACT', desc: 'Portal prioritizes high-impact revision tasks and home prompts.', color: 'text-[#D97706]', bg: 'bg-amber-50' },
    { num: '04', title: 'LEARN', desc: 'Student reviews NCERT concepts with interactive analogies.', color: 'text-[#2563EB]', bg: 'bg-blue-50' },
    { num: '05', title: 'CHECK', desc: 'Diagnostic mini-quizzes measure mastery and progress.', color: 'text-[#10B981]', bg: 'bg-emerald-50' },
  ];

  return (
    <section className="py-14 md:py-18 bg-[#FFFDF9] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-2 text-left">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            CONTINUOUS IMPROVEMENT
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            THE LEARNING LOOP
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal">
            Every action creates new information for the next decision.
          </p>
        </div>

        {/* 5-Step Loop Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s) => (
            <div
              key={s.title}
              className="p-5 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.04)] space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${s.color}`}>
                    {s.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{s.num}</span>
                </div>
                <p className="text-xs text-[#102A43]/75 leading-relaxed font-medium">
                  {s.desc}
                </p>
              </div>
              <div className="text-right text-xs font-bold text-slate-300">→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
