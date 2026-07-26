'use client';

import { motion } from 'framer-motion';

interface OrbProps {
  isOpen: boolean;
  onToggle: () => void;
  screenName?: string;
}

export default function SchoolGPTOrb({ isOpen, onToggle, screenName = 'ShikshaSetu' }: OrbProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip Badge */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 text-white shadow-xl backdrop-blur-xl border border-slate-700 text-xs font-extrabold select-none cursor-pointer"
          onClick={onToggle}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>✨ SchoolGPT AI OS ({screenName})</span>
        </motion.div>
      )}

      {/* Signature Floating Glassmorphic AI Orb */}
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          y: [0, -4, 0],
          boxShadow: isOpen
            ? '0 0 0 0 rgba(16, 185, 129, 0)'
            : [
                '0 10px 30px rgba(16, 185, 129, 0.3)',
                '0 15px 40px rgba(16, 185, 129, 0.5)',
                '0 10px 30px rgba(16, 185, 129, 0.3)',
              ],
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-slate-900 via-teal-900 to-emerald-600 p-[2px] shadow-2xl flex items-center justify-center cursor-pointer border border-emerald-400/40"
        aria-label="Open SchoolGPT AI Operating System"
      >
        <div className="h-full w-full rounded-full bg-slate-950/80 backdrop-blur-xl flex items-center justify-center text-xl text-white font-black shadow-inner">
          {isOpen ? '✕' : '✨'}
        </div>
      </motion.button>
    </div>
  );
}
