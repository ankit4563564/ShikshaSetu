'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DualPortalSection() {
  const backboneModules = [
    {
      title: 'Data Operations Engine',
      desc: 'Real-time sync, validation & data integrity for all school operations.',
      icon: '🌐',
      href: '/admin',
    },
    {
      title: 'Transport Operations',
      desc: 'Live bus tracking, route optimization, baggage telemetry, speed alerts.',
      icon: '🚌',
      href: '/driver',
    },
    {
      title: 'Student Companion',
      desc: 'Attendance, academics, homework, assessments, behavior & growth.',
      icon: '🎒',
      href: '/student',
    },
    {
      title: 'School Administration',
      desc: 'User management, roles, permissions, communications, analytics.',
      icon: '🏫',
      href: '/admin',
    },
  ];

  return (
    <section className="bg-slate-50/70 py-24 sm:py-32 font-body text-slate-900 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-extrabold uppercase tracking-widest">
            ⚡ COMPLETE SCHOOL OPERATING SYSTEM
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Dual-Portal Hero Experience. <br className="hidden sm:inline" />
            <span className="text-indigo-600">Powered by Operational Telemetry.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto">
            Seamlessly unites Parent &amp; Teacher tools into actionable, usable, real-time insights for everyone that matters.
          </p>
        </div>

        {/* 2 Primary Hero Experience Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Parent Mobile Application */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 bg-white border border-slate-200/90 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-extrabold uppercase tracking-wider">
                PARENT PORTAL
              </span>
              <h3 className="font-display text-2xl font-extrabold text-slate-900">Parent Mobile Application</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Everything parents need — live bus tracking, safe confirmations, alert updates, and full transparency about their child&apos;s day.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative h-[200px] w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                <Image
                  src="/images/parent_safety_app.jpg"
                  alt="Parent Mobile App"
                  fill
                  className="object-cover"
                />
              </div>

              <Link
                href="/parent"
                className="inline-flex items-center justify-between w-full px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-2xs active:scale-95"
              >
                <span>Launch Parent Experience</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Teacher Web Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="p-8 bg-white border border-slate-200/90 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-mono font-extrabold uppercase tracking-wider">
                TEACHER PORTAL
              </span>
              <h3 className="font-display text-2xl font-extrabold text-slate-900">Teacher Web Dashboard</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                All-in-one school operations dashboard to manage classrooms, communications, homework, and improve student outcomes.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative h-[200px] w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                <Image
                  src="/images/teacher_classroom_ai.jpg"
                  alt="Teacher Web Dashboard"
                  fill
                  className="object-cover"
                />
              </div>

              <Link
                href="/teacher"
                className="inline-flex items-center justify-between w-full px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-2xs active:scale-95"
              >
                <span>Launch Teacher Experience</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 3 Pillars Summary Row */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-1 p-3 rounded-2xl bg-slate-50">
            <span className="font-mono font-extrabold text-indigo-600 text-xs block">1. Engaging User Interfaces</span>
            <p className="text-slate-500 font-medium text-[11px]">Parent Mobile, Teacher Web, Student App</p>
          </div>
          <div className="space-y-1 p-3 rounded-2xl bg-slate-50">
            <span className="font-mono font-extrabold text-indigo-600 text-xs block">2. Intelligent AI Layer</span>
            <p className="text-slate-500 font-medium text-[11px]">SchoolGPT Answers, Reports, Insights &amp; Recommendations</p>
          </div>
          <div className="space-y-1 p-3 rounded-2xl bg-slate-50">
            <span className="font-mono font-extrabold text-indigo-600 text-xs block">3. Operational Workflows</span>
            <p className="text-slate-500 font-medium text-[11px]">Bus, Attendance, Academics, Homework, PTM</p>
          </div>
        </div>

        {/* Connected Backbone Data Modules Grid */}
        <div className="space-y-6">
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-400 block text-center">
            🟡 CONNECTED OPERATIONAL MODULES (BACKBONE DATA SYSTEM)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {backboneModules.map((mod) => (
              <Link
                key={mod.title}
                href={mod.href}
                className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm">
                    {mod.icon}
                  </div>
                  <h4 className="font-display text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{mod.desc}</p>
                </div>
                <span className="text-xs font-extrabold text-indigo-600 flex items-center gap-1">
                  <span>Explore</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
