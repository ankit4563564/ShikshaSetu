'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function RealProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const views = {
    teacher: {
      title: 'Teacher Workspace — Student Support & Focus',
      url: 'app.shikshasetu.edu/teacher',
      tag: 'Teacher Intelligence (Blue)',
      activeColor: 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]',
      description: 'Support radar highlights students needing help, today’s focus items, and instant lesson intervention drafts.',
      image: '/screenshots/teacher_page.png',
      href: '/teacher',
    },
    student: {
      title: 'Student Portal — AI Revision Notes & Mitra',
      url: 'app.shikshasetu.edu/student',
      tag: 'Learner Workspace (Amber)',
      activeColor: 'bg-[#F59E0B] text-white shadow-[0_4px_12px_rgba(245,158,11,0.25)]',
      description: 'AI revision notes, lined digital study notebook, interactive quiz checks, and SchoolMitra study companion.',
      image: '/screenshots/student_page.png',
      href: '/student',
    },
    parent: {
      title: 'Parent Today — Child Progress & Daily Insight',
      url: 'app.shikshasetu.edu/parent',
      tag: 'Family Partnership (Coral)',
      activeColor: 'bg-[#F97360] text-white shadow-[0_4px_12px_rgba(249,115,96,0.25)]',
      description: 'Live child progress digest, real-time GPS bus telemetry with driver direct calling, and encrypted QR gate passes.',
      image: '/screenshots/parent_page.png',
      href: '/parent',
    },
  };

  const current = views[activeTab];

  return (
    <section id="product-showcase" className="py-16 md:py-20 bg-white border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="max-w-2xl space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
              Production Software
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight">
              See ShikshaSetu in action.
            </h2>
            <p className="text-base text-[#102A43]/70 font-normal leading-relaxed">
              Real interfaces built around the continuous student journey.
            </p>
          </div>

          {/* Clean Portal Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('teacher')}
              className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'teacher'
                  ? current.activeColor
                  : 'bg-[#F8FAFC] text-[#102A43] border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Teacher Portal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? current.activeColor
                  : 'bg-[#F8FAFC] text-[#102A43] border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parent')}
              className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'parent'
                  ? current.activeColor
                  : 'bg-[#F8FAFC] text-[#102A43] border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Parent Portal
            </button>
          </div>
        </div>

        {/* Realistic Browser Window Frame */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl overflow-hidden border border-[#102A43]/15 bg-white shadow-[0_16px_48px_rgba(16,42,67,0.08)] space-y-0"
          >
            {/* Browser Chrome Header */}
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              </div>

              {/* URL Address Bar */}
              <div className="px-3 py-0.5 rounded bg-white border border-stone-200 text-[11px] font-mono text-[#102A43]/70 max-w-sm w-full text-center truncate">
                https://{current.url}
              </div>

              <Link
                href={current.href}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                Launch Live &rarr;
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
            <div className="p-3.5 bg-white border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#102A43]">{current.title}</span>
                <p className="text-[#102A43]/60 text-[11px]">{current.description}</p>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#16A085] shrink-0">
                ✓ Production Live
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
