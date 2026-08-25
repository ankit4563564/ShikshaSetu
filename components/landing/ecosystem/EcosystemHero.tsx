'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLandingModal } from '../LandingModalContext';

export function EcosystemHero() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="bg-[#FFF9F0] pt-8 pb-14 md:pt-12 md:pb-18 border-b border-[#102A43]/10 relative overflow-hidden">
      {/* Subtle organic background color accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EFF6FF] rounded-full blur-3xl pointer-events-none -z-0 opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Typography, Color Hierarchy & CTAs */}
          <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-[#102A43]/10 shadow-[0_2px_8px_rgba(16,42,67,0.04)]">
              <span className="h-2 w-2 rounded-full bg-[#16A085]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#102A43]">
                School Learning Ecosystem
              </span>
              <span className="text-[10px] font-bold text-[#F59E0B] bg-[#FFF9F0] px-1.5 py-0.5 rounded border border-[#F59E0B]/30">
                Single Source of Truth
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-5xl font-black text-[#102A43] tracking-tight leading-[1.08]">
              The school ERP that actually <span className="text-[#2563EB]">understands</span> learning.
            </h1>

            <p className="text-base sm:text-lg text-[#102A43]/70 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Traditional ERPs tell schools what happened. ShikshaSetu connects teachers, students, and parents around one live journey to decide <strong className="text-[#102A43] font-bold">what to do next</strong>.
            </p>

            {/* Solid Intentional Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={openRoleSelector}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-display text-sm font-bold px-7 py-3.5 rounded-xl shadow-[0_6px_20px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore ShikshaSetu</span>
                <span className="font-bold">&rarr;</span>
              </button>

              <a
                href="#the-difference"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-[#102A43] font-display text-sm font-bold border border-[#102A43]/20 shadow-[0_2px_8px_rgba(16,42,67,0.04)] transition-all text-center"
              >
                See How It Works
              </a>
            </div>

            {/* Semantic Micro Proof Line */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-[#102A43]/70">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <strong>Teacher</strong> Intelligence
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <strong>Student</strong> Revision
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F97360]" />
                <strong>Parent</strong> Partnership
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A085]" />
                <strong>Mint</strong> Progress Sync
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Visual + Semantic UI Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#102A43]/15 bg-white shadow-[0_12px_40px_rgba(16,42,67,0.08)]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/editorial_hero_student.jpg"
                  alt="Student Priya Patel studying in school library"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Photo Caption Tag */}
              <div className="p-3 bg-white border-t border-[#102A43]/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#16A085]" />
                  <span className="font-bold text-[#102A43]">Priya Patel • Class 8A</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-[#102A43]/60">DPS R.K. Puram</span>
              </div>
            </div>

            {/* Overlaid Real Product Action Card */}
            <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-5 sm:-left-5 p-4 rounded-xl bg-white border border-[#102A43]/15 shadow-[0_12px_32px_rgba(16,42,67,0.12)] sm:max-w-xs space-y-2 z-20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] border border-[#2563EB]/20 px-2 py-0.5 rounded">
                  Teacher Copilot Signal
                </span>
                <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#FFF9F0] px-2 py-0.5 rounded border border-[#F59E0B]/30">
                  Maths 58%
                </span>
              </div>

              <div className="space-y-0.5">
                <h4 className="font-display text-xs font-bold text-[#102A43]">
                  Equivalent Fractions Needs Practice
                </h4>
                <p className="text-[11px] text-[#102A43]/60 leading-snug">
                  5-minute visual fraction bar review recommended before mixed operations.
                </p>
              </div>

              <div className="pt-1.5 border-t border-[#102A43]/10 flex items-center justify-between text-[10px] text-[#102A43]/50 font-medium">
                <span>Class 8A Homeroom</span>
                <span className="text-[#2563EB] font-bold">15-Min Revision Ready &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
