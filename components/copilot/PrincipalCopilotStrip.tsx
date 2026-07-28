'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';

export function PrincipalCopilotStrip() {
  const [state, setState] = useState(getCopilotState());

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const aaravAction = state.items.find((i) => i.id === 'act_001');
  const isApproved = aaravAction?.status === 'approved';

  const alerts = [
    {
      title: 'Grade 8 Attendance Flag',
      detail: 'Morning attendance dropped 4.2% — Route #04 rain delay.',
      severity: 'amber' as const,
      tag: '⚠ Attention Needed',
    },
    {
      title: isApproved ? 'Intervention Active — Aarav Sharma' : 'Pending Teacher Approval',
      detail: isApproved
        ? 'Mrs. Kavita Rao approved support package. Worksheet assigned, parent notified.'
        : '1 teacher intervention awaiting approval in Copilot queue.',
      severity: isApproved ? ('green' as const) : ('blue' as const),
      tag: isApproved ? '✓ Active Case' : 'ℹ Pending',
    },
    {
      title: 'Campus Operations Stable',
      detail: 'Gate security, canteen POS, and bus telemetry nominal.',
      severity: 'green' as const,
      tag: '✓ All Clear',
    },
  ];

  const severityStyles: Record<string, { container: string; tag: string; dot: string }> = {
    red: { container: 'bg-red-950/30 border-red-800/50', tag: 'text-red-300 bg-red-900/50 border-red-700', dot: 'bg-red-400' },
    amber: { container: 'bg-amber-950/30 border-amber-800/50', tag: 'text-amber-300 bg-amber-900/50 border-amber-700', dot: 'bg-amber-400' },
    green: { container: 'bg-emerald-950/20 border-emerald-800/40', tag: 'text-emerald-300 bg-emerald-900/40 border-emerald-700', dot: 'bg-emerald-400' },
    blue: { container: 'bg-blue-950/20 border-blue-800/40', tag: 'text-blue-300 bg-blue-900/40 border-blue-700', dot: 'bg-blue-400' },
  };

  return (
    <div className="space-y-2.5">
      {alerts.map((alert, idx) => {
        const s = severityStyles[alert.severity];
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.25 }}
            className={`p-3.5 rounded-2xl border space-y-1.5 ${s.container}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                <span className="text-xs font-bold text-slate-200">{alert.title}</span>
              </div>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${s.tag}`}>
                {alert.tag}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed pl-3.5">{alert.detail}</p>
          </motion.div>
        );
      })}

      {/* Active Cases Counter */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 px-1">
        <span>Active intervention cases</span>
        <motion.span
          key={isApproved ? '8' : '7'}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="font-bold text-purple-400"
        >
          {isApproved ? '8 Active' : '7 Active'}
        </motion.span>
      </div>
    </div>
  );
}
