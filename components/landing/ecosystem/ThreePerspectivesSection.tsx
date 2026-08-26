'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function ThreePerspectivesSection() {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | 'parent'>('teacher');
  const [isLoopTourActive, setIsLoopTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const loopSteps: ('teacher' | 'student' | 'parent')[] = ['teacher', 'student', 'parent'];

  useEffect(() => {
    if (!isLoopTourActive) return;
    const interval = setInterval(() => {
      setTourStep((prev) => {
        const next = (prev + 1) % loopSteps.length;
        setSelectedRole(loopSteps[next]);
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [isLoopTourActive]);

  const perspectives = {
    teacher: {
      roleTitle: 'Teacher Copilot',
      inquiry: '“What should I teach next?”',
      tagDesc: '3 students struggled with Equivalent Fractions.',
      insight: 'Consistent difficulty in multiplying denominators during fractions check.',
      recommended: 'Run a 10-minute visual review before tomorrow’s lesson.',
      actionLabel: 'Create Quick Check',
      portalHref: '/teacher',
      portalLabel: 'Open Teacher Copilot',
      badge: 'Action: Plan Targeted Intervention',
    },
    student: {
      roleTitle: 'Student SchoolMitra',
      inquiry: '“What should I learn next?”',
      tagDesc: 'Equivalent Fractions is your next focus.',
      insight: 'Step-by-step visual fraction bars and worked examples ready.',
      recommended: 'Try a 15-minute practice session and 3 quick check questions.',
      actionLabel: 'Start 15-Min Revision',
      portalHref: '/student',
      portalLabel: 'Open SchoolMitra',
      badge: 'Action: Adaptive Self-Revision',
    },
    parent: {
      roleTitle: 'Parent Guide',
      inquiry: '“How can I help at home?”',
      tagDesc: 'Priya may benefit from a little extra practice.',
      insight: '98% overall attendance, strong in Science; gentle fractions recap recommended.',
      recommended: 'Ask her to explain one fractions question tonight over dinner.',
      actionLabel: 'View Home Talking Prompts',
      portalHref: '/parent',
      portalLabel: 'Open Parent Guide',
      badge: 'Action: Constructive Dinner Dialogue',
    },
  };

  const current = perspectives[selectedRole];

  return (
    <section id="perspectives" className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Headline */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-[#102A43] tracking-tight uppercase">
            ONE STUDENT. ONE TRUTH. THREE COPILOTS.
          </h2>
          <p className="text-sm sm:text-base text-[#102A43]/80 leading-relaxed">
            Teachers, students and parents see the same learning journey — with AI guidance designed for what each person needs to do next.
          </p>
        </div>

        {/* Soft Blue Canvas Container */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#E8F2FC] border border-[#2563EB]/15 shadow-[0_8px_32px_rgba(37,99,235,0.06)] space-y-6">
          {/* Main Card with Shared Canonical Student at Center */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_8px_30px_rgba(16,42,67,0.08)] space-y-6">
            {/* Header: Student Identity Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#2563EB]/30 shadow-xs">
                  <Image
                    src="/images/editorial_hero_student.jpg"
                    alt="Priya Patel"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-[#102A43]">
                    <span>Priya Patel</span>
                    <span className="text-stone-300">•</span>
                    <span>Class 8A</span>
                    <span className="text-stone-300">•</span>
                    <span className="font-mono text-xs font-bold text-[#F59E0B] bg-[#FFF9F0] px-2.5 py-0.5 rounded-md border border-[#F59E0B]/30">
                      Mathematics: 58% (Needs Practice)
                    </span>
                  </div>
                  <p className="text-xs text-[#102A43]/60 font-medium mt-0.5">
                    Learning focus: <strong className="text-[#102A43]">Equivalent Fractions</strong>
                  </p>
                </div>
              </div>

              {/* Loop Demo Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsLoopTourActive(!isLoopTourActive);
                  if (!isLoopTourActive) {
                    setSelectedRole('teacher');
                    setTourStep(0);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto ${
                  isLoopTourActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-emerald-50 text-[#16A085] hover:bg-emerald-100 border border-[#16A085]/30'
                }`}
              >
                <span>{isLoopTourActive ? '⏸ Stop Demo Loop' : '🔄 See the learning loop →'}</span>
              </button>
            </div>

            {/* 3 Interactive Role Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsLoopTourActive(false);
                  setSelectedRole('teacher');
                }}
                className={`py-3 px-4 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                  selectedRole === 'teacher'
                    ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                    : 'bg-[#F8FAFC] text-[#102A43]/80 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>👩‍🏫</span>
                <span>Teacher Copilot</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoopTourActive(false);
                  setSelectedRole('student');
                }}
                className={`py-3 px-4 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                  selectedRole === 'student'
                    ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                    : 'bg-[#F8FAFC] text-[#102A43]/80 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>🎓</span>
                <span>Student SchoolMitra</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoopTourActive(false);
                  setSelectedRole('parent');
                }}
                className={`py-3 px-4 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                  selectedRole === 'parent'
                    ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                    : 'bg-[#F8FAFC] text-[#102A43]/80 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>👨‍👩‍👧</span>
                <span>Parent Guide</span>
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
                {/* Left: Role Inquiry & Observation */}
                <div className="md:col-span-7 space-y-3 text-sm text-[#102A43]">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
                      {current.roleTitle} Inquiry
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#102A43]">
                      {current.inquiry}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#102A43]/80 leading-relaxed font-medium">
                    <strong className="text-[#102A43]">Observed Evidence:</strong> {current.tagDesc} {current.insight}
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#F59E0B]/30 space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                      Role-Specific Next Action
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#102A43]">
                      {current.recommended}
                    </p>
                  </div>
                </div>

                {/* Right: Real Portal Connection Action Card */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-[#F8FAFC] border border-stone-200 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#16A085] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                      {current.badge}
                    </span>
                    <p className="text-xs sm:text-[13px] text-[#102A43]/80 leading-relaxed font-medium">
                      One shared database fact generates three distinct, permissioned interventions without contradictory data.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                    <Link
                      href={current.portalHref}
                      className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                    >
                      <span>{current.portalLabel}</span>
                      <span>&rarr;</span>
                    </Link>
                    <span className="text-[10px] font-mono text-stone-400">Class 8A</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Trust Line */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#102A43]/60 font-medium">
              <span>Same learner. Same evidence. Different perspective.</span>
              <span className="text-[#16A085] font-bold">✓ Canonical Integrity</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
