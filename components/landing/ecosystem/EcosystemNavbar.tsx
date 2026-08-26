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
          : 'bg-[#FFF9F0] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Brand Logo with Blue + Amber Accent */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-display font-black text-white text-sm shadow-xs relative overflow-hidden">
            <span>S</span>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#F59E0B] rounded-tl-sm" />
          </div>
          <div>
            <span className="font-display text-lg font-black text-[#102A43] tracking-tight block leading-none">
              ShikshaSetu
            </span>
          </div>
        </Link>

        {/* Clean Center Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#102A43]/80">
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-[#2563EB] transition-colors">
            <a href="#product-showcase">Products</a>
            <span className="text-[10px] text-stone-400">▾</span>
          </div>
          <a href="#the-difference" className="hover:text-[#2563EB] transition-colors">
            Premium
          </a>
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-[#2563EB] transition-colors">
            <a href="#ai-intelligence">Resources</a>
            <span className="text-[10px] text-stone-400">▾</span>
          </div>
          <Link href="/pricing" className="hover:text-[#2563EB] transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-[#102A43] hover:text-[#2563EB] px-2 py-1.5 transition-colors"
          >
            Log in
          </Link>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openRoleSelector}
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>See ShikshaSetu</span>
            <span className="font-bold">&rarr;</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
