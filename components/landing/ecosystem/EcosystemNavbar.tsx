'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLandingModal } from '../LandingModalContext';
import { motion } from 'framer-motion';

export function EcosystemNavbar() {
  const { openRoleSelector } = useLandingModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#102A43]/85">
          <a href="#product-showcase" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
            <span>Products</span>
            <span className="text-[10px] text-stone-400">▾</span>
          </a>
          <a href="#the-difference" className="hover:text-[#2563EB] transition-colors">
            The Difference
          </a>
          <a href="#ai-intelligence" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
            <span>Intelligence</span>
            <span className="text-[10px] text-stone-400">▾</span>
          </a>
          <Link href="/pricing" className="hover:text-[#2563EB] transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-[#102A43] hover:text-[#2563EB] px-2 py-1.5 transition-colors hidden sm:inline-block"
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

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#102A43] hover:bg-stone-100"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF9F0] border-b border-[#102A43]/10 px-4 pt-2 pb-4 space-y-2 text-xs font-bold text-[#102A43]">
          <a
            href="#product-showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-[#2563EB]"
          >
            Products
          </a>
          <a
            href="#the-difference"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-[#2563EB]"
          >
            The Difference
          </a>
          <a
            href="#perspectives"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-[#2563EB]"
          >
            Three Perspectives
          </a>
          <a
            href="#learning-loop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-[#2563EB]"
          >
            Learning Loop
          </a>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#2563EB]"
          >
            Log in to Portal &rarr;
          </Link>
        </div>
      )}
    </header>
  );
}
