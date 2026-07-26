'use client';

import React from 'react';
import Link from 'next/link';
import { useLandingModal } from './LandingModalContext';

export function LandingNavbar() {
  const { openRoleSelector, openDemoModal } = useLandingModal();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-gutter max-w-container-max mx-auto h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="font-display-lg text-title-md font-extrabold text-primary">ShikshaSetu</span>
        </Link>

        <nav className="hidden lg:flex gap-7 items-center font-bold text-xs">
          <Link className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5" href="/parent">
            👨‍👩‍👧 Parents
          </Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5" href="/teacher">
            👩‍🏫 Teachers
          </Link>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#school-story">
            Features
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1" href="#schoolgpt">
            ✨ SchoolGPT
          </a>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/pricing">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openDemoModal}
            className="hidden sm:block font-title-md text-xs text-on-surface-variant hover:text-primary transition-colors font-bold px-3 py-2"
          >
            Watch Demo
          </button>
          <button
            type="button"
            onClick={openRoleSelector}
            className="bg-primary text-on-primary px-5 py-2 rounded-full font-title-md text-xs hover:bg-primary-container transition-all hover:scale-105 flex items-center gap-1.5 font-bold shadow-md"
          >
            Enter Portal
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>
    </header>
  );
}
