'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SectionWrapper, SectionHeading, FeatureCard, Button } from './Primitives';

export function PlatformOverviewV3() {
  const cards = [
    {
      badge: 'FOR PARENTS',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Complete peace of mind',
      desc: 'Live bus, attendance, homework, teacher updates, and instant safe confirmations.',
      cta: 'Explore Parent App',
      href: '/parent',
      image: '/images/parent_safety_app.jpg',
    },
    {
      badge: 'FOR TEACHERS',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Focus more on teaching',
      desc: 'Smart dashboards, AI insights, lesson plans, analytics, and automated homework tools.',
      cta: 'Explore Teacher Tools',
      href: '/teacher',
      image: '/images/teacher_classroom_ai.jpg',
    },
    {
      badge: 'FOR SCHOOLS',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      title: 'Run operations like never before',
      desc: 'Admissions, communication, transport, attendance, and analytics — all connected.',
      cta: 'Explore School OS',
      href: '/admin',
      image: '/images/school_admin_analytics_visual.jpg',
    },
  ];

  return (
    <SectionWrapper bg="bg-[#F5F8FF]" id="features">
      <div className="space-y-16">
        <SectionHeading
          eyebrow="NEXT-GEN PLATFORM CAPABILITIES"
          title="One platform."
          highlight="Every connection."
          subtitle="ShikshaSetu unites parents, teachers, students and school operations through AI-powered intelligence and real-time telemetry."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c) => (
            <FeatureCard key={c.title} className="space-y-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
              <div className="space-y-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-extrabold border ${c.badgeColor}`}>
                  {c.badge}
                </span>
                <h3 className="font-display text-2xl font-black text-slate-900 leading-tight">{c.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{c.desc}</p>
              </div>

              <div className="space-y-5">
                <div className="relative h-[180px] w-full rounded-[24px] overflow-hidden border border-slate-100 bg-slate-50">
                  <Image src={c.image} alt={c.title} fill className="object-cover" />
                </div>

                <Link
                  href={c.href}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>{c.cta}</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
