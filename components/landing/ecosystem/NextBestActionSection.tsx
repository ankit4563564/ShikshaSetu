'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function NextBestActionSection() {
  const cards = [
    {
      role: 'TEACHER',
      question: 'WHO NEEDS ME?',
      icon: '🎯',
      color: 'border-blue-200/80 bg-gradient-to-b from-blue-50/60 to-white text-blue-950',
      tagColor: 'bg-blue-100 text-blue-800',
      description:
        'Instant support radar highlights exactly which learners need targeted homeroom attention before misconceptions compound.',
      outcome: 'No student slips through the cracks unseen.',
    },
    {
      role: 'STUDENT',
      question: 'WHAT SHOULD I LEARN?',
      icon: '🚀',
      color: 'border-indigo-200/80 bg-gradient-to-b from-indigo-50/60 to-white text-indigo-950',
      tagColor: 'bg-indigo-100 text-indigo-800',
      description:
        'Personalized digital study notebook serving high-yield 15-minute revision notes, worked examples, and instant self-checks.',
      outcome: 'Zero guesswork about what to study tonight.',
    },
    {
      role: 'PARENT',
      question: 'HOW CAN I HELP?',
      icon: '❤️',
      color: 'border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-white text-amber-950',
      tagColor: 'bg-amber-100 text-amber-800',
      description:
        'Clear, constructive dinner conversation starters and supportive prompts instead of raw percentages and anxious interrogations.',
      outcome: 'Replaces anxiety with meaningful family support.',
    },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Action-Oriented Architecture
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Every login should answer one question:
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            ShikshaSetu turns school data into the{' '}
            <strong className="text-slate-900 font-black">next useful action</strong> for every stakeholder.
          </p>
        </div>

        {/* 3 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((c) => (
            <motion.div
              key={c.role}
              whileHover={{ scale: 1.02, translateY: -3 }}
              className={`p-7 sm:p-8 rounded-3xl border ${c.color} shadow-xs hover:shadow-xl transition-all space-y-5 flex flex-col justify-between`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${c.tagColor}`}>
                    {c.role}
                  </span>
                  <span className="text-3xl">{c.icon}</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  &quot;{c.question}&quot;
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <span className="text-[11px] font-black text-slate-900 block">
                  ✓ {c.outcome}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The 4th Synthesis Banner */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="p-7 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              The Ecosystem Connection
            </span>
            <h4 className="font-display text-lg sm:text-xl font-black text-white">
              SHIKSHASETU: &quot;WHAT SHOULD HAPPEN NEXT?&quot;
            </h4>
            <p className="text-xs sm:text-sm text-indigo-200/80 font-medium max-w-xl">
              The intelligent learning engine synthesizes attendance, homework, and quiz evidence to connect teacher intervention, student study, and parent support.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl text-center shrink-0">
            <span className="text-[11px] font-black text-emerald-300 block">
              100% Loop Closure
            </span>
            <span className="text-[10px] text-indigo-200">Zero orphaned data</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
