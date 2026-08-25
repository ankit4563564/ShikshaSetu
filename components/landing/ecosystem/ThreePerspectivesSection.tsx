'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
            Different permissions. Different experiences. <strong className="text-slate-900 font-black">Same underlying school facts.</strong>
          </p>
        </div>

        {/* Central Student Badge */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
              PP
            </div>
            <div>
              <h4 className="font-display text-sm font-black text-slate-900">Priya Patel</h4>
              <p className="text-[11px] text-slate-500 font-medium">Class 8A • Mathematics: 58% (Unit Test 1)</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Canonical Record
          </span>
        </div>

        {/* Role Tab Buttons */}
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'teacher'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>👨‍🏫</span>
            <span>Teacher View</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'student'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>🎓</span>
            <span>Student View</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('parent')}
            className={`px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRole === 'parent'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>👨‍👩‍👧</span>
            <span>Parent View</span>
          </button>
        </div>

        {/* Perspective Content Cards */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {selectedRole === 'teacher' && (
              <motion.div
                key="teacher"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                      Faculty Command Center
                    </span>
                    <h3 className="font-display text-xl font-black text-slate-900 mt-2">
                      &quot;Priya is currently at 58% in Mathematics.&quot;
                    </h3>
                  </div>
                  <span className="text-2xl">👨‍🏫</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                      Support Radar Highlight
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
                      Conduct 5-min visual fraction bar review before moving to mixed problems.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-bold">Class 8A Teacher Copilot</span>
                  <Link
                    href="/teacher"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-display text-xs font-black hover:bg-slate-800 transition-all"
                  >
                    Open Teacher Workspace &rarr;
                  </Link>
                </div>
              </motion.div>
            )}

            {selectedRole === 'student' && (
              <motion.div
                key="student"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      Learner Workspace
                    </span>
                    <h3 className="font-display text-xl font-black text-slate-900 mt-2">
                      &quot;Your Mathematics score is 58%. Let&apos;s master this!&quot;
                    </h3>
                  </div>
                  <span className="text-2xl">🎓</span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-indigo-100 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                    🎯 Your Next Best Action
                  </span>
                  <h4 className="font-display text-sm font-black text-slate-900">
                    Revise Equivalent Fractions (15 Minutes)
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Digital Notebook revision ready with 1-min cheat sheet &amp; exam trap warnings.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-bold">SchoolMitra AI Study Companion</span>
                  <Link
                    href="/student"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-display text-xs font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                  >
                    Start Student Revision &rarr;
                  </Link>
                </div>
              </motion.div>
            )}

            {selectedRole === 'parent' && (
              <motion.div
                key="parent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                      Family Digest
                    </span>
                    <h3 className="font-display text-xl font-black text-slate-900 mt-2">
                      &quot;Your child Priya&apos;s Mathematics score is 58%.&quot;
                    </h3>
                  </div>
                  <span className="text-2xl">👨‍👩‍👧</span>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                    💡 Meaningful Home Context
                  </span>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    Priya is doing well overall. Mathematics fractions is the single concept that needs a little practice tonight.
                  </p>
                  <p className="text-xs font-black text-slate-900 pt-1">
                    Try asking her: &quot;Can you explain one fractions question to me tonight?&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-bold">Parent Today Portal</span>
                  <Link
                    href="/parent"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-display text-xs font-black hover:bg-slate-800 transition-all"
                  >
                    View Parent Portal &rarr;
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
