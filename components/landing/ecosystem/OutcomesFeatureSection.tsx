'use client';

import React from 'react';

export function OutcomesFeatureSection() {
  const categories = [
    {
      title: 'RUN THE SCHOOL',
      tag: 'Administration',
      accentColor: 'text-[#2563EB] bg-[#EFF6FF] border-[#2563EB]/20',
      items: [
        'Multi-session Attendance & Scans',
        'Fee Ledgers & Automated Invoicing',
        'Timetables & Substitution Engine',
        'Live Transport GPS & Gate Security',
      ],
    },
    {
      title: 'UNDERSTAND THE CLASSROOM',
      tag: 'Teacher Intelligence',
      accentColor: 'text-[#16A085] bg-[#E6F7F2] border-[#16A085]/30',
      items: [
        'Formative Assessment & Marks Entry',
        'Student Support Radar for At-Risk Topics',
        'Homeroom Diagnostic Profiles',
        'Differentiated Lesson Recommendations',
      ],
    },
    {
      title: 'HELP STUDENTS LEARN',
      tag: 'Learner Growth',
      accentColor: 'text-[#F59E0B] bg-[#FFF9F0] border-[#F59E0B]/30',
      items: [
        'Personalized AI Revision Notes',
        'SchoolMitra Syllabus Study Companion',
        'Interactive 3-Question Quick Checks',
        '15-Minute Next Best Action Practice',
      ],
    },
    {
      title: 'CONNECT FAMILIES',
      tag: 'Parent Partnership',
      accentColor: 'text-[#F97360] bg-[#FFF2F0] border-[#F97360]/30',
      items: [
        'Constructive Dinner Talking Prompts',
        'Encrypted Teacher-Parent Messaging',
        'Real-time GPS Bus Tracking & ETA',
        'Secure QR Gate Pass Authorizations',
      ],
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] bg-white border border-[#2563EB]/20 px-2.5 py-0.5 rounded">
            Complete Platform
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight">
            What ShikshaSetu runs.
          </h2>
          <p className="text-base text-[#102A43]/70 font-normal leading-relaxed">
            Everything your institution needs to run daily administration, understand classrooms, guide students, and partner with parents.
          </p>
        </div>

        {/* 4 Compact Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => (
            <div
              key={c.title}
              className="p-5 rounded-xl bg-white border border-[#102A43]/15 shadow-[0_4px_16px_rgba(16,42,67,0.04)] space-y-3"
            >
              <div className="space-y-1">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${c.accentColor}`}>
                  {c.tag}
                </span>
                <h3 className="font-display text-sm font-bold text-[#102A43]">
                  {c.title}
                </h3>
              </div>

              <ul className="space-y-2 pt-2 border-t border-stone-100">
                {c.items.map((item) => (
                  <li key={item} className="text-xs text-[#102A43]/70 flex items-start gap-2 leading-snug">
                    <span className="text-[#16A085] font-bold shrink-0">✓</span>
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
