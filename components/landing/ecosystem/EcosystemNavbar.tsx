'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLandingModal } from '../LandingModalContext';
import { motion } from 'framer-motion';

export function EcosystemNavbar() {
  const { openRoleSelector } = useLandingModal();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-xs py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 flex items-center justify-center font-display font-black text-white text-base shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <span className="font-display text-lg font-black text-slate-900 tracking-tight block leading-none">
              ShikshaSetu
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              Learning Ecosystem
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-black text-slate-600">
          <a href="#the-difference" className="hover:text-indigo-600 transition-colors">
            The Difference
          </a>
          <a href="#learning-loop" className="hover:text-indigo-600 transition-colors">
            Learning Loop
          </a>
          <a href="#perspectives" className="hover:text-indigo-600 transition-colors">
            3 Perspectives
          </a>
          <a href="#ai-intelligence" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <span className="text-indigo-600">✨</span> AI Ecosystem
          </a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">
            Features
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-black text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100/80 transition-all hidden sm:inline-block"
          >
            Sign In
          </Link>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openRoleSelector}
            className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md shadow-indigo-950/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Portals</span>
            <span className="text-indigo-400 font-bold">&rarr;</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
