'use client';

import React from 'react';
import Image from 'next/image';
import { useLandingModal } from '../LandingModalContext';

export function FinalCTA() {
  const { openRoleSelector } = useLandingModal();

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#102A43]/10 shadow-[0_4px_24px_rgba(16,42,67,0.06)] space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Left: Text and CTAs */}
        <div className="sm:col-span-7 space-y-3">
          <h3 className="font-display text-xl sm:text-2xl font-black text-[#102A43] tracking-tight leading-tight uppercase">
            DON&apos;T JUST MANAGE YOUR SCHOOL. <br />
            UNDERSTAND EVERY LEARNER.
          </h3>
          <p className="text-xs text-[#102A43]/70 font-medium leading-relaxed">
            Human-centric ShikshaSetu that understands and empowers every learner.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={openRoleSelector}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-display text-xs font-bold px-5 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore ShikshaSetu</span>
              <span className="font-bold">&rarr;</span>
            </button>

            <a
              href="#the-difference"
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              Schedule a Demo
            </a>
          </div>
        </div>

        {/* Right: Family Study Photography */}
        <div className="sm:col-span-5 relative rounded-xl overflow-hidden aspect-[4/3] border border-stone-200 shadow-2xs">
          <Image
            src="/images/editorial_parent_child.jpg"
            alt="Family studying and smiling together"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 30vw"
          />
        </div>
      </div>
    </div>
  );
}
