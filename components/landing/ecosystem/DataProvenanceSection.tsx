'use client';

import React from 'react';

export function DataProvenanceSection() {
  const sources = [
    { role: '👨‍🏫 TEACHER', data: 'Marks, Attendance, Homework', color: 'text-[#2563EB]', bg: 'bg-blue-50/60' },
    { role: '🏛️ ADMIN', data: 'Students, Classes, School Records', color: 'text-slate-800', bg: 'bg-slate-50' },
    { role: '🎓 STUDENT', data: 'Learning Activity & Quizzes', color: 'text-[#0D9488]', bg: 'bg-teal-50/60' },
    { role: '🚌 DRIVER', data: 'Live Hardware GPS Telemetry', color: 'text-[#D97706]', bg: 'bg-amber-50/60' },
    { role: '🏡 PARENT', data: 'Gate Passes & Communication', color: 'text-[#10B981]', bg: 'bg-emerald-50/60' },
  ];

  return (
    <section className="py-14 md:py-18 bg-[#FFFDF9] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-2 text-left">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            DATA PROVENANCE &amp; TRUTH
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            THE DATA DOESN&apos;T COME FROM AI. <br className="hidden sm:block" />
            IT COMES FROM THE SCHOOL.
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal">
            AI helps interpret and use authorized information. It does not invent school facts.
          </p>
        </div>

        {/* Real Source Entry Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
          {sources.map((s) => (
            <div
              key={s.role}
              className={`p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 flex flex-col justify-between ${s.bg}`}
            >
              <div className="space-y-1">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${s.color}`}>
                  {s.role}
                </span>
                <p className="text-xs font-bold text-[#102A43]">
                  {s.data}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Verified Source Entry</span>
            </div>
          ))}
        </div>

        {/* Convergence Pipeline */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-center gap-3 text-xs font-bold text-[#102A43]">
          <span>Point-of-Action Human Data Entry</span>
          <span className="text-[#2563EB]">→</span>
          <span>PostgreSQL Normalized Canonical Storage</span>
          <span className="text-[#2563EB]">→</span>
          <span>ShikshaSetu Context Rules Engine</span>
          <span className="text-[#2563EB]">→</span>
          <span className="text-emerald-700 font-extrabold">Synchronized Next Actions</span>
        </div>
      </div>
    </section>
  );
}
