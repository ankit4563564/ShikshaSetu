'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function DualExperienceHubSection() {
  return (
    <section className="py-20 bg-surface-container-low/60 rounded-[3rem] my-10 border border-outline-variant/20 relative overflow-hidden" id="dual-experience">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold">ONE CONNECTED PLATFORM</span>
          </div>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Two Experiences. <span className="text-primary font-bold">One Shared Intelligence.</span>
          </h2>
          <p className="font-body-lg text-body-md text-on-surface-variant font-medium max-w-2xl mx-auto">
            ShikshaSetu links home and school seamlessly — keeping parents calm and giving teachers time back to teach.
          </p>
        </div>

        {/* ── DUAL PORTAL SHOWCASE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">
          
          {/* LEFT: Parent Experience Card */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-amber-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl p-3 rounded-2xl bg-white shadow-sm border border-amber-100">👨‍👩‍👧</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-200">
                  Parent Experience
                </span>
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                Stay connected throughout your child&apos;s school day.
              </h3>

              <ul className="grid grid-cols-2 gap-3 my-6 text-xs text-slate-700 font-extrabold">
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                  <span className="text-emerald-500 font-extrabold">✓</span> Live Bus Tracking
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                  <span className="text-emerald-500 font-extrabold">✓</span> Attendance
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                  <span className="text-emerald-500 font-extrabold">✓</span> Homework &amp; Tasks
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                  <span className="text-emerald-500 font-extrabold">✓</span> Teacher Messages
                </li>
                <li className="col-span-2 flex items-center gap-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-200 text-amber-900 shadow-2xs font-extrabold">
                  <span className="text-amber-600">✨</span> Parent SchoolGPT Assistant Included
                </li>
              </ul>

              {/* Mobile Device Screenshot Preview */}
              <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 border border-slate-200 shadow-xl bg-slate-950 group-hover:scale-[1.01] transition-transform">
                <Image
                  src="/images/parent_safety_app.jpg"
                  alt="Parent Mobile App Experience"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            <Link
              href="/parent"
              className="w-full text-center py-4 px-6 rounded-2xl font-title-md text-sm font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Open Parent Experience
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* RIGHT: Teacher Experience Card */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-teal-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl p-3 rounded-2xl bg-white shadow-sm border border-teal-100">👩‍🏫</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-3.5 py-1.5 rounded-full border border-teal-200">
                  Teacher Experience
                </span>
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 group-hover:text-teal-600 transition-colors">
                Spend less time managing and more time teaching.
              </h3>

              <ul className="grid grid-cols-2 gap-3 my-6 text-xs text-slate-700 font-extrabold">
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
                  <span className="text-emerald-500 font-extrabold">✓</span> 1-Tap Attendance
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
                  <span className="text-emerald-500 font-extrabold">✓</span> Student Insights
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
                  <span className="text-emerald-500 font-extrabold">✓</span> Homework Sync
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
                  <span className="text-emerald-500 font-extrabold">✓</span> PTM Assistant
                </li>
                <li className="col-span-2 flex items-center gap-2 bg-teal-500/10 p-2.5 rounded-xl border border-teal-200 text-teal-900 shadow-2xs font-extrabold">
                  <span className="text-teal-600">✨</span> Teacher SchoolGPT Copilot Included
                </li>
              </ul>

              {/* Desktop Dashboard Screenshot Preview */}
              <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 border border-slate-200 shadow-xl bg-slate-950 group-hover:scale-[1.01] transition-transform">
                <Image
                  src="/images/teacher_classroom_ai.jpg"
                  alt="Teacher Workstation Experience"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            <Link
              href="/teacher"
              className="w-full text-center py-4 px-6 rounded-2xl font-title-md text-sm font-extrabold bg-teal-600 hover:bg-teal-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Open Teacher Experience
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

        </div>

        {/* ── AMBIENT SCHOOLGPT INTELLIGENCE CONNECTOR ── */}
        <div className="bg-primary text-white rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto space-y-4">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-secondary-fixed text-sm">✨</span>
            <span className="text-xs font-mono font-bold text-secondary-fixed uppercase tracking-wider">Connected Intelligence Layer</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            SchoolGPT Intelligence Engine
          </h3>

          <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
            One AI intelligence layer keeps parents, teachers, and the entire school day connected in real time.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-6 text-xs font-mono text-white/80">
            <span>Parent asks: &ldquo;Has Aarav reached school?&rdquo;</span>
            <span className="text-secondary-fixed">↔</span>
            <span>Teacher asks: &ldquo;Who needs support today?&rdquo;</span>
          </div>
        </div>

      </div>
    </section>
  );
}
