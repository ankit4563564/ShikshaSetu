'use client';

import React from 'react';

export function TheDifferenceSection() {
  return (
    <section id="the-difference" className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Heading */}
        <div className="text-left">
          <h2 className="font-display text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight uppercase">
            NOT JUST AN ERP
          </h2>
        </div>

        {/* Visual Funnel Diagram matching PNG */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_8px_30px_rgba(16,42,67,0.06)] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Traditional ERP Silos */}
            <div className="lg:col-span-4 space-y-3">
              <span className="font-display text-sm font-bold text-[#102A43] block">
                Traditional ERP
              </span>

              <div className="space-y-2.5 relative">
                {/* Silo 1: Attendance */}
                <div className="p-3 rounded-xl bg-white border border-[#102A43]/15 shadow-xs flex items-center justify-between relative overflow-hidden">
                  <div className="space-y-0.5">
                    <h4 className="font-display text-xs font-bold text-[#102A43]">Attendance</h4>
                    <p className="text-[10px] text-[#102A43]/60">Paper based, weekly</p>
                  </div>
                  <div className="w-8 h-2 bg-[#2563EB] rounded-r -mr-3" />
                </div>

                {/* Silo 2: Marks & Exams */}
                <div className="p-3 rounded-xl bg-white border border-[#102A43]/15 shadow-xs flex items-center justify-between relative overflow-hidden">
                  <div className="space-y-0.5">
                    <h4 className="font-display text-xs font-bold text-[#102A43]">Marks &amp; Exams</h4>
                    <p className="text-[10px] text-[#102A43]/60">Separate spreadsheet, lost data</p>
                  </div>
                  <div className="w-8 h-2 bg-[#F59E0B] rounded-r -mr-3" />
                </div>

                {/* Silo 3: Homework Hub */}
                <div className="p-3 rounded-xl bg-white border border-[#102A43]/15 shadow-xs flex items-center justify-between relative overflow-hidden">
                  <div className="space-y-0.5">
                    <h4 className="font-display text-xs font-bold text-[#102A43]">Homework Hub</h4>
                    <p className="text-[10px] text-[#102A43]/60">Static assignments, no feedback</p>
                  </div>
                  <div className="w-8 h-2 bg-[#2563EB] rounded-r -mr-3" />
                </div>
              </div>
            </div>

            {/* Middle: Convergence Arrow Graphic */}
            <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
              <svg width="48" height="80" viewBox="0 0 48 80" fill="none" className="text-[#2563EB]">
                <path d="M0 15 C 24 15, 24 40, 44 40" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M0 40 L 44 40" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M0 65 C 24 65, 24 40, 44 40" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
                <polygon points="40,35 48,40 40,45" fill="#2563EB" />
              </svg>
            </div>

            {/* Right: ShikshaSetu Connected Ecosystem */}
            <div className="lg:col-span-7 space-y-3">
              <span className="font-display text-sm font-bold text-[#102A43] block">
                ShikshaSetu - The Connected Learning Ecosystem
              </span>

              {/* 4 Connected Stages with horizontal arrows */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-stretch">
                {/* 1. Evidence */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-stone-200 text-center flex flex-col justify-between space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#102A43] block">
                    EVIDENCE
                  </span>
                  <p className="text-[10px] text-[#102A43]/70 leading-tight">
                    Daily quizzes, homework, AI-formative.
                  </p>
                </div>

                {/* 2. Understanding */}
                <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#2563EB]/25 text-center flex flex-col justify-between space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
                    UNDERSTANDING
                  </span>
                  <p className="text-[10px] text-[#102A43]/70 leading-tight">
                    Identify learning gaps, student strengths.
                  </p>
                </div>

                {/* 3. Action */}
                <div className="p-3 rounded-xl bg-[#FFF9F0] border border-[#F59E0B]/30 text-center flex flex-col justify-between space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F59E0B] block">
                    ACTION
                  </span>
                  <p className="text-[10px] text-[#102A43]/70 leading-tight">
                    Targeted teacher support, personalized practice.
                  </p>
                </div>

                {/* 4. Outcome */}
                <div className="p-3 rounded-xl bg-[#16A085] text-white text-center flex flex-col justify-between space-y-1.5 shadow-xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white block">
                    OUTCOME
                  </span>
                  <p className="text-[10px] text-white/90 leading-tight font-medium">
                    78% Mastery in Maths. Real-time growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Summary Banner */}
          <div className="pt-3 border-t border-stone-100 text-center text-xs font-medium text-[#102A43]/70">
            <span>Data gets recorded. Nothing changes. &rarr; </span>
            <strong className="text-[#102A43] font-bold uppercase">DATA BECOMES ACTION</strong>
            <span> for every stakeholder.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
