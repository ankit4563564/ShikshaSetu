'use client';

import React from 'react';

export function LearningLoopSection() {
  const steps = [
    {
      num: '1',
      title: '1. Identify Gap',
      desc: 'AI detects Equivalent Fractions concept issue (58%).',
    },
    {
      num: '2',
      title: '2. Teacher Review',
      desc: 'Teacher assigns focused intervention & guidance.',
    },
    {
      num: '3',
      title: '3. Student Revision',
      desc: 'Priya engages with personalized content.',
    },
    {
      num: '4',
      title: '4. Mastery Check',
      desc: 'Final assessment shows significant improvement (78%).',
    },
  ];

  return (
    <section id="learning-loop" className="py-14 md:py-18 bg-[#FFF9F0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Headline */}
        <div className="text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight uppercase">
            58% TO 78% MASTERY: THE CONTINUOUS LEARNING LOOP
          </h2>
        </div>

        {/* 4 Connected Horizontal Stages with Arrows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {steps.map((s, idx) => (
            <div key={s.num} className="relative flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-[#102A43]">
                  {s.title}
                </h3>
                {idx < steps.length - 1 && (
                  <span className="hidden lg:inline text-stone-300 font-bold text-lg -mr-3">&rarr;</span>
                )}
              </div>
              <p className="text-xs text-[#102A43]/70 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
