'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoricalCase } from '@/lib/copilot/memoryEngine';

interface TrustPanelProps {
  signalsUsed: string[];
  signalsIgnored: string[];
  confidenceScore: number;
  reasoning: string;
  historicalEvidence?: HistoricalCase;
}

export function TrustPanel({
  signalsUsed,
  signalsIgnored,
  confidenceScore,
  reasoning,
  historicalEvidence,
}: TrustPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#E5E7EB] rounded-2xl bg-[#F8FAFC] overflow-hidden transition-all">
      {/* Toggle Button Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="trust-panel-evidence"
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F1F5F9] transition-colors focus-visible:ring-2 focus-visible:ring-[#0F766E] outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-extrabold text-[#0F766E] uppercase tracking-wider flex items-center gap-1">
            <span>🧠</span> Why did Copilot recommend this?
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F4FBF7] text-[#0F766E] border border-[#22C55E]/30">
            Confidence: {confidenceScore}%
          </span>
        </div>
        <span className="text-xs font-bold text-[#6B7280]">
          {isOpen ? 'Hide Evidence ▲' : 'View Evidence ▼'}
        </span>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="trust-panel-evidence"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 border-t border-[#E5E7EB] space-y-4 pt-3 text-xs"
          >
            {/* Reasoning Explanation */}
            <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
                Copilot Reasoning
              </span>
              <p className="text-xs text-[#111827] font-medium leading-relaxed">
                {reasoning}
              </p>
            </div>

            {/* Signals Used vs Ignored */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Signals Used */}
              <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-[#22C55E] uppercase tracking-wider block">
                  ✓ Signals Used
                </span>
                <ul className="space-y-1 text-[11px] text-[#111827] font-medium">
                  {signalsUsed.map((sig) => (
                    <li key={sig} className="flex items-center gap-1.5">
                      <span className="text-[#22C55E]">•</span> {sig}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Signals Ignored */}
              <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
                  • Signals Ignored / Unavailable
                </span>
                <ul className="space-y-1 text-[11px] text-[#6B7280] font-medium">
                  {signalsIgnored.length > 0 ? (
                    signalsIgnored.map((sig) => (
                      <li key={sig} className="flex items-center gap-1.5">
                        <span>◦</span> {sig}
                      </li>
                    ))
                  ) : (
                    <li className="italic">None (Full telemetry used)</li>
                  )}
                </ul>
              </div>
            </div>

            {/* School Memory Historical Evidence (28 Similar Cases) */}
            {historicalEvidence && (
              <div className="p-3.5 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold text-[#0F766E] uppercase tracking-wider">
                    🏛️ School Memory Evidence ({historicalEvidence.count} Similar Past Cases)
                  </span>
                  <span className="text-[10px] font-bold text-[#22C55E]">
                    {historicalEvidence.interventions[0].successRate}% Success Rate
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#111827]">
                  {historicalEvidence.pattern}
                </p>
                <div className="text-[11px] text-[#0F766E] font-medium border-t border-[#22C55E]/20 pt-2">
                  <span className="font-bold">Recommended Approach:</span> {historicalEvidence.recommendedApproach}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
