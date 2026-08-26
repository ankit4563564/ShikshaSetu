'use client';

import React from 'react';

export function AiEcosystemSection() {
  const examples = [
    {
      role: '👨‍🏫 TEACHER PROMPT',
      prompt: '"Help me plan a quick 10-minute revision for students struggling with Equivalent Fractions."',
      output: 'Generates visual fraction strip exercises and CBSE exam-targeted practice questions.',
      color: 'border-blue-200 bg-blue-50/50 text-[#2563EB]',
    },
    {
      role: '🎓 STUDENT PROMPT',
      prompt: '"Can you explain why 2/4 is the same as 1/2 and give me a quick 3-question quiz?"',
      output: 'Provides intuitive pizza-slice analogy followed by an evaluated diagnostic quiz.',
      color: 'border-teal-200 bg-teal-50/50 text-[#0D9488]',
    },
    {
      role: '🏡 PARENT PROMPT',
      prompt: '"What can I do at home tonight to help Aarav prepare for his Friday Math test?"',
      output: 'Suggests a 5-minute everyday dinner question prompt tailored to his exact topic gap.',
      color: 'border-amber-200 bg-amber-50/50 text-[#D97706]',
    },
  ];

  return (
    <section className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-2 text-left">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            CONTEXTUAL INTELLIGENCE
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            AI WITH CONTEXT. NOT JUST A CHATBOT.
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal">
            AI works with authorized school context to make its responses relevant to the person using it.
          </p>
        </div>

        {/* Conceptual Visual Pipeline */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.05)] space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#102A43] text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 w-full md:w-auto flex-1">
              📊 School Data (Marks, Attendance)
            </div>
            <span className="text-slate-400 font-bold">+</span>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 w-full md:w-auto flex-1">
              🔍 Student Context (Topic Gap)
            </div>
            <span className="text-slate-400 font-bold">+</span>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 w-full md:w-auto flex-1">
              👤 User Role (Teacher / Student / Parent)
            </div>
            <span className="text-[#2563EB] font-bold">→</span>
            <div className="p-3.5 rounded-xl bg-blue-600 text-white w-full md:w-auto flex-1 shadow-xs">
              💡 Useful Guidance / Action
            </div>
          </div>

          {/* 3 Real Examples */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {examples.map((ex) => (
              <div
                key={ex.role}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block text-slate-500">
                    {ex.role}
                  </span>
                  <p className="text-xs font-bold text-[#102A43] italic">
                    {ex.prompt}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-[#102A43]/75 font-medium">
                  {ex.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
