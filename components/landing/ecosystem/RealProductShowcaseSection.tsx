'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function RealProductShowcaseSection() {
  const [activePortal, setActivePortal] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const portalContent = {
    teacher: {
      tag: '👨‍🏫 TEACHER PORTAL (/teacher)',
      question: '"Who needs my attention today?"',
      desc: 'Ms. Ananya sees a prioritized 3-student attention radar highlighting Priya (58% Math) and Aarav with actionable visual review teaching prompts.',
      action: 'Open Teacher Workspace →',
      link: '/teacher',
      color: 'text-[#2563EB]',
    },
    student: {
      tag: '🎓 STUDENT PORTAL (/student)',
      question: '"What should I learn next?"',
      desc: 'Aarav sees his daily priorities (Due Today, Test Tomorrow, 5-Min Practice) along with NCERT-grounded revision notes and diagnostic quiz feedback.',
      action: 'Open Student Command Center →',
      link: '/student',
      color: 'text-[#0D9488]',
    },
    parent: {
      tag: '🏡 PARENT PORTAL (/parent)',
      question: '"How can I help my child?"',
      desc: 'Sunita sees Aarav\'s academic health snapshot (Math 58%, Science 82%) and receives a practical dinner prompt to reinforce concepts at home.',
      action: 'Open Parent Companion →',
      link: '/parent',
      color: 'text-[#D97706]',
    },
  };

  const curr = portalContent[activePortal];

  return (
    <section className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="max-w-3xl space-y-2 text-left">
          <span className="font-mono text-xs font-bold text-[#2563EB] tracking-widest uppercase block">
            ACTUAL PRODUCT PROOF
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            SEE SHIKSHASETU IN ACTION.
          </h2>
          <p className="text-base sm:text-lg text-[#102A43]/80 font-normal">
            Three real interfaces built for three distinct everyday needs.
          </p>
        </div>

        {/* Portal Selector Tabs */}
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setActivePortal('teacher')}
            className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold transition cursor-pointer ${
              activePortal === 'teacher'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Teacher: &quot;Who needs my attention?&quot;
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('student')}
            className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold transition cursor-pointer ${
              activePortal === 'student'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Student: &quot;What should I learn next?&quot;
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('parent')}
            className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold transition cursor-pointer ${
              activePortal === 'parent'
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Parent: &quot;How can I help?&quot;
          </button>
        </div>

        {/* Active Portal Showcase Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#102A43]/10 shadow-[0_6px_24px_rgba(16,42,67,0.06)] space-y-4">
          <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${curr.color}`}>
            {curr.tag}
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-black text-[#102A43]">
            {curr.question}
          </h3>
          <p className="text-sm sm:text-base text-[#102A43]/80 leading-relaxed max-w-2xl">
            {curr.desc}
          </p>
          <div className="pt-2">
            <Link
              href={curr.link}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-display text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              <span>{curr.action}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
