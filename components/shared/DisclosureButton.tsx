'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface DisclosureButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  color?: string;
  label?: string;
}

export function DisclosureButton({
  isExpanded,
  onToggle,
  children,
  className = '',
  color = 'var(--sage)',
  label,
}: DisclosureButtonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={label || (isExpanded ? 'Collapse details' : 'Expand details')}
        className="pressable inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-150 border border-deep-teal/5 hover:bg-deep-teal/[0.02] focus-visible:outline-2 focus-visible:outline-deep-teal/30 focus-visible:outline-offset-2"
        style={{ color }}
      >
        <span>{children}</span>
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="w-3 h-3 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
