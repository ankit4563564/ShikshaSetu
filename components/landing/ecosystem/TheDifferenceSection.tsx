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
    { step: 'DATA', desc: 'Formative check-ins & homework evidence recorded live' },
    { step: 'UNDERSTANDING', desc: 'AI diagnoses specific concept misconceptions' },
    { step: 'ACTION', desc: 'Teacher conducts 5-min review; student gets 15-min notebook' },
    { step: 'OUTCOME', desc: 'Understanding verified & measured on recheck (58% → 78%)' },
  ];

  return (
    <section id="the-difference" className="py-20 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
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

        {/* Editorial Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: TRADITIONAL ERP (Disconnected Records) */}
          <div className="lg:col-span-5 p-7 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Legacy Paradigm
                </span>
                <span className="text-xs font-bold text-stone-400">Traditional School ERP</span>
              </div>

              <h3 className="font-display text-lg font-bold text-[#172033]">
                Disconnected Data Silos
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Information is captured, stored, and forgotten. Teachers fill logs, parents see raw percentages at end-of-term, and students receive no guidance on what to practice.
              </p>

              {/* Fragmented Blocks */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {legacySilos.map((silo) => (
                  <div key={silo.title} className="p-3 rounded-lg bg-white border border-stone-200 text-left">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                      Isolated
                    </span>
                    <h4 className="font-display text-xs font-bold text-stone-800">{silo.title}</h4>
                    <p className="text-[10px] text-stone-500">{silo.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-stone-200/50 rounded-lg text-xs font-bold text-stone-700 flex items-center justify-between">
              <span>Result: Data gets recorded. Nothing changes.</span>
              <span className="text-stone-400">🔒</span>
            </div>
          </div>

          {/* RIGHT: SHIKSHASETU (Connected Transformation) */}
          <div className="lg:col-span-7 p-7 rounded-2xl bg-[#FAF9F6] border border-stone-300 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16836A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Connected Learning Feedback
                </span>
                <span className="text-xs font-bold text-[#2563EB]">ShikshaSetu Ecosystem</span>
              </div>

              <h3 className="font-display text-lg font-bold text-[#172033]">
                Data That Drives Action
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every quiz submission, attendance signal, and homework check-in feeds directly into active intelligence that helps teachers plan, students study, and parents encourage.
              </p>

              {/* Vertical Data Transformation Flow */}
              <div className="space-y-2.5 pt-1">
                {transformations.map((t, idx) => (
                  <div
                    key={t.step}
                    className="p-3.5 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[#2563EB]/10 text-[#2563EB] font-mono text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#2563EB] block">
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
              <span>Result: School data becomes personalized next actions.</span>
              <span className="font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
