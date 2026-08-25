'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function RealProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const views = {
    teacher: {
      title: 'Teacher Workspace V2',
      url: 'app.shikshasetu.edu/teacher',
      tag: 'Faculty Intelligence',
      description: 'Support radar highlights students needing help, today’s focus items, and instant lesson intervention drafts.',
      image: '/screenshots/teacher_page.png',
      href: '/teacher',
    },
    student: {
      title: 'Student Portal & Study Notebook',
      url: 'app.shikshasetu.edu/student',
      tag: 'Learner Workspace',
      description: 'AI revision notes, lined digital study notebook, interactive quiz checks, and SchoolMitra companion.',
      image: '/screenshots/student_page.png',
      href: '/student',
    },
    parent: {
      title: 'Parent Today Portal',
      url: 'app.shikshasetu.edu/parent',
      tag: 'Family Partnership',
      description: 'Live child progress digest, real-time GPS bus telemetry with driver direct calling, and encrypted QR gate passes.',
      image: '/screenshots/parent_page.png',
      href: '/parent',
    },
  };

  const current = views[activeTab];

  return (
    <section id="product-showcase" className="py-20 bg-[#FAF9F6] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
              Production Software
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
              See the actual product in action.
            </h2>
            <p className="text-base text-stone-600 font-normal leading-relaxed">
              Real interfaces built around the continuous student journey. No mockups or fake marketing screens.
            </p>
          </div>

          {/* Clean Portal Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('teacher')}
              className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-[#172033] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Teacher UI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-[#172033] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Student UI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parent')}
              className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'parent'
                  ? 'bg-[#172033] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Parent UI
            </button>
          </div>
        </div>

        {/* Realistic Browser Window Frame */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl overflow-hidden border border-stone-300 bg-white shadow-xl space-y-0"
          >
            {/* Realistic Browser Chrome Header */}
            <div className="px-4 py-3 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-stone-300" />
                <span className="w-3 h-3 rounded-full bg-stone-300" />
                <span className="w-3 h-3 rounded-full bg-stone-300" />
              </div>

              {/* URL Address Bar */}
              <div className="px-4 py-1 rounded-md bg-white border border-stone-200 text-[11px] font-mono text-stone-600 max-w-sm w-full text-center truncate">
                https://{current.url}
              </div>

              <Link
                href={current.href}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                Open Live &rarr;
              </Link>
            </div>

            {/* Screenshot Body */}
            <div className="relative aspect-[16/10] w-full bg-stone-50">
              <Image
                src={current.image}
                alt={current.title}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>

            {/* Bottom Annotation Bar */}
            <div className="p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#172033]">{current.title}</span>
                <p className="text-stone-500">{current.description}</p>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#16836A] shrink-0">
                ✓ Production Live
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
