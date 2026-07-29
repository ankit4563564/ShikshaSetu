'use client';

import React from 'react';
import Image from 'next/image';
import { useLandingModal } from './LandingModalContext';

const TESTIMONIALS = [
  {
    quote: "Parent anxiety calls dropped dramatically within 2 weeks of launching ShikshaSetu. Parents check their phone once, see the live bus GPS and gate scan, and feel complete peace of mind.",
    outcome: "60% Reduction in Parent Support Calls",
    author: "Principal Sunita Sharma",
    role: "Delhi Public School, Sector 45",
    school: "Delhi Public School, Sector 45",
    photo: "/ananya.png",
    statBadge: "60% Fewer Calls",
    color: "from-amber-500/10 to-orange-500/5 border-amber-200/50",
    fullStory: [
      "Before ShikshaSetu, our school administration team received over 120 calls every morning from anxious parents asking about bus delays and gate arrivals.",
      "With ShikshaSetu's automated RFID gate scans and live GPS bus tracking, parents receive real-time push and WhatsApp notifications instantly.",
      "The result was immediate: morning support phone traffic dropped by 60%, allowing our admin staff to focus on academic quality and student welfare."
    ],
    keyResults: [
      { metric: "-60%", detail: "Morning Call Volume" },
      { metric: "1.8K", detail: "Active Parents" },
      { metric: "99.8%", detail: "Gate Scan Reliability" },
      { metric: "2 Mins", detail: "Average App Time / Day" }
    ]
  },
  {
    quote: "SchoolGPT saves our teachers 45 minutes every morning on attendance reconciliation and lesson planning. The automated AI parent updates have transformed school-home trust.",
    outcome: "45 Mins Saved Per Teacher Daily",
    author: "Vice Principal Rajesh Verma",
    role: "Modern School, Barakhamba Road",
    school: "Modern School, Barakhamba Road",
    photo: "/rohan.png",
    statBadge: "45 Mins Saved/Day",
    color: "from-teal-500/10 to-emerald-500/5 border-teal-200/50",
    fullStory: [
      "Our faculty used to spend the first 30 minutes of every morning taking roll calls, writing tardy notes, and preparing daily lesson plans manually.",
      "With SchoolGPT's automated signal sync, gate entry scans auto-populate the attendance register before the first bell even rings.",
      "Teachers now use SchoolGPT's 1-click quiz generator to tailor homework and communicate progress with parents effortlessly."
    ],
    keyResults: [
      { metric: "45 Mins", detail: "Saved Per Teacher / Day" },
      { metric: "+34%", detail: "Homework Completion" },
      { metric: "98%", detail: "Parent Engagement" },
      { metric: "0", detail: "Manual Paper Registers" }
    ]
  },
  {
    quote: "Our campus gate security used to be a morning bottleneck. With instant QR scans and automated bus telemetry, gate entry takes under 2 seconds per child.",
    outcome: "99.8% On-Time Gate Entry Rate",
    author: "Security Admin Col. V. K. Nair",
    role: "Ryan International School, Noida",
    school: "Ryan International School, Noida",
    photo: "/kabir.png",
    statBadge: "99.8% On-Time Rate",
    color: "from-sky-500/10 to-indigo-500/5 border-sky-200/50",
    fullStory: [
      "Managing gate traffic for 2,400 students across 3 primary gates required a streamlined, ultra-reliable verification system.",
      "ShikshaSetu's offline-first RFID and QR pass readers process student entries in under 0.8 seconds per child, instantly syncing with bus arrival signals.",
      "Parents get immediate peace of mind, and our security team maintains 100% visibility over campus entry and exit."
    ],
    keyResults: [
      { metric: "0.8 Sec", detail: "Per Student Gate Scan" },
      { metric: "2,400", detail: "Students Monitored" },
      { metric: "99.8%", detail: "On-Time Arrival Rate" },
      { metric: "100%", detail: "Campus Safety Compliance" }
    ]
  }
];

export function TestimonialsSection() {
  const { openCaseStudy } = useLandingModal();

  return (
    <section className="py-16 md:py-20 bg-surface-container-low rounded-[2rem] my-8" id="testimonials">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-primary text-sm">stars</span>
            <span className="font-label-sm text-[13px] text-primary tracking-widest uppercase font-bold">Proven Campus Impact</span>
          </div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Trusted by Leaders Across <span className="text-primary font-bold">Indian Schools</span>
          </h2>
          <p className="font-body-lg text-[17px] text-on-surface-variant font-medium leading-relaxed">
            Real outcomes measured across parents, teachers, and school administration teams.
          </p>
        </div>

        {/* 3 High-Impact Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              onClick={() => openCaseStudy(t)}
              className={`bg-gradient-to-br ${t.color} rounded-2xl p-6 md:p-7 border shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative bg-white/90 cursor-pointer group`}
            >
              {/* Prominent Stat Outcome Badge */}
              <div className="mb-6">
                <span className="inline-block bg-primary text-on-primary font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-md">
                  {t.statBadge}
                </span>
                <p className="text-lg font-extrabold text-slate-900 mt-3 font-display leading-snug group-hover:text-primary transition-colors">
                  &ldquo;{t.outcome}&rdquo;
                </p>
              </div>

              {/* Quote Body */}
              <p className="font-body-md text-[#374151] text-[15px] leading-relaxed mb-6 flex-1 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Profile Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary shrink-0 shadow-md">
                    <Image
                      src={t.photo}
                      alt={t.author}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] font-display leading-tight">{t.author}</h4>
                    <p className="text-[13px] text-slate-600 font-medium">{t.role}</p>
                  </div>
                </div>
                <span className="text-[13px] font-bold font-mono text-primary group-hover:translate-x-1 transition-transform">
                  Read →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
