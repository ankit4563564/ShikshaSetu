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
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 text-slate-800 shadow-lg backdrop-blur-xl border border-slate-200/80 text-xs font-bold select-none cursor-pointer"
          onClick={onToggle}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>✨ SchoolGPT Assistant</span>
        </motion.div>
      )}

      {/* Signature Floating Warm Glassmorphic AI Bubble */}
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ y: -3, scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          boxShadow: isOpen
            ? '0 0 0 0 rgba(99, 102, 241, 0)'
            : [
                '0 8px 24px rgba(99, 102, 241, 0.25)',
                '0 12px 32px rgba(168, 85, 247, 0.35)',
                '0 8px 24px rgba(99, 102, 241, 0.25)',
              ],
        }}
        transition={{
          boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-[2px] shadow-xl flex items-center justify-center cursor-pointer border border-white/60 active:scale-95 transition-all"
        aria-label="Open SchoolGPT Family Assistant"
      >
        <div className="h-full w-full rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-xl text-indigo-600 font-extrabold shadow-inner">
          {isOpen ? '✕' : '✨'}
        </div>
      </motion.button>
    </div>
  );
}
