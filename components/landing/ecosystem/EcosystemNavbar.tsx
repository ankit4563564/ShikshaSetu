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
      className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200 shadow-xs py-3'
          : 'bg-[#FAF9F6] py-4 border-b border-stone-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-display font-black text-white text-sm shadow-xs">
            S
          </div>
          <div>
            <span className="font-display text-base font-black text-[#172033] tracking-tight block leading-none">
              ShikshaSetu
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">
              The Learning Ecosystem
            </span>
          </div>
        </Link>

        {/* Clean 4-Link Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#172033]/80">
          <a href="#the-difference" className="hover:text-[#2563EB] transition-colors">
            The Difference
          </a>
          <a href="#perspectives" className="hover:text-[#2563EB] transition-colors">
            Three Perspectives
          </a>
          <a href="#learning-loop" className="hover:text-[#2563EB] transition-colors">
            Learning Loop
          </a>
          <a href="#product-showcase" className="hover:text-[#2563EB] transition-colors">
            Product UI
          </a>
          <a href="#ai-intelligence" className="hover:text-[#2563EB] transition-colors">
            AI &amp; Capabilities
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="text-xs font-bold text-[#172033] hover:text-[#2563EB] px-3 py-2 rounded-lg hover:bg-stone-100 transition-all hidden sm:inline-block"
          >
            Sign In
          </Link>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openRoleSelector}
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Portals</span>
            <span className="font-bold">&rarr;</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
