'use client';

import React from 'react';

export function RealtimeSyncSection() {
  const syncSteps = [
    {
      actor: 'Teacher',
      action: 'Publishes Science Homework',
      detail: 'Assigned to Class 8A via Teacher Workspace',
      tag: 'Event 01',
    },
    {
      actor: 'Student',
      action: 'Receives & Submits Online',
      detail: 'Completes lab report on Student Portal',
      tag: 'Event 02',
    },
    {
      actor: 'Parent',
      action: 'Notified on Parent Today',
      detail: 'Sees completed status & verified check-in',
      tag: 'Event 03',
    },
    {
      actor: 'AI Engine',
      action: 'Updates Mastery Context',
      detail: 'SchoolMitra reflects updated understanding',
      tag: 'Event 04',
    },
  ];

  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
            Event-Driven Architecture
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            One action. Everyone stays in sync.
          </h2>
          <p className="text-base text-stone-600 font-normal leading-relaxed">
            No duplicate databases. No out-of-sync portals. <strong className="text-[#172033] font-bold">Zero conflicting versions of the truth.</strong>
          </p>
        </div>

        {/* Sync Timeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {syncSteps.map((step) => (
            <div
              key={step.actor}
              className="p-6 rounded-2xl bg-white border border-stone-300 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-[#172033]">{step.actor}</span>
                <span className="text-[10px] font-mono font-bold uppercase text-[#2563EB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  {step.tag}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-[#172033]">{step.action}</h4>
                <p className="text-xs text-stone-500 font-medium leading-relaxed">{step.detail}</p>
              </div>

              <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-[#16836A]">
                ✓ Synchronized across all 3 portals
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
