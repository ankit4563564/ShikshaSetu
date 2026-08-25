'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function ThreePerspectivesSection() {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | 'parent'>('teacher');

  return (
    <section id="perspectives" className="py-16 md:py-20 bg-[#EFF6FF] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] bg-white border border-[#2563EB]/20 px-2.5 py-0.5 rounded">
            Single Source of Truth
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight">
            One student. Three perspectives. One truth.
          </h2>
          <p className="text-base text-[#102A43]/70 font-normal leading-relaxed">
            Different permissions. Different human experiences. <strong className="text-[#102A43] font-bold">Same underlying school facts.</strong>
          </p>
        </div>

        {/* Central Anchor Pill */}
        <div className="p-3.5 rounded-xl bg-white border border-[#102A43]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_16px_rgba(16,42,67,0.05)]">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[#102A43]/15">
              <Image
                src="/images/editorial_hero_student.jpg"
                alt="Priya Patel"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-display text-xs font-bold text-[#102A43]">Priya Patel • Class 8A</h4>
              <p className="text-[11px] text-[#102A43]/60 font-medium">Canonical Record • Mathematics Unit Test: 58%</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#16A085] bg-[#E6F7F2] border border-[#16A085]/30 px-3 py-1 rounded-md self-start sm:self-auto">
            Identical underlying fact
          </span>
        </div>

        {/* Semantic Role Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#102A43]/10 pb-2">
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'teacher'
                ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                : 'bg-white text-[#102A43] border border-[#102A43]/15 hover:bg-stone-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-300" />
            <span>Teacher: &quot;Who needs my attention?&quot;</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'student'
                ? 'bg-[#F59E0B] text-white shadow-[0_4px_12px_rgba(245,158,11,0.25)]'
                : 'bg-white text-[#102A43] border border-[#102A43]/15 hover:bg-stone-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-200" />
            <span>Student: &quot;What should I learn?&quot;</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('parent')}
            className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'parent'
                ? 'bg-[#F97360] text-white shadow-[0_4px_12px_rgba(249,115,96,0.25)]'
                : 'bg-white text-[#102A43] border border-[#102A43]/15 hover:bg-stone-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-200" />
            <span>Parent: &quot;How can I help?&quot;</span>
          </button>
        </div>

        {/* Editorial Content Frame */}
        <AnimatePresence mode="wait">
          {selectedRole === 'teacher' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-2xl bg-white border border-[#2563EB]/25 shadow-[0_12px_36px_rgba(37,99,235,0.08)]"
            >
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-stone-200 aspect-[4/3] bg-stone-100 shadow-2xs">
                <Image
                  src="/images/editorial_teacher_support.jpg"
                  alt="Teacher assisting student in classroom"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] border border-[#2563EB]/20 px-2 py-0.5 rounded">
                    Teacher Perspective (Blue)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#FFF9F0] px-2 py-0.5 rounded border border-[#F59E0B]/30">
                    Priya: 58% Maths
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#102A43]">
                  &quot;3 students in Class 8A struggled with Equivalent Fractions.&quot;
                </h3>

                <p className="text-xs text-[#102A43]/70 leading-relaxed">
                  Support Radar flags the misconception. Recommended Action: Conduct a 5-minute visual fraction bar comparison in tomorrow&apos;s period 1 lesson.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#16A085] font-bold">✓ Direct classroom teaching intervention</span>
                  <Link
                    href="/teacher"
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-display text-xs font-bold transition-all shadow-xs"
                  >
                    Open Teacher Workspace &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {selectedRole === 'student' && (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-2xl bg-white border border-[#F59E0B]/30 shadow-[0_12px_36px_rgba(245,158,11,0.08)]"
            >
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-stone-200 aspect-[4/3] bg-stone-100 shadow-2xs">
                <Image
                  src="/images/editorial_hero_student.jpg"
                  alt="Student revising with digital notebook"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[#FFF9F0] border border-[#F59E0B]/30 px-2 py-0.5 rounded">
                    Student Perspective (Amber)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#FFF9F0] px-2 py-0.5 rounded border border-[#F59E0B]/30">
                    Your Score: 58% Maths
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#102A43]">
                  &quot;Revise Equivalent Fractions (15 Minutes).&quot;
                </h3>

                <p className="text-xs text-[#102A43]/70 leading-relaxed">
                  SchoolMitra provides a lined study notebook with worked examples, 1-minute cheat sheets, and 3 quick concept verification questions.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#16A085] font-bold">✓ Clear study path without anxiety</span>
                  <Link
                    href="/student"
                    className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-amber-600 text-white font-display text-xs font-bold transition-all shadow-xs"
                  >
                    Start Student Revision &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {selectedRole === 'parent' && (
            <motion.div
              key="parent"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-2xl bg-white border border-[#F97360]/30 shadow-[0_12px_36px_rgba(249,115,96,0.08)]"
            >
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-stone-200 aspect-[4/3] bg-stone-100 shadow-2xs">
                <Image
                  src="/images/editorial_parent_child.jpg"
                  alt="Father discussing schoolwork with daughter"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97360] bg-[#FFF2F0] border border-[#F97360]/30 px-2 py-0.5 rounded">
                    Parent Perspective (Coral)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#FFF9F0] px-2 py-0.5 rounded border border-[#F59E0B]/30">
                    Priya: 58% Maths
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#102A43]">
                  &quot;Ask Priya to explain one fractions question tonight.&quot;
                </h3>

                <p className="text-xs text-[#102A43]/70 leading-relaxed">
                  Priya is doing well overall (98% attendance). Mathematics fractions is the single concept needing light practice. Replace interrogation with support.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#16A085] font-bold">✓ Positive family support</span>
                  <Link
                    href="/parent"
                    className="px-4 py-2 rounded-lg bg-[#F97360] hover:bg-rose-600 text-white font-display text-xs font-bold transition-all shadow-xs"
                  >
                    View Parent Portal &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
