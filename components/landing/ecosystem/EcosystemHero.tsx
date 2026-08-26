'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLandingModal } from '../LandingModalContext';

export function EcosystemHero() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="bg-[#FFF9F0] pt-6 pb-12 md:pt-10 md:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[44px] font-black text-[#102A43] tracking-tight leading-[1.08] uppercase">
              THE SCHOOL ERP <br />
              THAT ACTUALLY <br />
              UNDERSTANDS <br />
              LEARNING.
            </h1>

            <p className="text-sm sm:text-base text-[#102A43]/80 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
              ShikshaSetu connects teachers, students, and parents around one live journey to decide what to do next.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
              <button
                type="button"
                onClick={openRoleSelector}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-display text-xs font-bold px-6 py-3 rounded-lg shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore ShikshaSetu</span>
                <span className="font-bold">&rarr;</span>
              </button>

              <a
                href="#the-difference"
                className="text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <span>See How It Works</span>
                <span className="font-bold">&rarr;</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Image with Floating Product Insight Card */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(16,42,67,0.12)] border border-[#102A43]/10 bg-white">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/images/editorial_hero_student.jpg"
                  alt="Student Priya Patel studying in school library with digital tablet"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>

              {/* Floating Product Insight Overlay Card matching PNG */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="absolute top-1/2 left-6 -translate-y-1/2 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#102A43]/15 shadow-[0_12px_28px_rgba(16,42,67,0.15)] max-w-[260px] space-y-2 z-20"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                  <span className="font-display text-xs font-bold text-[#102A43]">
                    Mathematics
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">ⓘ</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#FFF9F0] px-1.5 py-0.5 rounded border border-[#F59E0B]/30">
                    58% - Needs Practice
                  </span>
                </div>

                <div className="space-y-1 text-[10px] text-[#102A43]/80">
                  <span className="font-bold text-[#102A43] block">Recommended Actions:</span>
                  <p className="leading-tight">1. Complete 5-minute equivalent fractions review.</p>
                  <p className="leading-tight">2. Reattempt practice quiz.</p>
                </div>

                <div className="pt-1 text-[9px] text-[#102A43]/50 font-mono">
                  (AI Insight, Oct 26)
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
