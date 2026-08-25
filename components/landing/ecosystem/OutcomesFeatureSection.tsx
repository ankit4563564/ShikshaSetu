'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function OutcomesFeatureSection() {
  const categories = [
    {
      title: 'RUN THE SCHOOL',
      tag: 'Administrative Backbone',
      icon: '🏛️',
      color: 'border-slate-200 bg-white text-slate-900',
      items: [
        'Multi-session Attendance & Biometrics',
        'Fee Ledgers & Automated Invoicing',
        'Timetable Engine & Substitutions',
        'Exam Schedules & Marks Entry',
        'Classroom Homework Distribution',
        'Encrypted One-to-One Messaging',
      ],
    },
    {
      title: 'UNDERSTAND THE CLASSROOM',
      tag: 'Teacher Intelligence',
      icon: '💡',
      color: 'border-blue-200 bg-blue-50/30 text-slate-900',
      items: [
        'Student 360 Diagnostic Profiles',
        'Support Radar for At-Risk Concepts',
        'Automated Exit Ticket Analysis',
        'Differentiated Teaching Recommendations',
        'Homeroom PTM Summary Studio',
        'Intervention Logging & Tracking',
      ],
    },
    {
      title: 'HELP STUDENTS LEARN',
      tag: 'Learner Growth',
      icon: '🚀',
      color: 'border-indigo-200 bg-indigo-50/30 text-slate-900',
      items: [
        'SchoolMitra AI Study Companion',
        'AI Revision Notes & 1-Min Cheat Sheets',
        'Next Best Action Recommendations',
        'Interactive Concept Quick Checks',
        'Digital Mind Map Engine',
        'Self-Paced Mastery Practice',
      ],
    },
    {
      title: 'CONNECT FAMILIES',
      tag: 'Parent Partnership',
      icon: '👨‍👩‍👧',
      color: 'border-amber-200 bg-amber-50/30 text-slate-900',
      items: [
        'Daily Child Digest & Status Indicators',
        'Actionable Dinner Conversation Prompts',
        'Live GPS Bus Tracking & ETA',
        'Gate Pass QR Approval System',
        'Direct Teacher Communication Thread',
        'Transparent Academic Progression',
      ],
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-50/70 border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Outcomes, Not Feature Lists
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Everything connects back to the student.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            ShikshaSetu doesn&apos;t treat these as isolated modules. It connects them around the learner&apos;s continuous journey.
          </p>
        </div>

        {/* 4 Outcome Feature Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <motion.div
              key={cat.title}
              whileHover={{ scale: 1.01, y: -2 }}
              className={`p-8 rounded-3xl border ${cat.color} shadow-xs hover:shadow-lg transition-all space-y-6 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {cat.tag}
                  </span>
                  <span className="text-3xl">{cat.icon}</span>
                </div>

                <h3 className="font-display text-2xl font-black text-slate-900 tracking-tight">
                  {cat.title}
                </h3>

                <ul className="space-y-2.5 pt-2">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
