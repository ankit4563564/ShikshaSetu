'use client';

import React from 'react';

export function AiEcosystemSection() {
  const cards = [
    {
      title: 'Teacher AI Context',
      content:
        '“Priya and 3 others struggling with Equivalent Fractions. Recommend assigning Video Lesson X and Practice Quiz Y before tomorrow’s class.”',
    },
    {
      title: 'Student AI Context',
      content:
        '“Based on your recent quiz, let’s practice Equivalent Fractions. Here’s a fun video and a quick game to help you master it!”',
    },
    {
      title: 'Parent AI Context',
      content:
        '“Priya is finding Equivalent Fractions challenging. The teacher has assigned extra practice. A supportive conversation tonight would be helpful.”',
    },
  ];

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-[#102A43] text-white shadow-[0_6px_24px_rgba(16,42,67,0.12)] space-y-4">
      {/* Title matching PNG */}
      <h3 className="font-display text-base font-black text-white tracking-tight uppercase">
        AI WITH CONTEXT. NOT JUST AI CHAT.
      </h3>

      {/* 3 Cream Cards Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="p-3.5 rounded-xl bg-[#FFF9F0] text-[#102A43] border border-[#F59E0B]/20 space-y-2 flex flex-col justify-between shadow-2xs"
          >
            <span className="font-display text-xs font-bold text-[#102A43] block border-b border-stone-200 pb-1">
              {c.title}
            </span>
            <p className="text-[11px] text-[#102A43]/80 leading-relaxed italic">
              {c.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
