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
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#FFF9F0]/95 backdrop-blur-md border-b border-[#102A43]/10 shadow-[0_4px_20px_rgba(16,42,67,0.06)] py-3'
          : 'bg-[#FFF9F0] py-4 border-b border-[#102A43]/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Brand Logo with Blue + Amber Mark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-display font-black text-white text-sm shadow-xs relative overflow-hidden">
            <span>S</span>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#F59E0B] rounded-tl-sm" />
          </div>
          <div>
            <span className="font-display text-base font-black text-[#102A43] tracking-tight block leading-none">
              ShikshaSetu
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#102A43]/60">
              The Learning Ecosystem
            </span>
          </div>
        </Link>

        {/* Clean Deep Ink Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#102A43]/80">
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
            Intelligence
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="text-xs font-bold text-[#102A43] hover:text-[#2563EB] px-3 py-2 rounded-lg hover:bg-black/5 transition-all hidden sm:inline-block"
          >
            Sign In
          </Link>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openRoleSelector}
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Portals</span>
            <span className="font-bold">&rarr;</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
