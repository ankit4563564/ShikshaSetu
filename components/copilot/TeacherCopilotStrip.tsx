'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';
import { TrustPanel } from './TrustPanel';

const THINKING_STEPS = [
  { label: 'Analyzing Attendance Records', duration: 500 },
  { label: 'Analyzing Homework History', duration: 600 },
  { label: 'Analyzing Teacher Notes', duration: 500 },
  { label: 'Checking School Memory', duration: 700 },
  { label: 'Reviewing Historical Patterns', duration: 600 },
  { label: 'Preparing Support Options', duration: 500 },
];

interface TeacherCopilotStripProps {
  skipThinking?: boolean;
  onOpenMemory?: () => void;
}

export function TeacherCopilotStrip({ skipThinking = false, onOpenMemory }: TeacherCopilotStripProps = {}) {
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

  return (
    <div className="space-y-3.5">
      {/* ── Copilot Thinking Animation ── */}
      <AnimatePresence mode="wait">
        {!thinkingDone ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="p-4 rounded-2xl bg-slate-900/60 space-y-3"
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
                    </span>
                    {isDone && idx === 5 && (
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
            className="space-y-3.5"
          >
            {/* Primary Action Header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-extrabold text-sm text-white tracking-tight">
                  Aarav Sharma may need additional support this week
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  1 recommendation drafted for your review · Est. 11 mins saved
                </p>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  isApproved
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isApproved ? '✓ Support Active' : 'Needs Review'}
              </span>
            </div>

            {/* Reassuring Needs Attention Section (whitespace elevated, no inner border clutter) */}
            <div className="p-4 rounded-2xl bg-slate-900/60 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-amber-300 font-display">Needs Attention</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 font-medium pl-3.5">
                <li className="list-disc marker:text-amber-400">Missed 3 math homework sets this week</li>
                <li className="list-disc marker:text-amber-400">Classroom attendance dipped slightly from 96% to 89%</li>
                <li className="list-disc marker:text-amber-400">Teacher noted reduced participation in fraction problem-solving</li>
              </ul>
            </div>

            {/* Prepared Support Plan Section */}
            <div className="p-4 rounded-2xl bg-slate-900/60 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 font-display">Prepared Support Plan</span>
              </div>
              <div className="space-y-2 text-slate-300 font-medium">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <span className="font-bold text-white">Parent WhatsApp Update:</span>{' '}
                    <span className="text-slate-300">"Hi Priya, Aarav missed homework for 3 days. Practice sheet assigned."</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <span className="font-bold text-white">Targeted Practice:</span>{' '}
                    <span className="text-slate-300">Algebra Practice Sheet B auto-assigned to Aarav's student portal.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <span className="font-bold text-white">Teacher Advisory Check-in:</span>{' '}
                    <span className="text-slate-300">Scheduled for tomorrow 10:15 AM advisory slot.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens After Approval */}
            <div className="p-3.5 rounded-2xl bg-slate-900/40 space-y-1 text-xs">
              <span className="text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider block">
                What happens after approval
              </span>
              <p className="text-slate-300 font-medium leading-relaxed">
                Parent informed via WhatsApp, practice sheet added to Aarav's roadmap, and check-in logged before Friday assessment.
              </p>
            </div>

            {/* Trust Panel */}
            <TrustPanel
              signalsUsed={item.trustSignals.used}
              signalsIgnored={item.trustSignals.ignored}
              confidenceScore={item.confidenceScore}
              reasoning={item.trustSignals.reasoning}
              onOpenMemory={onOpenMemory}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
