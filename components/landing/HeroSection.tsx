import React from 'react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="hero-gradient min-h-[921px] flex items-center relative overflow-hidden rounded-b-[3rem] pb-section-gap pt-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-fixed/10 blur-[100px] pointer-events-none" />
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
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
        <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/shikshasetu-hero-student.png"
            alt="A high-quality, professional photograph of a modern Indian schoolgirl with a stylish backpack, smiling confidently in a sleek, contemporary school hallway with glass and wood accents."
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Glassmorphism Overlay Element */}
          <div className="absolute bottom-6 left-6 right-6 glass-panel p-4 rounded-xl flex items-center justify-between border border-white/20 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">directions_bus</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-white/70">Live Status</p>
                <p className="font-title-md text-title-md text-white font-bold">Arrived Safely</p>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-white/50">Just now</span>
          </div>
        </div>
      </div>
    </section>
  );
}
