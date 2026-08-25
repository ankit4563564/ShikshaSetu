'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function RealtimeSyncSection() {
  const syncSteps = [
    {
      actor: '👩‍🏫 Teacher',
      action: 'Publishes Science Homework',
      detail: 'Assigned to Class 8A via Teacher Portal',
      tag: 'Mutation Event',
    },
    {
      actor: '🎓 Student',
      action: 'Receives & Submits Online',
      detail: 'Completes lab report on Student Portal',
      tag: 'Instant Sync',
    },
    {
      actor: '👨‍👩‍👧 Parent',
      action: 'Notified on Parent Today',
      detail: 'Sees completed status & verified check-in',
      tag: 'Zero Lag',
    },
    {
      actor: '🤖 AI Brain',
      action: 'Updates Mastery Context',
      detail: 'SchoolGPT & Mitra reflect updated understanding',
      tag: 'Live Memory',
    },
  ];

  return (
    <section className="py-24 bg-white border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Event-Driven Architecture
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            One action. Everyone stays in sync.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            No duplicate records. No disconnected portals. <strong className="text-slate-900 font-black">Zero conflicting versions of the truth.</strong>
          </p>
        </div>

        {/* Sync Timeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {syncSteps.map((step, idx) => (
            <motion.div
              key={step.actor}
              whileHover={{ scale: 1.03, y: -4 }}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-black text-slate-900">{step.actor}</span>
                <span className="text-[9px] font-mono font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                  {step.tag}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-sm font-black text-slate-900 leading-snug">
                  {step.action}
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {step.detail}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400">
                <span>0{idx + 1}</span>
                <span className="w-8 h-px bg-slate-200" />
                <span>SYNCED</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
