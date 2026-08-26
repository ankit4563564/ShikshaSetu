'use client';

import React from 'react';

export function TheDifferenceSection() {
  return (
    <section id="the-difference" className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="text-left space-y-2 max-w-3xl">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            DIFFERENTIATION
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            NOT JUST AN ERP.
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal">
            From recording what happened to deciding what happens next.
          </p>
        </div>

        {/* Visual Comparison Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Box: Traditional ERP */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.05)] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                TRADITIONAL SCHOOL ERP
              </span>

              <div className="space-y-2 text-sm text-[#102A43]/80 font-medium">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  📋 Attendance, Marks, Homework, Reports
                </div>
                <div className="text-center font-bold text-slate-400">↓</div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-700">
                  RECORD
                </div>
                <div className="text-center font-bold text-slate-400">↓</div>
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-center font-bold text-slate-800">
                  DASHBOARD
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100">
              Digitizes past records, but leaves next actions up to manual guesswork.
            </p>
          </div>

          {/* Right Box: ShikshaSetu */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#2563EB] shadow-[0_8px_30px_rgba(37,99,235,0.12)] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
                SHIKSHASETU CONNECTED ECOSYSTEM
              </span>

              <div className="space-y-2 text-sm text-[#102A43] font-medium">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 font-semibold">
                  🏫 School Data (Marks, Attendance, Submissions)
                </div>
                <div className="text-center font-bold text-[#2563EB]">↓</div>
                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-center font-bold text-teal-900">
                  UNDERSTANDING
                </div>
                <div className="text-center font-bold text-[#2563EB]">↓</div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-center font-bold text-amber-900">
                  ACTION
                </div>
                <div className="text-center font-bold text-[#2563EB]">↓</div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-center font-bold text-emerald-900">
                  OUTCOME
                </div>
              </div>
            </div>

            <p className="text-xs text-emerald-800 font-bold pt-2 border-t border-blue-100">
              ✓ Synchronously triggers role-specific next actions across Teacher, Student, and Parent.
            </p>
          </div>
        </div>

        {/* Prominent Bottom Takeaway Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#102A43] text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <p className="text-sm sm:text-base font-semibold leading-relaxed">
            &quot;Traditional ERPs help schools manage what happened.<br className="hidden sm:block" />
            <strong className="text-amber-300">ShikshaSetu connects that information to what should happen next.</strong>&quot;
          </p>
          <span className="px-4 py-2 rounded-xl bg-white/10 text-white font-mono text-xs font-bold shrink-0 border border-white/15">
            Single Canonical Truth
          </span>
        </div>
      </div>
    </section>
  );
}
