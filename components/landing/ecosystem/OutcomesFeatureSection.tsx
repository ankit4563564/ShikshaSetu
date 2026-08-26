'use client';

import React from 'react';

export function OutcomesFeatureSection() {
  const quadrants = [
    {
      title: 'RUN THE SCHOOL',
      borderColor: 'border-t-4 border-t-[#2563EB]',
      badgeColor: 'text-[#2563EB]',
      items: [
        'Multi-session Attendance',
        'Fee Ledgers',
        'Automated Invoicing',
        'Live Transport GPS',
      ],
    },
    {
      title: 'UNDERSTAND THE CLASSROOM',
      borderColor: 'border-t-4 border-t-[#F59E0B]',
      badgeColor: 'text-[#F59E0B]',
      items: [
        'Formative Assessment',
        'Personalized AI Lesson Plans',
        'Interactive Question Banks',
      ],
    },
    {
      title: 'HELP STUDENTS LEARN',
      borderColor: 'border-t-4 border-t-[#16A085]',
      badgeColor: 'text-[#16A085]',
      items: [
        'Adaptive Practice',
        'Real-time Feedback',
        'Gamified Learning Paths',
      ],
    },
    {
      title: 'CONNECT FAMILIES',
      borderColor: 'border-t-4 border-t-[#F97360]',
      badgeColor: 'text-[#F97360]',
      items: [
        'Constructive Dialogue Prompts',
        'Real-time PTM Tracking',
        'Secure QR Gate Pass',
      ],
    },
  ];

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_24px_rgba(16,42,67,0.06)] space-y-4">
      {/* Title */}
      <h3 className="font-display text-base sm:text-lg font-black text-[#102A43] tracking-tight uppercase">
        CAPABILITIES
      </h3>

      {/* 4 Quadrant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {quadrants.map((q) => (
          <div
            key={q.title}
            className={`p-4 rounded-xl bg-[#F8FAFC] border border-stone-200 ${q.borderColor} space-y-2.5 shadow-2xs`}
          >
            <span className="font-display text-xs font-bold text-[#102A43] block">
              {q.title}
            </span>
            <ul className="space-y-1.5 text-xs text-[#102A43]/75">
              {q.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${q.badgeColor === 'text-[#2563EB]' ? 'bg-[#2563EB]' : q.badgeColor === 'text-[#F59E0B]' ? 'bg-[#F59E0B]' : q.badgeColor === 'text-[#16A085]' ? 'bg-[#16A085]' : 'bg-[#F97360]'}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
