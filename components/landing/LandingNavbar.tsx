import React from 'react';
import Link from 'next/link';

export function LandingNavbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center px-margin-mobile md:px-gutter max-w-container-max mx-auto h-20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="font-display-lg text-title-md font-extrabold text-primary">ShikshaSetu</span>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="#parents">Parents</a>
          <a className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="#schools">Schools</a>
          <a className="font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors" href="#features">Features</a>
        </nav>
        <div className="flex items-center gap-4">
          <button type="button" className="hidden md:block font-title-md text-title-md text-on-surface-variant hover:text-secondary transition-colors">
            Watch demo
          </button>
          <Link href="/parent-portal" className="bg-primary text-on-primary px-6 py-2 rounded-full font-title-md text-title-md hover:bg-primary-container transition-colors flex items-center gap-2">
            Enter portal
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
