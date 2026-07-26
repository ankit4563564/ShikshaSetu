'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const EXPERIENCES = [
  {
    id: 'parent',
    title: 'Parent Portal',
    icon: '👨‍👩‍👧',
    subtitle: 'Real-time peace of mind for every parent',
    image: '/images/parent_safety_app.jpg',
    features: ['Live Bus GPS Tracking', 'Gate Arrival Alerts', 'Homework & Homework AI', 'Parent WhatsApp Sync'],
    ctaText: 'Open Parent Portal →',
    href: '/parent',
    color: 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-200/60 hover:border-amber-400',
    btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    badge: 'Live Parent App'
  },
  {
    id: 'teacher',
    title: 'Teacher Portal',
    icon: '👩‍🏫',
    subtitle: 'Zero paper roll call & 1-click lesson planning',
    image: '/images/teacher_classroom_ai.jpg',
    features: ['Auto Gate Attendance Sync', 'SchoolGPT Quiz Generator', 'Lesson Plan Creator', 'Student Attention Insights'],
    ctaText: 'Open Teacher Portal →',
    href: '/teacher',
    color: 'from-teal-500/10 via-emerald-500/5 to-transparent border-teal-200/60 hover:border-teal-400',
    btnBg: 'bg-teal-600 hover:bg-teal-500 text-white',
    badge: 'Teacher Workstation'
  },
  {
    id: 'admin',
    title: 'Admin Dashboard',
    icon: '🏫',
    subtitle: 'Total campus operations command center',
    image: '/images/school_admin_analytics_visual.jpg',
    features: ['Campus Operations Control', 'Bus Fleet GPS Monitoring', 'Attendance Analytics', 'Automated Parent Alerts'],
    ctaText: 'Open Admin Dashboard →',
    href: '/admin',
    color: 'from-sky-500/10 via-indigo-500/5 to-transparent border-sky-200/60 hover:border-sky-400',
    btnBg: 'bg-primary hover:bg-primary-container text-white',
    badge: 'Campus Command Center'
  },
  {
    id: 'schoolgpt',
    title: 'SchoolGPT AI',
    icon: '🤖',
    subtitle: 'Intelligence engine for Indian schools',
    image: '/shikshasetu_banner.png',
    features: ['Ask Any School Question', 'AI Student Risk Detection', '1-Click PTM Summary Generator', 'Automated Parent Messages'],
    ctaText: 'Try SchoolGPT Assistant →',
    href: '#schoolgpt',
    color: 'from-purple-500/10 via-secondary-container/10 to-transparent border-purple-200/60 hover:border-purple-400',
    btnBg: 'bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container',
    badge: 'AI Intelligence Engine'
  }
];

export function ExperienceHubSection() {
  return (
    <section className="py-16 bg-surface-container-low/60 rounded-[3rem] my-8 border border-outline-variant/20" id="experience-hub">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold">1-Click Live Product Access</span>
          </div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Choose Your <span className="text-primary font-bold">Experience</span>
          </h2>
          <p className="font-body-lg text-body-md text-on-surface-variant font-medium">
            Jump directly into any live working portal. Built for instant evaluation by hackathon judges and school leaders.
          </p>
        </div>

        {/* 4 Large Premium Experience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.id}
              className={`bg-white rounded-[2rem] p-6 border shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden bg-gradient-to-b ${exp.color}`}
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2 rounded-2xl bg-white shadow-sm border border-slate-100">{exp.icon}</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {exp.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-display text-xl font-extrabold text-slate-900 group-hover:text-primary transition-colors">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1 mb-4 leading-relaxed">
                  {exp.subtitle}
                </p>

                {/* Image Screenshot Preview */}
                <div className="relative h-40 w-full rounded-xl overflow-hidden mb-4 border border-slate-200 shadow-inner bg-slate-950">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-1.5 mb-6 text-xs text-slate-700 font-medium">
                  {exp.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-extrabold">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Primary Action CTA */}
              <Link
                href={exp.href}
                className={`w-full text-center py-3 px-4 rounded-xl font-title-md text-xs font-extrabold shadow-md transition-all ${exp.btnBg}`}
              >
                {exp.ctaText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
