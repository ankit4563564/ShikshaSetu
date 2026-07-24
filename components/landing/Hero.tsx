'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { SchoolStoryExperience } from '@/components/onboarding';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#1f4e5f] px-6 pb-20 pt-36 text-white lg:px-8 lg:pb-24 lg:pt-44">
      <div className="absolute top-[-20%] left-[-10%] w-[650px] h-[650px] rounded-full bg-[#e8a33d]/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#6b9080]/25 blur-[130px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-extrabold tracking-[0.22em] text-white/90 backdrop-blur-md shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e8a33d] animate-pulse" />
              ONE SCHOOL DAY. ONE CONNECTED STORY.
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
              A calmer day for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#e8a33d] via-[#f4c875] to-[#e8a33d] bg-clip-text text-transparent">
                every child.
              </span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              Gate entry, classroom attention, live bus tracking, and home-safe confirmation — linked in real time for parents, teachers, and school teams.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <SchoolStoryExperience />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/demo"
                  className="inline-flex rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 shadow-sm"
                >
                  Watch the school day →
                </Link>
              </motion.div>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-bold text-white/80">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#6b9080] shadow-[0_0_8px_#6b9080]" />
                Live school signals
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span>Built for Indian schools</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto h-[460px] w-full max-w-[580px] sm:h-[580px]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[36px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <Image
                src="/shikshasetu-hero-student.png"
                alt="Indian school student with backpack arriving confidently for the school day, ready to learn and grow"
                fill
                priority
                className="object-cover object-[58%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f4e5f]/50 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
