'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function ThreePerspectivesSection() {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | 'parent'>('teacher');

  return (
    <section id="perspectives" className="py-24 bg-slate-50/70 border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Single Source of Truth
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            One student. Three perspectives. One truth.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Different permissions. Different human experiences. <strong className="text-slate-900 font-black">Same underlying school facts.</strong>
          </p>
        </div>

        {/* Central Student Anchor Badge */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-xs border border-indigo-100">
              <Image
                src="/images/editorial_hero_student.jpg"
                alt="Priya Patel"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-display text-sm font-black text-slate-900">Priya Patel</h4>
              <p className="text-[11px] text-slate-500 font-medium">Class 8A • Mathematics: 58% (Unit Test 1)</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Canonical Fact
          </span>
        </div>

        {/* Role Tab Buttons */}
        <div className="flex justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`px-5 sm:px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'teacher'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>👨‍🏫</span>
            <span>Teacher View</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`px-5 sm:px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'student'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>🎓</span>
            <span>Student View</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('parent')}
            className={`px-5 sm:px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'parent'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>👨‍👩‍👧</span>
            <span>Parent View</span>
          </button>
        </div>

        {/* Visual Showpiece Composition (Image + Product UI) */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {selectedRole === 'teacher' && (
              <motion.div
                key="teacher"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl"
              >
                {/* Visual Imagery */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-slate-900">
                  <Image
                    src="/images/editorial_teacher_support.jpg"
                    alt="Teacher Ms. Ananya Mehra helping student in classroom"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-bold">
                    Classroom Observation • Class 8A
                  </div>
                </div>

                {/* Real Product UI & Insight */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                      Faculty Command Center
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">Class 8A Teacher Copilot</span>
                  </div>

                  <h3 className="font-display text-2xl font-black text-slate-900 leading-tight">
                    &quot;Priya is currently at 58% in Mathematics.&quot;
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                        Support Radar Finding
                      </span>
                      <p className="font-display text-xs font-black text-slate-900">
                        3 students struggled with Equivalent Fractions simplification.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800">
                        Recommended Next Action
                      </span>
                      <p className="font-display text-xs font-black text-slate-900">
                        Conduct 5-min visual fraction bar review before mixed operations.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-bold">✓ Differentiated teaching trigger</span>
                    <Link
                      href="/teacher"
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-display text-xs font-black hover:bg-slate-800 transition-all shadow-md"
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl"
              >
                {/* Visual Imagery */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-slate-900">
                  <Image
                    src="/images/editorial_hero_student.jpg"
                    alt="Priya Patel revising with AI study notes"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-bold">
                    Active Study • 15-Min Focused Notebook
                  </div>
                </div>

                {/* Real Product UI & Insight */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      Learner Digital Notebook
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">SchoolMitra AI Companion</span>
                  </div>

                  <h3 className="font-display text-2xl font-black text-slate-900 leading-tight">
                    &quot;Your Mathematics score is 58%. Let&apos;s master fractions!&quot;
                  </h3>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-indigo-100 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                      🎯 Targeted Revision Package Ready
                    </span>
                    <h4 className="font-display text-xs font-black text-slate-900">
                      Equivalent Fractions (15 Minutes) • 1-Min Cheat Sheet &amp; Exam Trap Alerts
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Worked examples + interactive 3-question quick check to boost mastery from 58% to 78%.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-indigo-600 font-bold">✓ Zero anxiety, clear roadmap</span>
                    <Link
                      href="/student"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-display text-xs font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl"
              >
                {/* Visual Imagery */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-slate-900">
                  <Image
                    src="/images/editorial_parent_child.jpg"
                    alt="Rajesh Patel discussing schoolwork with Priya at home"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-bold">
                    Home Connection • Constructive Discussion
                  </div>
                </div>

                {/* Real Product UI & Insight */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                      Family Digest
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">Parent Today Portal</span>
                  </div>

                  <h3 className="font-display text-2xl font-black text-slate-900 leading-tight">
                    &quot;Your child Priya&apos;s Mathematics score is 58%.&quot;
                  </h3>

                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                      💡 Meaningful Home Context
                    </span>
                    <p className="text-xs text-amber-950 font-medium leading-relaxed">
                      Priya is doing well overall (98% attendance). Mathematics fractions is the single concept needing light practice.
                    </p>
                    <p className="text-xs font-black text-slate-900 pt-0.5">
                      Suggested conversation: &quot;Can you explain one fractions question to me tonight?&quot;
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-amber-700 font-bold">✓ Positive family support</span>
                    <Link
                      href="/parent"
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-display text-xs font-black hover:bg-slate-800 transition-all shadow-md"
                    >
                      View Parent Portal &rarr;
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
