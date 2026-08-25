'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TheDifferenceSection() {
  const erpModules = [
    { title: 'Attendance', desc: 'Stored in CSV/table' },
    { title: 'Marks & Exams', desc: 'Archived per term' },
    { title: 'Homework Hub', desc: 'Static PDF attachments' },
    { title: 'Report Cards', desc: 'Printed once a quarter' },
    { title: 'SMS / Notices', desc: 'One-way broadcast alerts' },
  ];

  const shikshaSetuLoop = [
    { step: '01', title: 'Observe', desc: 'Real evidence gathered continuously' },
    { step: '02', title: 'Understand', desc: 'AI highlights conceptual gap' },
    { step: '03', title: 'Act', desc: 'Teacher gets next teaching action' },
    { step: '04', title: 'Learn', desc: 'Student practices 15-min focused notes' },
    { step: '05', title: 'Measure', desc: 'Growth verified on next check-in' },
    { step: '06', title: 'Connect', desc: 'Parent receives supportive context' },
  ];

  return (
    <section id="the-difference" className="py-20 bg-slate-50/70 border-y border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            The Architectural Shift
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Not just an ERP.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            The difference is not how many modules you have. It&apos;s{' '}
            <strong className="text-slate-900 font-black">what the system does</strong> with the information inside them.
          </p>
        </div>

        {/* Side-by-Side Architectural Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT: TRADITIONAL ERP */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                  Legacy Paradigm
                </span>
                <span className="text-xs text-slate-400 font-bold">Traditional ERP</span>
              </div>
              <h3 className="font-display text-2xl font-black text-slate-900">
                Disconnected Silos
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Information is captured, stored, and forgotten. Teachers fill forms, parents see raw numbers, students feel audited.
              </p>

              {/* Disconnected blocks visual */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {erpModules.map((mod) => (
                  <div
                    key={mod.title}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1 opacity-80"
                  >
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Isolated
                    </span>
                    <h4 className="font-display text-xs font-black text-slate-800">
                      {mod.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">{mod.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-rose-900 text-xs font-black flex items-center justify-between">
              <span>Result: Data gets recorded. Nothing changes.</span>
              <span>🔒</span>
            </div>
          </div>

          {/* RIGHT: SHIKSHASETU */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40 space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Continuous Learning Loop
                </span>
                <span className="text-xs text-indigo-300 font-bold">ShikshaSetu</span>
              </div>
              <h3 className="font-display text-2xl font-black text-white">
                One Live Feedback Loop
              </h3>
              <p className="text-sm text-indigo-200/80 font-medium">
                Every homework submission, quiz attempt, and attendance mark feeds into active intelligence that drives the next action.
              </p>

              {/* Connected loop visual */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {shikshaSetuLoop.map((step) => (
                  <motion.div
                    key={step.step}
                    whileHover={{ scale: 1.03 }}
                    className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1"
                  >
                    <span className="text-[10px] font-mono font-black text-indigo-300 uppercase tracking-widest block">
                      {step.step}
                    </span>
                    <h4 className="font-display text-xs font-black text-white">
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-indigo-200/70 font-medium">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black flex items-center justify-between relative z-10">
              <span>Result: Data becomes personalized action.</span>
              <span className="text-emerald-400 font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
