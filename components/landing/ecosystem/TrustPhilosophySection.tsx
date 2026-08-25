'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TrustPhilosophySection() {
  const trustPoints = [
    { title: 'Grounded in School Data', desc: 'AI queries live database facts and never hallucinates metrics.' },
    { title: 'Human-in-the-Loop', desc: 'Teachers review and approve all teaching interventions and notes.' },
    { title: 'Strict Role Isolation', desc: 'Private teacher-parent notes remain completely hidden from students.' },
    { title: 'Multi-Tenant Security', desc: 'All records strictly isolated by school_id across every server query.' },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Quote Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center shadow-xl border border-indigo-800/40 relative overflow-hidden"
        >
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <span className="text-4xl">❝</span>
            <blockquote className="font-display text-2xl sm:text-4xl font-black text-white leading-snug tracking-tight">
              &quot;A school shouldn&apos;t need another dashboard. It needs a system that helps everyone know what to do next.&quot;
            </blockquote>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-300">
              — The ShikshaSetu Philosophy
            </p>
          </div>
        </motion.div>

        {/* AI Philosophy & Security Section */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Trust &amp; Governance
            </span>
            <h3 className="font-display text-3xl font-black text-slate-900">
              AI assists. People decide.
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              We believe in augmenting educators and parents, never replacing them with automated black-box algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((tp) => (
              <div
                key={tp.title}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-black">
                  <span>✓</span>
                  <h4 className="font-display text-xs font-black text-slate-900">{tp.title}</h4>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
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
