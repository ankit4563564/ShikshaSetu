'use client';

import Link from 'next/link';
import { SectionWrapper, SectionHeading } from './Primitives';

export function BentoModulesV4() {
  const bento = [
    { title: '📊 Attendance', desc: 'Real-time attendance with AI insights.', colSpan: 'lg:col-span-4', bg: 'bg-emerald-50/60 border-emerald-100', href: '/teacher' },
    { title: '🚌 Transport', desc: 'Live bus tracking, route alerts & notifications.', colSpan: 'lg:col-span-4', bg: 'bg-sky-50/60 border-sky-100', href: '/driver' },
    { title: '📝 Homework', desc: 'Assignments, submissions & smart reminders.', colSpan: 'lg:col-span-4', bg: 'bg-amber-50/60 border-amber-100', href: '/teacher' },
    { title: '💬 Communication', desc: 'Instant messages, announcements & more.', colSpan: 'lg:col-span-3', bg: 'bg-purple-50/60 border-purple-100', href: '/parent' },
    { title: '📈 Analytics', desc: 'Reports, trends and actionable insights.', colSpan: 'lg:col-span-3', bg: 'bg-blue-50/60 border-blue-100', href: '/admin' },
    { title: '🏫 Administration', desc: 'Admissions, fees, staff & complete management.', colSpan: 'lg:col-span-3', bg: 'bg-indigo-50/60 border-indigo-100', href: '/admin' },
    { title: '🎒 Student Companion', desc: 'A learning assistant for students.', colSpan: 'lg:col-span-3', bg: 'bg-pink-50/60 border-pink-100', href: '/student' },
  ];

  return (
    <SectionWrapper bg="bg-[#F5F8FF]">
      <div className="space-y-16">
        <SectionHeading
          eyebrow="OPERATIONAL MODULES"
          title="Modular capabilities for"
          highlight="every team."
          subtitle="Every department gets tailored tools that feed directly into the central SchoolGPT Intelligence Layer."
        />

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {bento.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`p-6 bg-white border rounded-[24px] shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between ${item.colSpan} ${item.bg}`}
            >
              <div className="space-y-2">
                <h4 className="font-display text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
                <span>Explore</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
