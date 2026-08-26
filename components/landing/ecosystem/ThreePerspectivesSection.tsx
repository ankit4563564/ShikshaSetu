'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function ThreePerspectivesSection() {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const perspectives = {
    teacher: {
      tag: 'Teacher Perspective:',
      tagDesc: 'Priya struggling with Equivalent Fractions.',
      insight: 'AI Insight: Consistent difficulty in conceptual understanding.',
      action: 'Action: Assign 5-minute video lesson & targeted 9 question quiz.',
      subtext: '3 others in Class 8A need similar support.',
      callout: 'Switch to review in: suggestions and personalized notes on progress.',
    },
    student: {
      tag: 'Student Perspective:',
      tagDesc: 'Ready to master Equivalent Fractions.',
      insight: 'AI Insight: Step-by-step worked examples recommended for visual learner.',
      action: 'Action: 15-minute digital revision sheet & 3 quick check questions.',
      subtext: 'Completed 2 quizzes with 85% accuracy.',
      callout: 'Open lined digital study notebook with 1-minute cheat sheets.',
    },
    parent: {
      tag: 'Parent Perspective:',
      tagDesc: 'Support Priya with encouraging dinner dialogue.',
      insight: 'AI Insight: Attendance 98%, strong in Science, needs gentle fractions recap.',
      action: 'Action: Ask Priya to explain one fractions question tonight.',
      subtext: 'No panic needed; focused 5-minute home review is sufficient.',
      callout: 'Daily family digest with constructive conversation starter prompts.',
    },
  };

  const current = perspectives[selectedRole];

  return (
    <section id="perspectives" className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Soft Blue Canvas Container matching PNG */}
        <div className="p-7 sm:p-10 rounded-3xl bg-[#E8F2FC] border border-[#2563EB]/15 shadow-[0_8px_32px_rgba(37,99,235,0.06)] space-y-6">
          {/* Section Headline */}
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight uppercase">
              ONE STUDENT. THREE PERSPECTIVES. ONE TRUTH.
            </h2>
          </div>

          {/* Main White Showpiece Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.05)] space-y-5">
            {/* Header: Student Identity Badge */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#102A43]/15">
                <Image
                  src="/images/editorial_hero_student.jpg"
                  alt="Priya Patel"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#102A43]">
                <span>Priya Patel</span>
                <span className="text-stone-300">•</span>
                <span>Class 8A</span>
                <span className="text-stone-300">•</span>
                <span className="font-mono text-[#F59E0B] bg-[#FFF9F0] px-2 py-0.5 rounded border border-[#F59E0B]/30">
                  58% (Needs Practice)
                </span>
              </div>
            </div>

            {/* 3 Role Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'teacher'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#102A43]/80 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Teacher: &quot;Who needs my attention?&quot;
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#102A43]/80 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Student: &quot;What should I learn?&quot;
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('parent')}
                className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'parent'
                    ? 'bg-[#2563EB] text-white shadow-xs'
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
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1"
              >
                {/* Left: Perspective Narrative */}
                <div className="md:col-span-8 space-y-2 text-xs text-[#102A43]">
                  <p className="leading-snug">
                    <strong className="font-bold">{current.tag}</strong> {current.tagDesc}
                  </p>
                  <p className="leading-snug text-[#102A43]/80">
                    {current.insight}
                  </p>
                  <p className="leading-snug">
                    <strong className="font-bold text-[#2563EB]">{current.action}</strong>
                  </p>
                  <p className="text-[11px] text-[#102A43]/60 pt-1">
                    {current.subtext}
                  </p>
                </div>

                {/* Right: Callout Card */}
                <div className="md:col-span-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-stone-200 flex items-center justify-center text-center">
                  <p className="text-[11px] text-[#102A43]/80 font-medium leading-relaxed">
                    {current.callout}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
