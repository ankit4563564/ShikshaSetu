import React from 'react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="hero-gradient min-h-[921px] flex items-center relative overflow-hidden rounded-b-[3rem] pb-section-gap pt-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-fixed/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        {/* Left Column: Text & CTA Content */}
        <div className="text-white space-y-8">
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-sm text-label-sm text-white/90 tracking-wider">ONE SCHOOL DAY. ONE CONNECTED STORY.</span>
          </div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-white leading-tight">
            A calmer day<br />
            for <span className="text-secondary-fixed glow-text">every child.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-white/80 max-w-xl">
            Gate entry, classroom attention, live bus tracking, and home-safe confirmation — linked in real time for parents, teachers, and school teams.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button type="button" className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-title-md text-title-md hover:bg-secondary-fixed hover:-translate-y-1 transition-all shadow-lg flex items-center gap-2 font-bold">
              Start your school story
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button type="button" className="glass-panel text-white px-8 py-4 rounded-full font-title-md text-title-md hover:bg-white/10 transition-all flex items-center gap-2 font-bold">
              Watch the school day
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="flex gap-6 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-fixed text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-sm text-label-sm text-white/70">Live school signals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-fixed text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-sm text-label-sm text-white/70">Built for Indian schools</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Energy Floating Ecosystem Interactive Hero Visual */}
        <div className="relative w-full h-[600px]">
          {/* Main Student Card Container */}
          <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <Image
              src="/shikshasetu-hero-student.png"
              alt="A high-quality photograph of a modern Indian student smiling confidently in a contemporary school hallway."
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Dark gradient overlay for bottom badge readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/20 pointer-events-none" />

            {/* Bottom Glassmorphism Bar: Live Status */}
            <div className="absolute bottom-5 left-5 right-5 glass-panel p-4 rounded-xl flex items-center justify-between border border-white/20 z-20 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-on-secondary-container">directions_bus</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-white/70">Live Status</p>
                  <p className="font-title-md text-title-md text-white font-bold">Arrived Safely at Campus</p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-white/60 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">Just now</span>
            </div>
          </div>

          {/* ──── FLOATING ECOSYSTEM NOTIFICATIONS ──── */}

          {/* 1. Live Bus Notification (Top Left) */}
          <div className="absolute -top-4 left-4 sm:-left-6 z-30 animate-float-slow">
            <div className="glass-panel-light backdrop-blur-xl bg-white/90 px-3.5 py-2.5 rounded-2xl shadow-2xl border border-amber-200/60 flex items-center gap-3 max-w-[210px] hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">directions_bus</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <p className="text-[11px] font-extrabold text-slate-900 leading-none">Live Bus GPS</p>
                </div>
                <p className="text-[9px] font-semibold text-slate-600 mt-0.5">Bus 04 &middot; 1.2 km away</p>
              </div>
            </div>
          </div>

          {/* 2. Attendance Confirmed (Top Right) */}
          <div className="absolute top-6 -right-3 sm:-right-6 z-30 animate-float-medium">
            <div className="glass-panel-light backdrop-blur-xl bg-white/90 px-3.5 py-2.5 rounded-2xl shadow-2xl border border-emerald-200/60 flex items-center gap-3 max-w-[215px] hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">verified</span>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-900 leading-none">Attendance Confirmed</p>
                <p className="text-[9px] font-semibold text-emerald-600 mt-0.5">✓ 08:14 AM &middot; Gate Scan</p>
              </div>
            </div>
          </div>

          {/* 3. Homework Assigned (Middle Left) */}
          <div className="absolute top-1/3 -left-5 sm:-left-8 z-30 animate-float-fast">
            <div className="glass-panel-light backdrop-blur-xl bg-white/90 px-3 py-2 rounded-2xl shadow-2xl border border-sky-200/60 flex items-center gap-2.5 max-w-[200px] hover:scale-105 transition-transform">
              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xs font-bold">assignment_turned_in</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-900 leading-none">Homework Assigned</p>
                <p className="text-[9px] font-semibold text-slate-600 mt-0.5">Math Ch 5 &middot; Submitted</p>
              </div>
            </div>
          </div>

          {/* 4. Parent Notified (Middle Right) */}
          <div className="absolute top-1/2 -right-4 sm:-right-8 z-30 animate-float-slow">
            <div className="glass-panel-light backdrop-blur-xl bg-white/90 px-3.5 py-2.5 rounded-2xl shadow-2xl border border-indigo-200/60 flex items-center gap-3 max-w-[210px] hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">family_restroom</span>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-900 leading-none">Parent Notified</p>
                <p className="text-[9px] font-semibold text-indigo-600 mt-0.5">SMS &amp; Push Delivered</p>
              </div>
            </div>
          </div>

          {/* 5. AI Insight (Lower Left) */}
          <div className="absolute bottom-24 left-6 z-30 animate-float-medium">
            <div className="glass-panel-light backdrop-blur-xl bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 max-w-[220px] hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wide">SchoolGPT AI</span>
                </div>
                <p className="text-[10px] font-bold text-white leading-tight">Attention Peak +18% Today</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
