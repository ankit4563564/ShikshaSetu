'use client';

import React from 'react';

export function ThreePerspectivesSection() {
  return (
    <section className="py-14 md:py-18 bg-[#FFFDF9] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2 text-left">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            CONNECTED ECOSYSTEM
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            ONE STUDENT. ONE CONNECTED JOURNEY. THREE PERSPECTIVES.
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal">
            Same underlying student information. Different actions for each role.
          </p>
        </div>

        {/* 3 Perspectives Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Perspective 1: Teacher */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.05)] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB]">
                  👨‍🏫 TEACHER PERSPECTIVE
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">Class 8A</span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#102A43]">
                &quot;Who needs my attention?&quot;
              </h3>
              <p className="text-xs sm:text-sm text-[#102A43]/75 leading-relaxed">
                Ms. Ananya sees Aarav highlighted in her 3-student attention radar with 58% in Equivalent Fractions. The system suggests a 10-minute visual review before Friday&apos;s exam.
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 font-semibold space-y-1">
              <span className="text-[10px] font-mono uppercase text-blue-700 block">Teacher Action:</span>
              <p>→ Run 10-min visual fraction strips review.</p>
            </div>
          </div>

          {/* Perspective 2: Student */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#0D9488] shadow-[0_8px_24px_rgba(13,148,136,0.12)] space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0D9488] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase font-mono">
              Learner Hub
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D9488]">
                  🎓 STUDENT PERSPECTIVE
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#102A43]">
                &quot;What should I learn next?&quot;
              </h3>
              <p className="text-xs sm:text-sm text-[#102A43]/75 leading-relaxed">
                Aarav opens his daily action center and sees Friday&apos;s Math test. He completes an interactive NCERT revision note and takes a 3-question diagnostic quiz with instant feedback.
              </p>
            </div>

            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-900 font-semibold space-y-1">
              <span className="text-[10px] font-mono uppercase text-teal-700 block">Student Action:</span>
              <p>→ 5-min practice &amp; diagnostic quiz.</p>
            </div>
          </div>

          {/* Perspective 3: Parent */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.05)] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706]">
                  🏡 PARENT PERSPECTIVE
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">Sunita Sharma</span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#102A43]">
                &quot;How can I help?&quot;
              </h3>
              <p className="text-xs sm:text-sm text-[#102A43]/75 leading-relaxed">
                Sunita sees Aarav&apos;s simple progress snapshot (Math 58%, Science 82%, English 76%) along with a practical dinner conversation question to reinforce his understanding at home.
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 font-semibold space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-800 block">Parent Action:</span>
              <p>&quot;Ask Aarav why 2/4 of a pizza is the same as 1/2.&quot;</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
