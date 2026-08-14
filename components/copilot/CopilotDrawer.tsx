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
import { getDemoIntervention } from '@/lib/copilot/interventionEngine';
import { CopilotCard } from './CopilotCard';
import { AIImpactWidget } from './AIImpactWidget';
import { InterventionTimeline } from './InterventionTimeline';

export function CopilotDrawer() {
  const [state, setState] = useState<CopilotState>(getCopilotState());
  const impactMetrics = getAIImpactMetrics();
  const demoIntervention = getDemoIntervention();

  useEffect(() => {
    const unsubscribe = subscribeCopilotState((newState) => setState(newState));

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
          className="absolute inset-0 bg-slate-950/30 backdrop-blur-md"
        />

        {/* Drawer Panel — premium glass */}
        <motion.div
          initial={{ x: '100%', opacity: 0.8 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
          className="absolute inset-y-0 right-0 max-w-2xl w-full flex flex-col"
          style={{
            background: 'linear-gradient(160deg, rgba(250,251,255,0.97) 0%, rgba(241,244,252,0.98) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(229,231,235,0.7)',
            boxShadow: '-20px 0 60px rgba(63,81,181,0.08), -4px 0 16px rgba(0,0,0,0.06)',
          }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E5E7EB]/80 bg-white/80 space-y-4 sticky top-0 z-10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center shadow-md">
                  <span className="text-lg">🧠</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-[#111827] tracking-tight">
                    ShikshaSetu Copilot
                  </h3>
                  <p className="text-[11px] font-mono font-medium text-[#0F766E] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Copilot prepares. Educators decide.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] font-bold hover:bg-slate-100 hover:text-[#111827] flex items-center justify-center transition-all text-sm"
                aria-label="Close Copilot"
              >
                ✕
              </button>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {(['teacher', 'parent', 'student', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCopilotRole(r)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                    state.activeRole === r
                      ? 'bg-[#111827] text-white border-[#111827] shadow-sm'
                      : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#D1D5DB]'
                  }`}
                >
                  {r === 'admin' ? 'Principal' : r.charAt(0).toUpperCase() + r.slice(1)} View
                </button>
              ))}
            </div>

            {/* Queue Status */}
            <div className="flex items-center gap-2 text-xs font-mono bg-[#F8FAFC] px-4 py-2.5 rounded-xl border border-[#E5E7EB]">
              <span className="text-[#6B7280]">Prepared: <span className="font-bold text-[#111827]">{state.reviewQueue.prepared}</span></span>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-amber-700 font-bold">Review: {state.reviewQueue.needsReview}</span>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-[#0F766E] font-bold">Approved: {state.reviewQueue.approved}</span>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-[#6B7280]">Edited: {state.reviewQueue.edited}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            <AIImpactWidget metrics={impactMetrics} />
            <InterventionTimeline intervention={demoIntervention} />

            <div className="space-y-3">
              <span className="text-[10px] font-mono font-extrabold text-[#6B7280] uppercase tracking-wider block">
                📋 Actions Ready for Review
              </span>
              {state.items.map((item) => (
                <CopilotCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E5E7EB]/80 bg-white/60 text-center text-[11px] font-mono text-[#9CA3AF]">
            Press{' '}
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-[#E5E7EB] font-bold text-[10px] text-[#374151]">
              Cmd + K
            </kbd>{' '}
            to toggle · <span className="text-[#0F766E] font-bold">Live</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
