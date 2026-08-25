'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function ThreePerspectivesSection() {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | 'parent'>('teacher');

  return (
    <section id="perspectives" className="py-20 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
            Single Source of Truth
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            One student. Three perspectives. One truth.
          </h2>
          <p className="text-base text-stone-600 font-normal leading-relaxed">
            Different permissions and experiences. <strong className="text-[#172033] font-bold">Same underlying school facts.</strong>
          </p>
        </div>

        {/* Central Anchor Pill */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-stone-300">
              <Image
                src="/images/editorial_hero_student.jpg"
                alt="Priya Patel"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-[#172033]">Priya Patel • Class 8A</h4>
              <p className="text-xs text-stone-500 font-medium">Canonical Record • Mathematics Unit Test 1: 58%</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#16836A] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md self-start sm:self-auto">
            Identical underlying fact
          </span>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`px-5 py-2.5 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'teacher'
                ? 'bg-[#172033] text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            Teacher Perspective
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`px-5 py-2.5 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'student'
                ? 'bg-[#172033] text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            Student Perspective
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('parent')}
            className={`px-5 py-2.5 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'parent'
                ? 'bg-[#172033] text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            Parent Perspective
          </button>
        </div>

        {/* Editorial Showpiece */}
        <AnimatePresence mode="wait">
          {selectedRole === 'teacher' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-7 sm:p-9 rounded-2xl bg-[#FAF9F6] border border-stone-300"
            >
              {/* Photo Frame */}
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-stone-300 aspect-[4/3] bg-stone-100 shadow-sm">
                <Image
                  src="/images/editorial_teacher_support.jpg"
                  alt="Teacher assisting student in classroom"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Editorial UI Content */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    Teacher Focus: &quot;Who needs my attention?&quot;
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500">Priya: 58% Maths</span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#172033]">
                  &quot;3 students in Class 8A struggled with Equivalent Fractions.&quot;
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Support Radar flags the specific misconception. Recommended Action: Conduct a 5-minute visual fraction bar comparison in tomorrow&apos;s period 1 lesson.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#16836A] font-bold">✓ Direct classroom teaching intervention</span>
                  <Link
                    href="/teacher"
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-display text-xs font-bold transition-all"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-7 sm:p-9 rounded-2xl bg-[#FAF9F6] border border-stone-300"
            >
              {/* Photo Frame */}
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-stone-300 aspect-[4/3] bg-stone-100 shadow-sm">
                <Image
                  src="/images/editorial_hero_student.jpg"
                  alt="Student revising with digital notebook"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Editorial UI Content */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    Student Focus: &quot;What should I learn?&quot;
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500">Your Score: 58% Maths</span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#172033]">
                  &quot;Revise Equivalent Fractions (15 Minutes).&quot;
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed">
                  SchoolMitra generates a digital lined study notebook with worked examples, 1-minute cheat sheets, and 3 quick concept verification questions.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#16836A] font-bold">✓ Clear study path without anxiety</span>
                  <Link
                    href="/student"
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-display text-xs font-bold transition-all"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-7 sm:p-9 rounded-2xl bg-[#FAF9F6] border border-stone-300"
            >
              {/* Photo Frame */}
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-stone-300 aspect-[4/3] bg-stone-100 shadow-sm">
                <Image
                  src="/images/editorial_parent_child.jpg"
                  alt="Father discussing schoolwork with daughter"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Editorial UI Content */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    Parent Focus: &quot;How can I help?&quot;
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500">Priya: 58% Maths</span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#172033]">
                  &quot;Ask Priya to explain one fractions question tonight.&quot;
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Priya is doing well overall (98% attendance). Mathematics fractions is the single concept needing light practice. Replace stress with encouragement.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#16836A] font-bold">✓ Positive family support</span>
                  <Link
                    href="/parent"
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-display text-xs font-bold transition-all"
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
