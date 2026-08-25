'use client';

import React from 'react';

export function TheDifferenceSection() {
  const legacySilos = [
    { title: 'Attendance', desc: 'Saved in monthly CSV' },
    { title: 'Marks & Exams', desc: 'Archived per term' },
    { title: 'Homework Hub', desc: 'Static file attachments' },
    { title: 'Report Cards', desc: 'Printed once a quarter' },
    { title: 'SMS Notices', desc: 'One-way broadcast alerts' },
  ];

  const transformations = [
    { step: 'EVIDENCE', desc: 'Daily quiz & homework signals recorded live' },
    { step: 'UNDERSTANDING', desc: 'AI diagnoses concept misconceptions' },
    { step: 'ACTION', desc: 'Teacher gets 5-min review; student gets 15-min notebook' },
    { step: 'OUTCOME', desc: 'Growth verified & measured on recheck (58% → 78%)' },
  ];

  return (
    <section id="the-difference" className="py-16 md:py-20 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
            The Architectural Shift
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            Not just an ERP.
          </h2>
          <p className="text-base text-stone-600 font-normal leading-relaxed">
            The difference is not how many administrative modules you have. It&apos;s <strong className="text-[#172033] font-bold">what the system does</strong> with the information inside them.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: TRADITIONAL ERP */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-stone-50 border border-stone-200 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Legacy Paradigm
                </span>
                <span className="text-xs font-bold text-stone-400">Traditional ERP</span>
              </div>

              <h3 className="font-display text-base font-bold text-[#172033]">
                Disconnected Data Silos
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Information is captured, stored, and forgotten. Teachers fill logs, parents see raw percentages at term-end, and students receive no guidance.
              </p>

              {/* Fragmented Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {legacySilos.map((silo) => (
                  <div key={silo.title} className="p-2.5 rounded-lg bg-white border border-stone-200">
                    <h4 className="font-display text-xs font-bold text-stone-800">{silo.title}</h4>
                    <p className="text-[10px] text-stone-400">{silo.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-stone-200/60 rounded-lg text-xs font-bold text-stone-700 flex items-center justify-between">
              <span>DATA GETS RECORDED. Nothing changes.</span>
              <span className="text-stone-400">🔒</span>
            </div>
          </div>

          {/* RIGHT: SHIKSHASETU */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-[#FAF9F6] border border-stone-300 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16836A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Connected Learning Feedback
                </span>
                <span className="text-xs font-bold text-[#2563EB]">ShikshaSetu</span>
              </div>

              <h3 className="font-display text-base font-bold text-[#172033]">
                Live Feedback Loop Around The Learner
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every quiz, attendance check, and homework mark feeds into active intelligence that drives the next action for student, teacher, and parent.
              </p>

              {/* Data Transformation Rows */}
              <div className="space-y-2 pt-1">
                {transformations.map((t, idx) => (
                  <div
                    key={t.step}
                    className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded bg-[#2563EB]/10 text-[#2563EB] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2563EB] block">
                          {t.step}
                        </span>
                        <p className="text-xs font-medium text-[#172033] leading-tight">
                          {t.desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-stone-300 font-bold hidden sm:inline">&rarr;</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs font-bold text-[#16836A] flex items-center justify-between">
              <span>DATA BECOMES ACTION for every stakeholder.</span>
              <span className="font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
