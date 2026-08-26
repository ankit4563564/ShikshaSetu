'use client';

import React from 'react';
import Link from 'next/link';

export function AiEcosystemSection() {
  const copilots = [
    {
      title: 'Teacher Copilot',
      inquiry: '“What should I teach next?”',
      evidence: 'Priya & 3 others struggling with Equivalent Fractions.',
      action: 'Run a 10-minute visual fraction review tomorrow.',
      btnLabel: 'Create Quick Check',
      href: '/teacher',
      accentColor: 'border-t-4 border-t-[#2563EB]',
      badgeColor: 'text-[#2563EB] bg-[#EFF6FF]',
    },
    {
      title: 'Student SchoolMitra',
      inquiry: '“What should I learn next?”',
      evidence: 'Equivalent Fractions is your next focus.',
      action: 'Try a 15-minute revision & worked practice sheet.',
      btnLabel: 'Start Revision',
      href: '/student',
      accentColor: 'border-t-4 border-t-[#F59E0B]',
      badgeColor: 'text-[#F59E0B] bg-[#FFF9F0]',
    },
    {
      title: 'Parent Guide',
      inquiry: '“How can I help at home?”',
      evidence: 'Priya may benefit from a little extra practice.',
      action: 'Ask her to explain one fraction question over dinner.',
      btnLabel: 'How Can I Help?',
      href: '/parent',
      accentColor: 'border-t-4 border-t-[#16A085]',
      badgeColor: 'text-[#16A085] bg-[#E6F7F2]',
    },
  ];

  return (
    <div id="ai-intelligence" className="p-6 sm:p-7 rounded-2xl bg-[#102A43] text-white shadow-[0_6px_24px_rgba(16,42,67,0.12)] space-y-4">
      {/* Title & Trust Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
            One Canonical Fact • Three Role Copilots
          </span>
          <h3 className="font-display text-base sm:text-lg font-black text-white tracking-tight uppercase">
            AI WITH CONTEXT. NOT JUST AI CHAT.
          </h3>
        </div>
        <span className="text-xs text-white/70 font-medium self-start sm:self-auto">
          Same learner. Same evidence. Different perspective.
        </span>
      </div>

      {/* 3 Cream Cards Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {copilots.map((c) => (
          <div
            key={c.title}
            className={`p-4 rounded-xl bg-[#FFF9F0] text-[#102A43] ${c.accentColor} space-y-2.5 flex flex-col justify-between shadow-2xs`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-[#102A43]">
                  {c.title}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${c.badgeColor}`}>
                  Class 8A
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#2563EB] font-bold">
                {c.inquiry}
              </p>
              <p className="text-xs text-[#102A43]/75 leading-relaxed font-medium">
                {c.evidence}
              </p>
              <p className="text-xs font-bold text-[#102A43] border-t border-stone-200/80 pt-1.5">
                💡 {c.action}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <Link
                href={c.href}
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
              >
                <span>{c.btnLabel}</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
