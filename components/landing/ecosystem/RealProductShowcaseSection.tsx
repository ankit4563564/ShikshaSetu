'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function RealProductShowcaseSection() {
  const [activePortal, setActivePortal] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const portals = {
    teacher: {
      name: 'Teacher Workspace',
      badge: 'Faculty Command Center',
      tagline: 'Student Support Radar & Homeroom Intelligence',
      description:
        'Instantly view who needs targeted support, generate lesson recommendations, and communicate directly with families without paperwork.',
      image: '/screenshots/teacher_page.png',
      href: '/teacher',
      cta: 'Explore Teacher Workspace',
      highlights: ['Support Radar for At-Risk Topics', 'Today’s Homeroom Focus', 'One-Click Lesson Interventions'],
    },
    student: {
      name: 'Student Portal',
      badge: 'Learner Workspace',
      tagline: 'AI Revision Notes & SchoolMitra Study Companion',
      description:
        'Personalized digital lined study notebooks with 1-minute cheat sheets, worked examples, formula breakdowns, and interactive concept checks.',
      image: '/screenshots/student_page.png',
      href: '/student',
      cta: 'Explore Student Portal',
      highlights: ['Digital Lined Study Sheets', 'SchoolMitra Study Companion', 'Interactive Concept Quick Checks'],
    },
    parent: {
      name: 'Parent Today Portal',
      badge: 'Family Partnership',
      tagline: 'Live Child Digest, Transport Telemetry & Gate Security',
      description:
        'Meaningful dinner talking prompts, real-time GPS bus telemetry with driver calling, and encrypted QR gate pass approvals.',
      image: '/screenshots/parent_page.png',
      href: '/parent',
      cta: 'Explore Parent Portal',
      highlights: ['Constructive Family Prompts', 'Live GPS Bus Tracking & ETA', 'Encrypted QR Gate Pass'],
    },
  };

  const current = portals[activePortal];

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-white/10 border border-white/10 px-3.5 py-1 rounded-full backdrop-blur-md">
            Production UI
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            See the actual product in action.
          </h2>
          <p className="text-base sm:text-lg text-indigo-200/80 font-medium leading-relaxed">
            No mockups or fabricated dashboards. Real, working software built around the live student journey.
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="flex justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setActivePortal('teacher')}
            className={`px-5 sm:px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activePortal === 'teacher'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span>👨‍🏫</span>
            <span>Teacher Portal</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('student')}
            className={`px-5 sm:px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activePortal === 'student'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span>🎓</span>
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('parent')}
            className={`px-5 sm:px-6 py-3 rounded-2xl font-display text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activePortal === 'parent'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span>👨‍👩‍👧</span>
            <span>Parent Portal</span>
          </button>
        </div>

        {/* Portal Screen Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePortal}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Context bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-mono font-black uppercase text-indigo-400">
                  {current.badge}
                </span>
                <h3 className="font-display text-lg sm:text-xl font-black text-white">
                  {current.tagline}
                </h3>
                <p className="text-xs text-indigo-200/80 font-medium max-w-2xl">
                  {current.description}
                </p>
              </div>

              <Link
                href={current.href}
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-display text-xs font-black hover:bg-slate-100 transition-all shadow-md shrink-0 flex items-center gap-2"
              >
                <span>{current.cta}</span>
                <span className="text-indigo-600 font-bold">&rarr;</span>
              </Link>
            </div>

            {/* High-Resolution Screenshot Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950/60 aspect-[16/10] w-full group">
              <Image
                src={current.image}
                alt={current.name}
                fill
                className="object-cover object-top group-hover:scale-101 transition-transform duration-500"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Feature Tags */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                {current.highlights.map((h) => (
                  <span
                    key={h}
                    className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20"
                  >
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
