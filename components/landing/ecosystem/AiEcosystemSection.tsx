'use client';

import React from 'react';

export function AiEcosystemSection() {
  const cards = [
    {
      title: 'Teacher AI Context',
      inquiry: '“What should I teach next?”',
      content:
        '“Priya and 3 others struggling with Equivalent Fractions. Recommend assigning Video Lesson X and Practice Quiz Y before tomorrow’s class.”',
    },
    {
      title: 'Student AI Context',
      inquiry: '“What should I learn tonight?”',
      content:
        '“Based on your recent quiz, let’s practice Equivalent Fractions. Here’s a fun video and a quick game to help you master it!”',
    },
    {
      title: 'Parent AI Context',
      inquiry: '“How can I help at home?”',
      content:
        '“Priya is finding Equivalent Fractions challenging. The teacher has assigned extra practice. A supportive conversation tonight would be helpful.”',
    },
  ];

  return (
    <div id="ai-intelligence" className="p-6 sm:p-7 rounded-2xl bg-[#102A43] text-white shadow-[0_6px_24px_rgba(16,42,67,0.12)] space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base sm:text-lg font-black text-white tracking-tight uppercase">
          AI WITH CONTEXT. NOT JUST AI CHAT.
        </h3>
        <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-400/30">
          Grounded In DB Facts
        </span>
      </div>

      {/* 3 Cream Cards Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {cards.map((c) => (
          <div
            key={c.title}
            className="p-4 rounded-xl bg-[#FFF9F0] text-[#102A43] border border-[#F59E0B]/25 space-y-2 flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-1">
              <span className="font-display text-xs font-bold text-[#102A43] block">
                {c.title}
              </span>
              <p className="text-[11px] font-mono text-[#2563EB] font-bold">
                {c.inquiry}
              </p>
            </div>
            <p className="text-xs text-[#102A43]/80 leading-relaxed italic border-t border-stone-200 pt-1.5">
              {c.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
