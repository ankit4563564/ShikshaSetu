'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface OrbProps {
  isOpen: boolean;
  onToggle: () => void;
  screenName?: string;
}

export default function SchoolGPTOrb({ isOpen, onToggle }: OrbProps) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5">
      {/* Tooltip Badge */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white text-[#102A43] shadow-[0_4px_16px_rgba(16,42,67,0.08)] border border-stone-200 text-xs font-bold select-none cursor-pointer"
          onClick={onToggle}
        >
          <span className="h-2 w-2 rounded-full bg-[#16A085]" />
          <span>✨ SchoolMitra</span>
        </motion.div>
      )}

      {/* Floating Button */}
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="h-12 w-12 sm:h-13 sm:w-13 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-[0_6px_20px_rgba(37,99,235,0.35)] flex items-center justify-center text-lg font-bold cursor-pointer transition-all border border-white/20"
        aria-label="Open SchoolMitra Assistant"
      >
        {isOpen ? '✕' : '✨'}
      </motion.button>
    </div>
  );
}
