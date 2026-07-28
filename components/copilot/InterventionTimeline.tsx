'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SupportIntervention } from '@/lib/copilot/interventionEngine';

interface InterventionTimelineProps {
  intervention: SupportIntervention;
}

export function InterventionTimeline({ intervention }: InterventionTimelineProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB]/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⏳</span>
          <div>
            <h4 className="font-extrabold text-xs text-[#111827]">
              Living Intervention Lifecycle · {intervention.studentName}
            </h4>
            <p className="text-[10px] font-medium text-[#6B7280]">
              {intervention.flagTitle}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#F4FBF7] text-[#0F766E] border border-[#22C55E]/30">
          ⏱️ {intervention.timeSavedMinutes}m Saved
        </span>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-2.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7EB]">
        {intervention.milestones.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.2 }}
            className="flex items-start gap-3 relative z-10"
          >
            {/* Icon */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                m.status === 'completed'
                  ? 'bg-[#22C55E] text-white'
                  : m.status === 'current'
                  ? 'bg-[#0F766E] text-white animate-pulse'
                  : 'bg-slate-100 text-[#9CA3AF] border border-[#E5E7EB]'
              }`}
            >
              {m.status === 'completed' ? '✓' : m.status === 'current' ? '●' : '○'}
            </div>

            {/* Details */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs text-[#111827]">{m.title}</span>
                <span className="text-[9px] font-mono text-[#9CA3AF] shrink-0">{m.timestamp}</span>
              </div>
              <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Actor: {m.actor}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Outcome */}
      {intervention.outcomeSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-2 border-t border-[#E5E7EB] text-center text-xs font-mono font-bold text-[#0F766E]"
        >
          🎉 {intervention.outcomeSummary}
        </motion.div>
      )}
    </div>
  );
}
