'use client';

import React from 'react';
import Link from 'next/link';
import { useLandingModal } from './LandingModalContext';

export function LandingNavbar() {
  const { openRoleSelector, openDemoModal } = useLandingModal();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center px-margin-mobile md:px-gutter max-w-container-max mx-auto h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="font-display-lg text-title-md font-extrabold text-primary">ShikshaSetu</span>
        </Link>

        <nav className="hidden md:flex gap-8 items-center font-bold">
          <a className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="#parents">Parents</a>
          <a className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="#schools">Schools</a>
          <a className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="#features">Features</a>
          <a className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="#schoolgpt">SchoolGPT</a>
          <Link className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="/pricing">Pricing</Link>
          <Link className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="/resources">Resources</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openDemoModal}
            className="hidden md:block font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors font-bold"
          >
            Watch demo
          </button>
          <button
            type="button"
            onClick={openRoleSelector}
            className="bg-primary text-on-primary px-6 py-2 rounded-full font-title-md text-title-md hover:bg-primary-container transition-all hover:scale-105 flex items-center gap-2 font-bold shadow-md"
          >
            Enter portal
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </header>
  );
}
