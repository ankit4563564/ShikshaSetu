'use client';

import React from 'react';

export function RealStudentExampleSection() {
  return (
    <section className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-2 text-left">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            REAL MVP DATA JOURNEY
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            SEE HOW DATA BECOMES ACTION.
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal">
            Tracing canonical student Aarav Sharma (Class 8A) across all three portals.
          </p>
        </div>

        {/* Step-by-Step Data to Action Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: The Fact */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 block">
                CANONICAL SCHOOL RECORD
              </span>
              <h3 className="font-display text-2xl font-black text-[#102A43]">
                58% in Mathematics
              </h3>
              <p className="text-xs text-[#102A43]/80 font-medium">
                Student: <strong>Aarav Sharma</strong> &bull; Class: <strong>8A</strong><br />
                Topic Gap: <strong>Equivalent Fractions</strong><br />
                Assessment: Term 2 Unit Diagnostic
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-800 font-bold text-center">
              SAME DATA → DIFFERENT ACTIONS
            </div>
          </div>

          {/* Right Column: 3 Real Synchronized Actions */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
            {/* Step 1: Teacher */}
            <div className="p-5 rounded-2xl bg-white border border-[#102A43]/10 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[#2563EB] block">
                  1. TEACHER ACTION
                </span>
                <h4 className="font-display text-sm font-bold text-[#102A43]">
                  Identifies Learning Need
                </h4>
                <p className="text-xs text-[#102A43]/70 leading-relaxed">
                  Attention Radar flags Aarav and recommends a 10-minute visual fraction strips review before Friday&apos;s exam.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded text-center block">
                Targeted Classroom Support
              </span>
            </div>

            {/* Step 2: Student */}
            <div className="p-5 rounded-2xl bg-white border border-[#102A43]/10 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[#0D9488] block">
                  2. STUDENT ACTION
                </span>
                <h4 className="font-display text-sm font-bold text-[#102A43]">
                  Receives Relevant Practice
                </h4>
                <p className="text-xs text-[#102A43]/70 leading-relaxed">
                  Action Center prioritizes Friday exam prep with NCERT-grounded revision notes and a 3-question diagnostic quiz.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#0D9488] bg-teal-50 px-2 py-1 rounded text-center block">
                5-Min Practice Loop
              </span>
            </div>

            {/* Step 3: Parent */}
            <div className="p-5 rounded-2xl bg-white border border-[#102A43]/10 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[#D97706] block">
                  3. PARENT ACTION
                </span>
                <h4 className="font-display text-sm font-bold text-[#102A43]">
                  Understands How to Support
                </h4>
                <p className="text-xs text-[#102A43]/70 leading-relaxed">
                  Parent Companion gives Sunita a simple dinner question prompt: &quot;Ask Aarav why 2/4 is the same as 1/2.&quot;
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#D97706] bg-amber-50 px-2 py-1 rounded text-center block">
                Practical Home Guidance
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
