'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';
import { TrustPanel } from './TrustPanel';

const THINKING_STEPS = [
  { label: 'Analyzing Attendance Records', duration: 500 },
  { label: 'Analyzing Homework History', duration: 600 },
  { label: 'Analyzing Teacher Notes', duration: 500 },
  { label: 'Searching School Memory', duration: 700 },
  { label: 'Matching Historical Cases', duration: 600 },
  { label: 'Calculating Confidence Score', duration: 400 },
  { label: 'Preparing Recommendations', duration: 500 },
];

interface TeacherCopilotStripProps {
  skipThinking?: boolean;
}

export function TeacherCopilotStrip({ skipThinking = false }: TeacherCopilotStripProps = {}) {
  const [state, setState] = useState(getCopilotState());
  const [thinkingStep, setThinkingStep] = useState(skipThinking ? THINKING_STEPS.length : 0);
  const [thinkingDone, setThinkingDone] = useState(skipThinking);
  const thinkingStarted = useRef(skipThinking);

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  // Copilot thinking animation on mount
  useEffect(() => {
    if (thinkingStarted.current) return;
    thinkingStarted.current = true;

    let elapsed = 0;
    THINKING_STEPS.forEach((step, idx) => {
      setTimeout(() => {
        setThinkingStep(idx + 1);
        if (idx === THINKING_STEPS.length - 1) {
          setTimeout(() => setThinkingDone(true), 400);
        }
      }, elapsed);
      elapsed += step.duration;
    });
  }, []);

  const item = state.items.find((i) => i.id === 'act_001') || state.items[0];
  const isApproved = item.status === 'approved';
  const totalThinkTime = THINKING_STEPS.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-4">
      {/* ── Copilot Thinking Animation ── */}
      <AnimatePresence mode="wait">
        {!thinkingDone ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="p-4 rounded-2xl bg-slate-950/60 border border-teal-800/40 space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] font-display font-bold text-teal-300 tracking-tight">
                ✨ Copilot Analyzing Telemetry...
              </span>
            </div>

            <div className="space-y-1.5">
              {THINKING_STEPS.map((step, idx) => {
                const isDone = idx < thinkingStep;
                const isActive = idx === thinkingStep - 1;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                    className="flex items-center gap-2 text-[11px]"
                  >
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${isDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-teal-700 text-white animate-pulse' : 'bg-slate-800 text-slate-600'}`}>
                      {isDone ? '✓' : isActive ? '●' : '○'}
                    </span>
                    <span className={isDone ? 'text-emerald-400' : isActive ? 'text-teal-300' : 'text-slate-600'}>
                      {step.label}
                      {isActive && (
                        <span className="ml-1 text-teal-500">
                          {'...'.slice(0, (Date.now() % 600 < 200 ? 1 : Date.now() % 600 < 400 ? 2 : 3))}
                        </span>
                      )}
                    </span>
                    {isDone && idx === THINKING_STEPS.indexOf(THINKING_STEPS.find(s => s.label === 'Calculating Confidence Score')!) && (
                      <span className="ml-auto text-[9px] font-mono font-bold text-emerald-400">92%</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                animate={{ width: `${(thinkingStep / THINKING_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-400"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={skipThinking ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Primary Action Header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  {item.studentName}: {item.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  1 action requiring your approval · Est. 11 mins saved
                </p>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  isApproved
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                    : 'bg-amber-950/60 text-amber-300 border-amber-700'
                }`}
              >
                {isApproved ? '✓ Approved & Syncing' : 'Needs Review'}
              </span>
            </div>

            {/* Signals Detected */}
            <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-1.5 text-xs">
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                ⚠ Signals Flagged
              </span>
              <ul className="space-y-1 text-slate-300 font-medium">
                {item.whyFlagged.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0 mt-px">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prepared Intervention */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-1.5 text-xs">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                ✦ Prepared Intervention Package
              </span>
              <ul className="space-y-1.5 text-slate-300 font-medium">
                {item.preparedActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0 mt-px">✓</span>
                    <div>
                      <span className="font-bold text-slate-200">{a.label}:</span>{' '}
                      <span className="text-slate-400">{a.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expected Outcome */}
            <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-800/40 space-y-1 text-xs">
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block">
                Expected Outcome
              </span>
              <p className="text-slate-300 font-medium leading-relaxed">
                Parent informed today, targeted practice sheet assigned, and teacher check-in scheduled before Friday assessment.
              </p>
            </div>

            {/* Trust Panel */}
            <TrustPanel
              signalsUsed={item.trustSignals.used}
              signalsIgnored={item.trustSignals.ignored}
              confidenceScore={item.confidenceScore}
              reasoning={item.trustSignals.reasoning}
              historicalEvidence={{
                id: 'h1',
                pattern: item.trustSignals.reasoning,
                count: item.historicalEvidence.casesCount,
                interventions: [
                  { name: 'Parent Message + Teacher Check-in', successRate: item.historicalEvidence.successRate, description: '' },
                ],
                recommendedApproach: item.historicalEvidence.recommendedApproach,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
