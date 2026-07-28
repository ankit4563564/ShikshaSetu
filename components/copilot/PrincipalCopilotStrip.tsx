'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';

/* Inline Lucide-style icons for consistency */
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export function PrincipalCopilotStrip() {
  const [state, setState] = useState(getCopilotState());

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const aaravAction = state.items.find((i) => i.id === 'act_001');
  const isApproved = aaravAction?.status === 'approved';

  const alerts: { title: string; detail: string; severity: 'amber' | 'green' | 'blue'; tag: string; icon: React.FC }[] = [
    {
      title: 'Grade 8 Attendance Flag',
      detail: 'Morning attendance dropped 4.2% — Route #04 rain delay.',
      severity: 'amber',
      tag: 'Attention Needed',
      icon: AlertIcon,
    },
    {
      title: isApproved ? 'Intervention Active — Aarav Sharma' : 'Pending Teacher Approval',
      detail: isApproved
        ? 'Mrs. Kavita Rao approved support package. Worksheet assigned, parent notified.'
        : '1 teacher intervention awaiting approval in the review queue.',
      severity: isApproved ? 'green' : 'blue',
      tag: isApproved ? 'Active Case' : 'Pending',
      icon: isApproved ? CheckIcon : InfoIcon,
    },
    {
      title: 'Campus Operations Stable',
      detail: 'Gate security, canteen, and transport are operating normally.',
      severity: 'green',
      tag: 'All Clear',
      icon: ShieldIcon,
    },
  ];

  const severityStyles: Record<string, { container: string; tag: string; dot: string; iconColor: string }> = {
    red:   { container: 'bg-red-50 border-red-200/60',     tag: 'text-red-600 bg-red-100/80',     dot: 'bg-red-500',     iconColor: 'text-red-500' },
    amber: { container: 'bg-amber-50 border-amber-200/60', tag: 'text-amber-700 bg-amber-100/80', dot: 'bg-amber-500',   iconColor: 'text-amber-500' },
    green: { container: 'bg-emerald-50/60 border-emerald-200/40', tag: 'text-emerald-600 bg-emerald-100/80', dot: 'bg-emerald-500', iconColor: 'text-emerald-500' },
    blue:  { container: 'bg-blue-50 border-blue-200/60',   tag: 'text-blue-600 bg-blue-100/80',   dot: 'bg-blue-500',    iconColor: 'text-blue-500' },
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => {
        const s = severityStyles[alert.severity];
        const AlertIconComponent = alert.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.25 }}
            className={`flex items-start gap-3 p-3 rounded-xl border ${s.container}`}
          >
            <span className={`mt-0.5 flex-shrink-0 ${s.iconColor}`}>
              <AlertIconComponent />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-ink">{alert.title}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.tag}`}>
                  {alert.tag}
                </span>
              </div>
              <p className="text-[11px] text-muted/60 leading-relaxed mt-0.5">{alert.detail}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Active Cases Counter */}
      <div className="flex items-center justify-between text-[11px] text-muted/50 pt-0.5 px-1">
        <span className="font-medium">Active support cases</span>
        <motion.span
          key={isApproved ? '8' : '7'}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="font-semibold text-primary"
        >
          {isApproved ? '8 Active' : '7 Active'}
        </motion.span>
      </div>
    </div>
  );
}
