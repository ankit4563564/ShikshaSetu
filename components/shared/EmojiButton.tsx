'use client';

import { motion } from 'framer-motion';

interface EmojiButtonProps {
  emoji: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function EmojiButton({ emoji, label, selected = false, disabled = false, onClick }: EmojiButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      className={`pressable flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-deep-teal/30 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        selected
          ? 'border-deep-teal/30 bg-deep-teal/[0.04] shadow-sm'
          : 'border-deep-teal/10 hover:border-deep-teal/30 hover:bg-deep-teal/[0.02]'
      }`}
    >
      <motion.span
        className="text-2xl mb-1 block"
        animate={selected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {emoji}
      </motion.span>
      <span className="text-[9px] font-bold text-deep-teal/50 leading-none">{label}</span>
    </motion.button>
  );
}
