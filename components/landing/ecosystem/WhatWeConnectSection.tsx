'use client';

import React from 'react';

export function WhatWeConnectSection() {
  const pillars = [
    {
      role: '👨‍🏫 TEACHERS',
      headline: 'Less time connecting information. More time acting on it.',
      desc: 'Rapid 1-tap attendance, 3-student attention radar, and automated CBSE-compliant report card generation.',
      color: 'border-blue-200 bg-blue-50/40 text-[#2563EB]',
    },
    {
      role: '🎓 STUDENTS',
      headline: 'Clearer learning priorities. More relevant practice.',
      desc: 'Daily priorities (Due Today, Test Tomorrow, 5-Min Practice), NCERT concept chips, and evaluated diagnostic mini-quizzes.',
      color: 'border-teal-200 bg-teal-50/40 text-[#0D9488]',
    },
    {
      role: '🏡 PARENTS',
      headline: 'Better understanding. More practical support.',
      desc: 'Simple 3-subject health snapshots, 5-minute everyday dinner prompts, and live hardware GPS bus tracking.',
      color: 'border-amber-200 bg-amber-50/40 text-[#D97706]',
    },
  ];

  return (
    <section className="py-14 md:py-18 bg-[#FFFDF9] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-2 text-left">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            HUMAN-CENTERED IMPACT
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            BUILT AROUND THE PEOPLE WHO USE THE SCHOOL EVERY DAY.
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal">
            One connected view of the learner across home and classroom.
          </p>
        </div>

        {/* 3 Stakeholder Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div
              key={p.role}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.04)] space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider block text-slate-500">
                  {p.role}
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#102A43] leading-snug">
                  &quot;{p.headline}&quot;
                </h3>
                <p className="text-xs sm:text-sm text-[#102A43]/75 leading-relaxed">
                  {p.desc}
                </p>
              </div>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-slate-500">
                Connected Canonical View
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
