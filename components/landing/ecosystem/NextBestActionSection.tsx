'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function NextBestActionSection() {
  const cards = [
    {
      role: 'TEACHER',
      question: 'WHO NEEDS ME?',
      tag: 'Faculty Focus',
      description:
        'Support radar pinpoints the 3 students in Section 8A who struggled with fractions, so teachers can conduct a 5-minute review before misconceptions compound.',
      outcome: 'No student slips through the cracks unseen.',
    },
    {
      role: 'STUDENT',
      question: 'WHAT SHOULD I LEARN?',
      tag: 'Learner Clarity',
      description:
        'Personalized digital study notebook serving high-yield 15-minute revision notes, worked examples, and instant 3-question quick checks.',
      outcome: 'Zero guesswork about what to study tonight.',
    },
    {
      role: 'PARENT',
      question: 'HOW CAN I HELP?',
      tag: 'Home Support',
      description:
        'Clear, constructive dinner conversation starters and supportive prompts instead of confusing raw percentages and stressful interrogations.',
      outcome: 'Replaces anxiety with encouraging family dialogue.',
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
            Action-Oriented Design
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            Every login should answer one question.
          </h2>
          <p className="text-base text-stone-600 font-normal leading-relaxed">
            ShikshaSetu turns school data into the <strong className="text-[#172033] font-bold">next useful action</strong> for every stakeholder.
          </p>
        </div>

        {/* 3 Action Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.role}
              className="p-7 rounded-2xl bg-[#FAF9F6] border border-stone-300 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {c.role}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    {c.tag}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#172033] tracking-tight">
                  &quot;{c.question}&quot;
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 text-[11px] font-bold text-[#16836A] flex items-center gap-1.5">
                <span>✓</span>
                <span>{c.outcome}</span>
              </div>
            </div>
          ))}
        </div>

        {/* The 4th Synthesis Banner */}
        <div className="p-7 rounded-2xl bg-stone-100 border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
              The Ecosystem Synthesis
            </span>
            <h4 className="font-display text-lg font-bold text-[#172033]">
              SHIKSHASETU: &quot;WHAT SHOULD HAPPEN NEXT?&quot;
            </h4>
            <p className="text-xs text-stone-600 max-w-xl">
              The intelligent engine connects all three answers into one continuous feedback loop around the student&apos;s real-time journey.
            </p>
          </div>

          <div className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-center shrink-0 shadow-2xs">
            <span className="text-xs font-bold text-[#16836A] block">
              100% Loop Closure
            </span>
            <span className="text-[10px] text-stone-500">One connected dataset</span>
          </div>
        </div>
      </div>
    </section>
  );
}
