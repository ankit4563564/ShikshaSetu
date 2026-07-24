'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EvidenceItem, EvidenceStatus } from '@/types';

/**
 * EvidenceCard — the signature UI component.
 *
 * Design contract (from cursorrules §4):
 * - Thin left-edge color bar in the current status color
 *   (sage = on-track, marigold = worth-watching, warm-clay = needs-attention)
 * - One-line plain-language headline (no jargon)
 * - A "Why?" tap target that expands (Framer Motion, ~250-300ms)
 *   to reveal 2-3 evidence bullets, collapses on second tap
 * - This is the ONE place animation budget goes
 *
 * Reuse this exact shape everywhere evidence/status is shown:
 * teacher dashboard, parent notifications, School Pulse PDF.
 */

const STATUS_BAR_COLOR: Record<EvidenceStatus, string> = {
  'on-track': 'var(--sage)',
  'worth-watching': 'var(--marigold)',
  'needs-attention': 'var(--warm-clay)',
};

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  'on-track': 'On Track',
  'worth-watching': 'Worth Watching',
  'needs-attention': 'Needs Attention',
};

const STATUS_BG: Record<EvidenceStatus, string> = {
  'on-track': 'bg-sage/10',
  'worth-watching': 'bg-marigold/10',
  'needs-attention': 'bg-warm-clay/10',
};

const STATUS_TEXT: Record<EvidenceStatus, string> = {
  'on-track': 'text-sage',
  'worth-watching': 'text-marigold',
  'needs-attention': 'text-warm-clay',
};

export type EvidenceCardProps = {
  item: EvidenceItem;
  onMarkFalsePositive?: () => void;
};

export function EvidenceCard({ item, onMarkFalsePositive }: EvidenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const barColor = STATUS_BAR_COLOR[item.status];

  return (
    <div
      className="relative flex overflow-hidden rounded-lg bg-white shadow-sm"
      style={{ borderLeft: `4px solid ${barColor}` }}
    >
      <div className="flex flex-1 flex-col px-4 py-3">
        {/* Status badge */}
        <div className="mb-1.5">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BG[item.status]} ${STATUS_TEXT[item.status]}`}
          >
            {STATUS_LABEL[item.status]}
          </span>
        </div>

        {/* Headline — one-line, plain language, no jargon */}
        <p className="font-body text-sm font-medium leading-snug text-deep-teal">
          {item.headline}
        </p>

        {/* "Why?" tap target + expandable bullets */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-2 flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-deep-teal/5"
          style={{ color: barColor }}
          aria-expanded={isExpanded}
          aria-controls={`evidence-bullets-${item.id}`}
        >
          Why?
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              id={`evidence-bullets-${item.id}`}
              role="region"
              aria-label="Evidence details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.27, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <ul className="mt-2 space-y-1.5 border-t border-deep-teal/10 pt-2.5">
                {item.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs leading-relaxed text-deep-teal/75"
                  >
                    <span
                      className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: barColor }}
                      aria-hidden="true"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>

              {onMarkFalsePositive && (
                <div className="mt-3 flex justify-end border-t border-deep-teal/10 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkFalsePositive();
                    }}
                    className="rounded-md border border-deep-teal/20 bg-deep-teal/5 px-2.5 py-1 text-[10px] font-semibold text-deep-teal hover:bg-deep-teal/10 hover:border-deep-teal/30 transition-all active:scale-95"
                  >
                    Mark as False Positive
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
