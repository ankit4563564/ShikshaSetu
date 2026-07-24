'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ParentMorningNoteProps {
  studentId: string;
  studentName: string;
  tone: 'positive' | 'neutral' | 'concern';
  statusLabel: string;
  headline: string;
  bullets: string[];
  isWhyExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  isLoading?: boolean;
}

export function ParentMorningNote({
  studentId,
  studentName,
  tone,
  statusLabel,
  headline,
  bullets,
  isWhyExpanded,
  onExpandChange,
  isLoading = false,
}: ParentMorningNoteProps) {
  const toneColor = 
    tone === 'positive' ? '#6b9080' :
    tone === 'neutral' ? '#e8a33d' :
    '#c1502e';

  return (
    <div
      className={`relative flex overflow-hidden rounded-2xl bg-white border border-deep-teal/10 hover:shadow-md transition-all duration-200 shadow-xs ${
        tone === 'positive' ? 'border-t-sage/40 border-t-2' :
        tone === 'neutral' ? 'border-t-marigold/40 border-t-2' :
        'border-t-warm-clay/40 border-t-2'
      }`}
    >
      <div className="flex flex-1 flex-col p-6 space-y-4">
        {/* Top section with status badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white border border-deep-teal/5">
              <span className={`h-1.5 w-1.5 rounded-full ${
                tone === 'positive' ? 'bg-sage' :
                tone === 'neutral' ? 'bg-marigold' :
                'bg-warm-clay'
              }`} />
            </span>
            <span className="font-display text-[9px] font-extrabold uppercase tracking-widest text-deep-teal/40">
              {statusLabel}
            </span>
          </div>
          <span className="text-[10px] text-deep-teal/40 font-medium">Academic Note</span>
        </div>

        {/* Headline & Description */}
        <div className="space-y-1">
          <h3 className="font-display text-2xl font-bold text-deep-teal tracking-tight">
            {headline}
          </h3>
        </div>

        {/* Why Drawer Container */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onExpandChange(!isWhyExpanded)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all border border-deep-teal/5 hover:bg-deep-teal/[0.02] disabled:opacity-50"
            style={{ color: toneColor }}
          >
            <span>Show Details</span>
            <svg
              className={`w-3 h-3 transition-transform duration-250 ${isWhyExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence initial={false}>
            {isWhyExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <ul className="mt-3 space-y-3 border-t border-deep-teal/5 pt-3">
                  {bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 font-body text-xs text-deep-teal/70 leading-relaxed">
                      <span
                        className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: toneColor }}
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
