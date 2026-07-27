'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCopilotState,
  subscribeCopilotState,
  setDrawerOpen,
  setCopilotRole,
  CopilotState,
} from '@/lib/copilot/copilotEngine';
import { getAIImpactMetrics } from '@/lib/copilot/impactEngine';
import { CopilotCard } from './CopilotCard';
import { AIImpactWidget } from './AIImpactWidget';
import { InterventionTimeline } from './InterventionTimeline';

export function CopilotDrawer() {
  const [state, setState] = useState<CopilotState>(getCopilotState());
  const impactMetrics = getAIImpactMetrics();

  useEffect(() => {
    const unsubscribe = subscribeCopilotState((newState) => {
      setState(newState);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setDrawerOpen(!getCopilotState().isDrawerOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!state.isDrawerOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDrawerOpen(false)}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute inset-y-0 right-0 max-w-2xl w-full bg-[#FAFBFF] shadow-2xl border-l border-[#E5E7EB] flex flex-col justify-between overflow-y-auto"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E5E7EB] bg-white space-y-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/30">🧠</span>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-[#111827]">
                    ShikshaSetu Copilot
                  </h3>
                  <p className="text-xs font-mono font-medium text-[#0F766E]">
                    Copilot prepares. Educators decide.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] font-bold hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(['teacher', 'parent', 'student', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCopilotRole(r)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                    state.activeRole === r
                      ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                      : 'bg-[#F8FAFC] text-[#6B7280] border-[#E5E7EB] hover:bg-white'
                  }`}
                >
                  {r === 'admin' ? 'Principal View' : `${r} View`}
                </button>
              ))}
            </div>

            {/* Review Queue Status Bar */}
            <div className="flex items-center justify-between text-xs font-mono bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB]">
              <span>Prepared: {state.reviewQueue.prepared}</span>
              <span className="text-amber-700 font-bold">Needs Review: {state.reviewQueue.needsReview}</span>
              <span className="text-[#0F766E] font-bold">Approved: {state.reviewQueue.approved}</span>
              <span>Edited: {state.reviewQueue.edited}</span>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Today's AI Impact Widget */}
            <AIImpactWidget metrics={impactMetrics} />

            {/* Living Support Intervention Lifecycle */}
            <InterventionTimeline intervention={state.activeIntervention} />

            {/* Prepared Action Cards List */}
            <div className="space-y-4">
              <span className="text-xs font-mono font-extrabold text-[#6B7280] uppercase tracking-wider block">
                📋 Prepared Actions Ready for Review:
              </span>
              {state.items.map((item) => (
                <CopilotCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#E5E7EB] bg-white text-center text-xs font-mono text-[#6B7280]">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-[#E5E7EB] font-bold">Cmd + K</kbd> to toggle anytime</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
