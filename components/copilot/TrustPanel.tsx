'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoricalCase } from '@/lib/copilot/memoryEngine';

interface TrustPanelProps {
  signalsUsed: string[];
  signalsIgnored: string[];
  confidenceScore: number;
  reasoning: string;
  historicalEvidence?: HistoricalCase;
  onOpenMemory?: () => void;
}

const MEMORY_TIMELINE = [
  { month: 'September', type: 'warning' as const, events: ['Algebra homework declined 3 days', 'Grade dropped: A → B+'] },
  { month: 'October', type: 'recovery' as const, events: ['Teacher check-in triggered', 'Targeted worksheet assigned', 'Homework fully recovered'] },
  { month: 'November', type: 'warning' as const, events: ['Exam week — attendance dipped', 'SchoolGPT early flag triggered'] },
  { month: 'December', type: 'recovery' as const, events: ['PTM meeting scheduled', 'Attendance recovered', 'End-of-term: A grade restored'] },
  { month: 'Today', type: 'today' as const, events: ['Pattern matches previous cases', '28 similar cases found', 'Confidence: 92%'] },
];

export function TrustPanel({
  signalsUsed,
  signalsIgnored,
  confidenceScore,
  reasoning,
  historicalEvidence,
  onOpenMemory,
}: TrustPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [memoryStep, setMemoryStep] = useState(0);

  const handleOpenTimeline = () => {
    if (onOpenMemory) {
      onOpenMemory();
    } else {
      setShowMemoryPanel(true);
    }
  };

  useEffect(() => {
    if (showMemoryPanel) {
      setMemoryStep(0);
      MEMORY_TIMELINE.forEach((_, idx) => {
        setTimeout(() => setMemoryStep(idx + 1), idx * 450 + 250);
      });
    }
  }, [showMemoryPanel]);

  const typeStyles = {
    warning: { ring: 'bg-amber-700', bg: 'bg-amber-950/40 border-amber-800/50', text: 'text-amber-400', dot: '!' },
    recovery: { ring: 'bg-emerald-700', bg: 'bg-emerald-950/30 border-emerald-800/40', text: 'text-emerald-400', dot: '↑' },
    today: { ring: 'bg-purple-600', bg: 'bg-purple-950/40 border-purple-800/50', text: 'text-purple-400', dot: '★' },
  };

  return (
    <>
      <div className="rounded-2xl bg-slate-900/60 overflow-hidden">
        {/* Toggle Header */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-900/80 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 outline-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-bold text-teal-300 flex items-center gap-1.5">
              <span>🧠</span> Why did Copilot recommend this?
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {confidenceScore}% confidence
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="px-4 pb-4 pt-3 space-y-3.5 text-xs">
                {/* Reasoning */}
                <div className="p-3 rounded-xl bg-slate-950/50">
                  <span className="text-[10px] font-display font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Copilot Reasoning
                  </span>
                  <p className="text-slate-300 font-medium leading-relaxed">{reasoning}</p>
                </div>

                {/* Signals Used */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/50">
                    <span className="text-[10px] font-display font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                      ✓ Signals Used
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {signalsUsed.map((sig) => (
                        <li key={sig} className="flex items-center gap-1.5">
                          <span className="text-emerald-400 shrink-0">•</span> {sig}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50">
                    <span className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      ◦ Signals Ignored
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-500">
                      {signalsIgnored.length > 0 ? (
                        signalsIgnored.map((sig) => (
                          <li key={sig} className="flex items-center gap-1.5">
                            <span className="shrink-0">◦</span> {sig}
                          </li>
                        ))
                      ) : (
                        <li className="italic text-slate-500">None — full telemetry used</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Historical Evidence */}
                {historicalEvidence && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-display font-extrabold text-purple-300 uppercase tracking-wider">
                        🏛️ School Memory ({historicalEvidence.count} Similar Cases)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">
                        {historicalEvidence.interventions[0]?.successRate}% Success Rate
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold">{historicalEvidence.pattern}</p>
                    <div className="mt-2 pt-2 border-t border-purple-500/20 flex items-center justify-between">
                      <p className="text-[10px] text-purple-300">
                        <span className="font-bold">Recommended:</span> {historicalEvidence.recommendedApproach}
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenTimeline}
                        className="text-[10px] font-display font-bold text-purple-300 hover:text-purple-100 underline underline-offset-2 transition-colors ml-2 shrink-0"
                      >
                        View Timeline →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── School Memory Side Panel ── */}
      <AnimatePresence>
        {showMemoryPanel && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemoryPanel(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md bg-[#0D1117] border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Panel Header */}
              <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 to-slate-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-display font-bold text-purple-400 uppercase tracking-wider">
                      🏛️ School Memory Flagship
                    </span>
                    <h3 className="font-display text-lg font-extrabold text-white mt-0.5">Historical Intervention Timeline</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Aarav Sharma · Class 8A · Academic Year</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMemoryPanel(false)}
                    className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                {/* Confidence bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Confidence Score</span>
                    <span className="text-emerald-400 font-bold">92%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>28 historical cases matched</span>
                    <span className="text-purple-400">94% success rate</span>
                  </div>
                </div>
              </div>

              {/* Timeline Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">
                  Historical Pattern — This School Year
                </p>

                <div className="relative space-y-4 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                  {MEMORY_TIMELINE.map((entry, idx) => {
                    const s = typeStyles[entry.type];
                    return (
                      <AnimatePresence key={entry.month}>
                        {idx < memoryStep && (
                          <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="flex gap-4 relative z-10"
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white mt-0.5 ${s.ring}`}>
                              {s.dot}
                            </div>
                            <div className={`flex-1 p-3.5 rounded-2xl border space-y-1.5 ${s.bg}`}>
                              <span className={`text-[10px] font-display font-extrabold uppercase tracking-wider ${s.text}`}>
                                {entry.month}
                              </span>
                              {entry.events.map((ev, ei) => (
                                <p key={ei} className="text-[11px] text-slate-300 leading-snug">{ev}</p>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
