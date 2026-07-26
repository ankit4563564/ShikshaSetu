import React from 'react';
import Image from 'next/image';

const TESTIMONIALS = [
  {
    quote: "Parent anxiety calls dropped dramatically within 2 weeks of launching ShikshaSetu. Parents check their phone once, see the live bus GPS and gate scan, and feel complete peace of mind.",
    outcome: "60% Reduction in Parent Support Calls",
    author: "Principal Sunita Sharma",
    role: "Delhi Public School, Sector 45",
    photo: "/ananya.png",
    statBadge: "60% Fewer Calls",
    color: "from-amber-500/10 to-orange-500/5 border-amber-200/50"
  },
  {
    quote: "SchoolGPT saves our teachers 45 minutes every morning on attendance reconciliation and lesson planning. The automated AI parent updates have transformed school-home trust.",
    outcome: "45 Mins Saved Per Teacher Daily",
    author: "Vice Principal Rajesh Verma",
    role: "Modern School, Barakhamba Road",
    photo: "/rohan.png",
    statBadge: "45 Mins Saved/Day",
    color: "from-teal-500/10 to-emerald-500/5 border-teal-200/50"
  },
  {
    quote: "Our campus gate security used to be a morning bottleneck. With instant QR scans and automated bus telemetry, gate entry takes under 2 seconds per child.",
    outcome: "99.8% On-Time Gate Entry Rate",
    author: "Security Admin Col. V. K. Nair",
    role: "Ryan International School, Noida",
    photo: "/kabir.png",
    statBadge: "99.8% On-Time Rate",
    color: "from-sky-500/10 to-indigo-500/5 border-sky-200/50"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-section-gap bg-surface-container-low rounded-[3rem] my-12" id="testimonials">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-primary text-sm">stars</span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold">Proven Campus Impact</span>
          </div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Trusted by Leaders Across <span className="text-primary font-bold">Indian Schools</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
            Real outcomes measured across parents, teachers, and school administration teams.
          </p>
        </div>

        {/* 3 High-Impact Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className={`bg-gradient-to-br ${t.color} rounded-[2rem] p-8 border shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative bg-white/90`}
            >
              {/* Prominent Stat Outcome Badge */}
              <div className="mb-6">
                <span className="inline-block bg-primary text-on-primary font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-md">
                  {t.statBadge}
                </span>
                <p className="text-lg font-extrabold text-slate-900 mt-3 font-display leading-snug">
                  &ldquo;{t.outcome}&rdquo;
                </p>
              </div>

              {/* Quote Body */}
              <p className="font-body-md text-slate-700 text-sm leading-relaxed mb-8 flex-1 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Profile Footer */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-200/80">
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
                  <h4 className="font-bold text-slate-900 text-sm font-display leading-tight">{t.author}</h4>
                  <p className="text-xs text-slate-600 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
