'use client';

import React from 'react';

export function TrustPhilosophySection() {
  const trustPoints = [
    { title: 'Grounded in School Data', desc: 'AI queries live database facts and never fabricates scores or metrics.' },
    { title: 'Human-in-the-Loop', desc: 'Teachers review and approve all teaching interventions and lesson plans.' },
    { title: 'Strict Role Isolation', desc: 'Private teacher-parent communication remains completely hidden from students.' },
    { title: 'Multi-Tenant Security', desc: 'Every record is strictly isolated by school_id across all server queries.' },
  ];

  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Quote Banner */}
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-stone-300 shadow-sm text-center max-w-4xl mx-auto space-y-4">
          <span className="text-3xl text-stone-300 font-serif">❝</span>
          <blockquote className="font-display text-2xl sm:text-3xl font-bold text-[#172033] leading-snug tracking-tight">
            &quot;A school shouldn&apos;t need another dashboard. It needs a system that helps everyone know what to do next.&quot;
          </blockquote>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            — The ShikshaSetu Philosophy
          </p>
        </div>

        {/* AI Philosophy & Security Section */}
        <div className="space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
              Trust &amp; Governance
            </span>
            <h3 className="font-display text-2xl font-bold text-[#172033]">
              AI assists. People decide.
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We believe in augmenting educators and parents, never replacing them with automated black-box algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map((tp) => (
              <div
                key={tp.title}
                className="p-5 rounded-xl bg-white border border-stone-200 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-[#16836A] text-xs font-bold">
                  <span>✓</span>
                  <h4 className="font-display text-xs font-bold text-[#172033]">{tp.title}</h4>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {tp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
