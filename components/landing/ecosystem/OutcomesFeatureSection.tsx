'use client';

import React from 'react';

export function OutcomesFeatureSection() {
  const categories = [
    {
      title: 'RUN THE SCHOOL',
      tag: 'Administrative Backbone',
      items: [
        'Multi-session Attendance & Biometrics',
        'Fee Ledgers & Automated Invoicing',
        'Timetable Engine & Substitutions',
        'Exam Schedules & Marks Entry',
        'Classroom Homework Distribution',
        'Encrypted Direct Messaging',
      ],
    },
    {
      title: 'UNDERSTAND THE CLASSROOM',
      tag: 'Teacher Intelligence',
      items: [
        'Student 360 Diagnostic Profiles',
        'Support Radar for At-Risk Concepts',
        'Automated Exit Ticket Analysis',
        'Differentiated Lesson Recommendations',
        'Homeroom PTM Summary Studio',
        'Intervention Logging & Tracking',
      ],
    },
    {
      title: 'HELP STUDENTS LEARN',
      tag: 'Learner Growth',
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
      items: [
        'Daily Child Digest & Status Indicators',
        'Actionable Dinner Conversation Prompts',
        'Live GPS Bus Tracking & ETA',
        'Gate Pass QR Approval System',
        'Direct Teacher Communication Thread',
        'Multilingual Family Notifications',
      ],
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
            Platform Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            Complete school operations. Zero duplicate data.
          </h2>
          <p className="text-base text-stone-600 font-normal leading-relaxed">
            Everything your institution needs to run daily administration, understand classrooms, guide students, and partner with parents.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <div
              key={c.title}
              className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-300 space-y-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB]">
                  {c.tag}
                </span>
                <h3 className="font-display text-base font-bold text-[#172033]">
                  {c.title}
                </h3>
              </div>

              <ul className="space-y-2.5 pt-2 border-t border-stone-200">
                {c.items.map((item) => (
                  <li key={item} className="text-xs text-stone-600 flex items-start gap-2">
                    <span className="text-[#16836A] font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
