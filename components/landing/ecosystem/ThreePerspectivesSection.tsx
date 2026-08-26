'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function ThreePerspectivesSection() {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const perspectives = {
    teacher: {
      roleTitle: 'Teacher Perspective',
      tagDesc: 'Priya struggling with Equivalent Fractions.',
      insight: 'Consistent difficulty in multiplying denominators during fractions.',
      action: 'Assign 5-minute visual fraction bar video lesson & targeted 9-question practice quiz.',
      subtext: '3 others in Class 8A need similar support.',
      callout: 'Switch to review in: AI-generated classroom interventions and individual progress notes.',
      actionLabel: 'Assign Targeted Intervention',
    },
    student: {
      roleTitle: 'Student Perspective',
      tagDesc: 'Ready to master Equivalent Fractions.',
      insight: 'Step-by-step worked examples recommended for visual learning.',
      action: '15-minute digital revision sheet & 3 quick check verification questions.',
      subtext: 'Completed 2 quizzes with 85% accuracy.',
      callout: 'Open lined digital study notebook with 1-minute cheat sheets & formula cards.',
      actionLabel: 'Start 15-Min Revision',
    },
    parent: {
      roleTitle: 'Parent Perspective',
      tagDesc: 'Support Priya with encouraging dinner dialogue.',
      insight: 'Overall attendance is 98%, strong in Science, gentle fractions recap recommended.',
      action: 'Ask Priya to explain one fractions question tonight over dinner in her own words.',
      subtext: 'No panic needed; focused 5-minute home review is sufficient.',
      callout: 'Daily family progress digest with constructive, anxiety-free conversation prompts.',
      actionLabel: 'View Home Talking Prompts',
    },
  };

  const current = perspectives[selectedRole];

  return (
    <section id="perspectives" className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Soft Blue Canvas Container */}
        <div className="p-6 sm:p-10 md:p-12 rounded-3xl bg-[#E8F2FC] border border-[#2563EB]/15 shadow-[0_8px_32px_rgba(37,99,235,0.06)] space-y-6">
          {/* Section Headline */}
          <div className="text-center space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-[#102A43] tracking-tight uppercase">
              ONE STUDENT. THREE PERSPECTIVES. ONE TRUTH.
            </h2>
          </div>

          {/* Main White Showpiece Card with 20-30% stronger presence */}
          <div className="p-6 sm:p-8 md:p-10 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_8px_30px_rgba(16,42,67,0.08)] space-y-6">
            {/* Header: Student Identity Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#2563EB]/30 shadow-xs">
                  <Image
                    src="/images/editorial_hero_student.jpg"
                    alt="Priya Patel"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-sm sm:text-base font-bold text-[#102A43]">
                  <span>Priya Patel</span>
                  <span className="text-stone-300">•</span>
                  <span>Class 8A</span>
                  <span className="text-stone-300">•</span>
                  <span className="font-mono text-xs font-bold text-[#F59E0B] bg-[#FFF9F0] px-2.5 py-1 rounded-md border border-[#F59E0B]/30">
                    Mathematics: 58% (Needs Practice)
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 self-start sm:self-auto">
                ✓ Single Canonical Record
              </span>
            </div>

            {/* 3 Interactive Role Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`py-2.5 px-4 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                  selectedRole === 'teacher'
                    ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                    : 'bg-[#F8FAFC] text-[#102A43]/80 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Teacher: &quot;Who needs my attention?&quot;
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`py-2.5 px-4 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                  selectedRole === 'student'
                    ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                    : 'bg-[#F8FAFC] text-[#102A43]/80 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Student: &quot;What should I learn?&quot;
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('parent')}
                className={`py-2.5 px-4 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                  selectedRole === 'parent'
                    ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                    : 'bg-[#F8FAFC] text-[#102A43]/80 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Parent: &quot;How can I help?&quot;
              </button>
            </div>

            {/* Content Details Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-stretch"
              >
                {/* Left: Perspective Narrative */}
                <div className="md:col-span-7 space-y-3 text-sm text-[#102A43]">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
                      {current.roleTitle}
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#102A43]">
                      {current.tagDesc}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#102A43]/80 leading-relaxed">
                    <strong className="text-[#102A43] font-bold">AI Diagnosis:</strong> {current.insight}
                  </p>

                  <div className="p-3 rounded-xl bg-[#FFF9F0] border border-[#F59E0B]/30 space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                      Recommended Action
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-[#102A43]">
                      {current.action}
                    </p>
                  </div>

                  <p className="text-xs text-[#102A43]/60 font-medium">
                    {current.subtext}
                  </p>
                </div>

                {/* Right: Callout Card */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-[#F8FAFC] border border-stone-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                      Live Perspective Context
                    </span>
                    <p className="text-xs sm:text-sm text-[#102A43]/85 font-medium leading-relaxed">
                      {current.callout}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-[#2563EB]">
                    <span>{current.actionLabel}</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
