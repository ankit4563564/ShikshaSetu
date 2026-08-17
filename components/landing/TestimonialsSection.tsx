'use client';

import React from 'react';

const ROLE_VALUE_STATEMENTS = [
  {
    role: 'Teacher',
    emoji: '🍎',
    valueStatement: 'Less admin. More teaching.',
    accent: 'border-t-amber-500',
    bg: 'bg-amber-50/50',
    tagColor: 'text-amber-700 bg-amber-100/60 border-amber-200',
    description: 'Attendance registers auto-populated before class begins. Instant homework distribution and AI-assisted parent updates.',
  },
  {
    role: 'Parent',
    emoji: '👨‍👩‍👧',
    valueStatement: 'Know what happened without calling the school.',
    accent: 'border-t-emerald-500',
    bg: 'bg-emerald-50/50',
    tagColor: 'text-emerald-700 bg-emerald-100/60 border-emerald-200',
    description: 'Real-time gate entry logs, live bus telemetry, and homework visibility delivered straight to your phone.',
  },
  {
    role: 'Admin',
    emoji: '🏫',
    valueStatement: 'See what needs attention.',
    accent: 'border-t-sky-500',
    bg: 'bg-sky-50/50',
    tagColor: 'text-sky-700 bg-sky-100/60 border-sky-200',
    description: 'Holistic operational radar across attendance, campus safety, and staff metrics in one unified dashboard.',
  },
  {
    role: 'Gate Security',
    emoji: '🛡️',
    valueStatement: 'Verify every pickup.',
    accent: 'border-t-rose-500',
    bg: 'bg-rose-50/50',
    tagColor: 'text-rose-700 bg-rose-100/60 border-rose-200',
    description: 'Instant QR verification and digital gate pass authorization protecting student dismissal in under 2 seconds.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20 bg-surface-container-low rounded-[2rem] my-8" id="roles-value">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            <span className="font-label-sm text-[13px] text-primary tracking-widest uppercase font-bold">Role-Based Impact</span>
          </div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-display font-black tracking-tight">
            Built for the people who run schools every day.
          </h2>
          <p className="font-body-lg text-[16px] text-on-surface-variant font-medium leading-relaxed">
            Purpose-built tools for every stakeholder in the school ecosystem.
          </p>
        </div>

        {/* 4 Role Value Statement Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLE_VALUE_STATEMENTS.map((card) => (
            <div
              key={card.role}
              className={`rounded-2xl p-6 border border-slate-200/80 border-t-4 ${card.accent} ${card.bg} bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{card.emoji}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${card.tagColor}`}>
                    {card.role}
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-slate-900 text-lg leading-snug">
                  {card.valueStatement}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
