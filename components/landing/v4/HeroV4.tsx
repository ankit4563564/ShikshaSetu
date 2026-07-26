'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from './Primitives';

export function HeroV4() {
  return (
    <section className="w-full bg-[#FAFBFF] pt-6 pb-20 lg:pb-28 font-body text-slate-900 overflow-hidden relative">
      {/* Top Navbar */}
      <header className="max-w-[1280px] mx-auto px-6 lg:px-8 mb-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-display text-base font-black flex items-center justify-center shadow-md">
            S
          </div>
          <span className="font-display text-xl font-black text-slate-900 tracking-tight">ShikshaSetu</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold text-slate-600">
          <Link href="/parent" className="hover:text-blue-600 transition-colors">For Parents</Link>
          <Link href="/teacher" className="hover:text-blue-600 transition-colors">For Schools</Link>
          <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#about" className="hover:text-blue-600 transition-colors">About Us</Link>
          <Link href="#resources" className="hover:text-blue-600 transition-colors">Resources</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/demo" className="text-xs font-extrabold text-slate-600 hover:text-slate-900 hidden sm:inline-block px-3">
            Watch demo
          </Link>
          <Button href="/teacher" variant="primary">Book a demo</Button>
        </div>
      </header>

      {/* Hero Content Grid */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-extrabold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>REAL-TIME SCHOOL ECOSYSTEM</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
            A calmer day <br />
            for <span className="text-blue-600">every child.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
            Gate entry, classroom activities, live bus tracking, and home-safe confirmations — all in real time for parents, teachers, and school teams.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button href="/teacher" variant="primary">Start your school&apos;s journey &rarr;</Button>
            <Button href="/demo" variant="glass">Watch the school day &rarr;</Button>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live school insights
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span>🎒</span>
              Used by modern schools
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span>💜</span>
              Trusted by parents
            </span>
          </div>
        </div>

        {/* Right Column: Hero Visual with Live Floating Cards */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="relative w-full max-w-[500px] h-[480px] rounded-[24px] overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
            <Image
              src="/priya.png"
              alt="Happy Indian school student girl in uniform holding books"
              fill
              priority
              className="object-cover object-top"
            />

            {/* Live Floating Card 1: Bus Tracking */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-6 left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3 text-xs max-w-[240px]"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
                🚌
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Live Bus</h4>
                <p className="text-[11px] text-slate-500 font-medium">Bus is 2 mins away from school</p>
              </div>
            </motion.div>

            {/* Live Floating Card 2: Gate Entry Confirmation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3 text-xs max-w-[260px]"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Aarav reached school</h4>
                <p className="text-[11px] text-slate-500 font-mono">08:01 AM • Gate Entry</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
