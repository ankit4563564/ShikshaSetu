'use client';

import React from 'react';
import Link from 'next/link';
import { useLandingModal } from './LandingModalContext';

export function CTASection() {
  const { openRoleSelector } = useLandingModal();

  return (
    <section className="py-section-gap bg-textured pb-32">
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-gutter">
        <div className="bg-primary rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative Background Elements */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: "url('/shikshasetu_banner.png')" }}
          />
          <div className="absolute -top-[50%] -left-[20%] w-[70%] h-[100%] rounded-full bg-primary-fixed/20 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 glass-panel-light border-white/20 px-4 py-1.5 rounded-full">
              <span className="font-label-sm text-label-sm text-on-surface tracking-wider font-bold">SEE IT IN ACTION</span>
            </div>
            <h2 className="font-display-lg text-headline-lg md:text-display-lg text-white">
              Walk a full school day in seven minutes.
            </h2>
            <p className="font-body-lg text-body-lg text-white/90 max-w-xl mx-auto font-medium">
              Experience the live animated story, or step into any role portal and follow the same chain from gate to home.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <a
                href="#school-story"
                className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-title-md text-title-md hover:bg-secondary-fixed hover:-translate-y-1 transition-all shadow-lg font-bold hover:scale-105 inline-flex items-center gap-2"
              >
                Start your school story →
              </a>
              <button
                type="button"
                onClick={openRoleSelector}
                className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-full font-title-md text-title-md hover:bg-white/20 transition-all font-bold hover:scale-105"
              >
                Enter a portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
