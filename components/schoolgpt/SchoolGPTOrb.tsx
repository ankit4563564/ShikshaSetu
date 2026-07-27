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
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white text-[#111827] shadow-md border border-[#E5E7EB] text-xs font-extrabold select-none cursor-pointer"
          onClick={onToggle}
        >
          <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span>✨ SchoolGPT Assistant</span>
        </motion.div>
      )}

      {/* Floating Apple Intelligence Light AI Bubble */}
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ y: -3, scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          boxShadow: isOpen
            ? '0 0 0 0 rgba(15, 118, 110, 0)'
            : [
                '0 8px 24px rgba(15, 118, 110, 0.20)',
                '0 12px 32px rgba(244, 185, 66, 0.25)',
                '0 8px 24px rgba(15, 118, 110, 0.20)',
              ],
        }}
        transition={{
          boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-[#0F766E] via-[#14b8a6] to-[#F4B942] p-[2px] shadow-lg flex items-center justify-center cursor-pointer border border-white active:scale-95 transition-all"
        aria-label="Open SchoolGPT Assistant"
      >
        <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-xl text-[#0F766E] font-extrabold shadow-xs">
          {isOpen ? '✕' : '✨'}
        </div>
      </motion.button>
    </div>
  );
}
