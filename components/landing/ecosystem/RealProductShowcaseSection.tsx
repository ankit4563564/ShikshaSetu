'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function RealProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const views = {
    teacher: {
      title: 'Teacher Workspace',
      url: 'app.shikshasetu.edu/teacher',
      image: '/screenshots/teacher_page.png',
      href: '/teacher',
    },
    student: {
      title: 'Student Portal',
      url: 'app.shikshasetu.edu/student',
      image: '/screenshots/student_page.png',
      href: '/student',
    },
    parent: {
      title: 'Parent Today',
      url: 'app.shikshasetu.edu/parent',
      image: '/screenshots/parent_page.png',
      href: '/parent',
    },
  };

  const current = views[activeTab];

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_24px_rgba(16,42,67,0.06)] space-y-4">
      {/* Card Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <h3 className="font-display text-base font-black text-[#102A43] tracking-tight uppercase">
          SEE SHIKSHASETU IN ACTION
        </h3>

        {/* Role Switcher Tabs matching PNG */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-stone-100 text-[#102A43]/70 hover:bg-stone-200'
            }`}
          >
            Teacher
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-stone-100 text-[#102A43]/70 hover:bg-stone-200'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'parent'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-stone-100 text-[#102A43]/70 hover:bg-stone-200'
            }`}
          >
            Parent
          </button>
        </div>
      </div>

      {/* Browser Window Mockup */}
      <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shadow-inner">
        {/* Browser Chrome Bar */}
        <div className="px-3 py-1.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-stone-300" />
            <span className="w-2 h-2 rounded-full bg-stone-300" />
            <span className="w-2 h-2 rounded-full bg-stone-300" />
          </div>
          <span className="text-[10px] font-mono text-stone-500 truncate">
            https://{current.url}
          </span>
          <Link href={current.href} className="text-[10px] font-bold text-[#2563EB] hover:underline">
            Open &rarr;
          </Link>
        </div>

        {/* Screenshot Viewport */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative aspect-[16/10] w-full bg-stone-100"
          >
            <Image
              src={current.image}
              alt={current.title}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
