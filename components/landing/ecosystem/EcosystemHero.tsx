'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLandingModal } from '../LandingModalContext';

export function EcosystemHero() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="bg-[#FAF9F6] pt-10 pb-16 md:pt-16 md:pb-24 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Confident Editorial Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stone-100 border border-stone-200 text-[#172033]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#16836A]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                ShikshaSetu • School Learning Ecosystem
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#172033] tracking-tight leading-[1.08]"
            >
              The school ERP that actually <span className="font-serif italic font-normal text-[#2563EB]">understands</span> learning.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Traditional ERPs tell schools what happened. ShikshaSetu connects teachers, students, and parents around one continuously evolving student journey to decide <strong className="text-[#172033] font-bold">what to do next</strong>.
            </motion.p>

            {/* Solid Confident Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <button
                type="button"
                onClick={openRoleSelector}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-display text-sm font-bold px-7 py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore ShikshaSetu</span>
                <span className="font-bold">&rarr;</span>
              </button>

              <a
                href="#learning-loop"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-[#172033] font-display text-sm font-bold border border-stone-300 shadow-xs transition-all text-center"
              >
                See How It Works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-stone-500 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[#16836A] font-bold">✓</span>
                <span>One canonical student record</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#16836A] font-bold">✓</span>
                <span>Live multi-portal sync</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Authentic Editorial Student Photo + Real Product UI Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-6 relative"
          >
            {/* Editorial Photograph with Clean Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 shadow-md">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/editorial_hero_student.jpg"
                  alt="Student Priya Patel revising with digital study notes in school library"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Bottom Caption Pill */}
              <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#16836A]" />
                  <span className="font-bold text-[#172033]">Priya Patel • Class 8A</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-stone-500">DPS R.K. Puram</span>
              </div>
            </div>

            {/* Overlaid Real Product Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 p-4 rounded-xl bg-white border border-stone-200 shadow-lg sm:max-w-xs space-y-2.5 z-20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  Teacher Copilot Signal
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                  Maths 58%
                </span>
              </div>

              <div className="space-y-0.5">
                <h4 className="font-display text-xs font-bold text-[#172033]">
                  Equivalent Fractions Needs Practice
                </h4>
                <p className="text-[11px] text-stone-500 font-normal leading-snug">
                  5-minute visual fraction bar review recommended for Class 8A before mixed operations.
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium">
                <span>Homeroom Period 1</span>
                <span className="text-[#2563EB] font-bold">15-Min Revision Ready &rarr;</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
