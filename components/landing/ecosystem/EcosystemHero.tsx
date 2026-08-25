'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLandingModal } from '../LandingModalContext';

export function EcosystemHero() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-blue-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-200/80 shadow-xs backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            <span className="text-[11px] font-black tracking-wider uppercase text-indigo-950">
              The Intelligent Learning Ecosystem
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded-full border border-indigo-100">
              v2.0
            </span>
          </div>
        </motion.div>

        {/* 2-Column Hero Composition: Typography Left, Real Visual + UI Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Core Positioning & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]"
            >
              The school ERP that <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                actually understands learning.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Traditional ERPs tell schools what happened. ShikshaSetu connects the people, data, and AI that help decide{' '}
              <strong className="text-slate-900 font-black">what happens next</strong>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openRoleSelector}
                className="w-full sm:w-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white font-display text-sm font-black px-8 py-4 rounded-2xl shadow-lg shadow-indigo-950/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>See ShikshaSetu in Action</span>
                <span className="text-indigo-400 font-bold">&rarr;</span>
              </motion.button>

              <a
                href="#learning-loop"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 font-display text-sm font-black border border-slate-200/90 shadow-xs transition-all text-center"
              >
                Explore the Learning Journey
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="text-xs font-bold text-slate-400 tracking-wide pt-1"
            >
              ✨ One school • One source of truth • Every learner connected
            </motion.p>
          </div>

          {/* Right Column: High-Impact Human Photography + Real Product UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            {/* Main Editorial Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-slate-900 group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/editorial_hero_student.jpg"
                  alt="Student Priya Patel studying with ShikshaSetu digital notes in modern classroom library"
                  fill
                  priority
                  className="object-cover group-hover:scale-103 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Subtle dark gradient overlay on bottom for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Bottom Image Overlay Tag */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Priya Patel • Class 8A (Learner Core)</span>
                </div>
                <span className="text-[10px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                  Live Sync
                </span>
              </div>
            </div>

            {/* Overlaid Real Product UI Card (Teacher Support Signal) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 sm:mt-0 sm:absolute sm:-bottom-8 sm:-left-6 z-20 p-5 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl sm:max-w-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                  👩‍🏫 Teacher Copilot Live Signal
                </span>
                <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                  58% Maths
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-xs font-black text-slate-900 leading-snug">
                  Equivalent Fractions Gap Identified
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  3 students struggled with simplification. 5-minute visual fraction bar review recommended.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>Class 8A Homeroom</span>
                <span className="text-indigo-600 font-black">Action Ready &rarr;</span>
              </div>
            </motion.div>

            {/* Overlaid Parent Support Notification Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="hidden sm:block absolute -top-6 -right-4 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-2xl border border-amber-200/90 shadow-xl max-w-[210px] space-y-1.5"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">👨‍👩‍👧</span>
                <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider">
                  Parent Family Digest
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-bold leading-tight">
                &quot;Ask Priya to explain one fractions question tonight.&quot;
              </p>
              <span className="text-[9px] font-mono text-emerald-600 font-bold block pt-1">
                ✓ Rajesh Patel Connected
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
