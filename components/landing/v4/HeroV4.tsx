'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from './Primitives';

export function HeroV4() {
  return (
    <section className="w-full bg-gradient-to-b from-[#FAFBFF] via-[#F4F7FF] to-[#FAFBFF] pt-6 pb-20 lg:pb-28 font-body text-slate-900 overflow-hidden relative">
      {/* Colorful Background Ambient Mesh Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-blue-400/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-[450px] h-[450px] rounded-full bg-purple-400/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-emerald-400/15 blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-[1280px] mx-auto px-6 lg:px-8 mb-16 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-display text-lg font-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-display text-xl font-black text-slate-900 tracking-tight">ShikshaSetu</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold text-slate-600">
          <Link href="/parent" className="hover:text-blue-600 transition-colors">For Parents</Link>
          <Link href="/teacher" className="hover:text-blue-600 transition-colors">For Teachers</Link>
          <Link href="/admin" className="hover:text-blue-600 transition-colors">For Schools</Link>
          <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#schoolgpt" className="hover:text-purple-600 transition-colors">SchoolGPT AI</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/teacher" className="text-xs font-extrabold text-slate-600 hover:text-slate-900 hidden sm:inline-block px-3">
            Teacher Portal
          </Link>
          <Button href="/parent" variant="primary">Parent App &rarr;</Button>
        </div>
      </header>

      {/* Hero Content Grid */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-200 text-blue-700 text-xs font-mono font-extrabold uppercase tracking-widest shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>SAFE &amp; CONNECTED SCHOOL DAY</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
            A calmer day <br />
            for <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">every child.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-lg">
            Gate entry, classroom activities, live bus tracking, and home-safe confirmations — all in real time for parents, teachers, and school teams.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button href="/parent" variant="primary">Open Parent Portal &rarr;</Button>
            <Button href="/teacher" variant="secondary">Open Teacher Workspace &rarr;</Button>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live Updates
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span>🎒</span>
              500+ Schools
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-purple-700">
              <span>💜</span>
              1M+ Connected
            </span>
          </div>
        </div>

        {/* Right Column: Hero Visual with Real Indian Student Photo & Floating Live Cards */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="relative w-full max-w-[480px] h-[500px] rounded-[24px] overflow-hidden shadow-2xl border border-slate-200/90 bg-white group">
            {/* Real Indian Student Photo */}
            <Image
              src="/priya.png"
              alt="Real Indian Student Girl"
              fill
              priority
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />

            {/* Subtle Gradient Backdrop Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

            {/* Live Floating Card 1: Bus Tracking */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-6 left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-3 text-xs max-w-[250px]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center text-sm font-black shadow-xs">
                🚌
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Live Bus GPS</h4>
                <p className="text-[11px] text-slate-500 font-medium">Saket Route #4 • 2 mins away</p>
              </div>
            </motion.div>

            {/* Live Floating Card 2: Gate Entry Confirmation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-3 text-xs max-w-[270px]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-black shadow-xs">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Gate Scanner Verified</h4>
                <p className="text-[11px] text-slate-500 font-mono">Aarav Sharma • 08:01 AM</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
