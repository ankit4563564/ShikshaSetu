'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';

export function ParentCopilotStrip() {
  const [state, setState] = useState(getCopilotState());
  const [showGateDetail, setShowGateDetail] = useState(false);

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const aaravAction = state.items.find((i) => i.id === 'act_001');
  const isApproved = aaravAction?.status === 'approved';

  return (
    <div className="space-y-3">

      {/* ── Teacher Update if Approved ── */}
      <AnimatePresence mode="wait">
        {isApproved ? (
          <motion.div
            key="approved-msg"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/50 space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                New Update from Mrs. Kavita Rao
              </span>
              <span className="text-emerald-600 font-bold text-[10px]">Just Now</span>
            </div>
            <p className="text-xs font-medium text-deep-teal/80 leading-relaxed">
              "Hi Priya, Aarav missed homework for 3 days. I've prepared an extra practice sheet and scheduled a check-in for tomorrow. Nothing to worry about — this is just a quick support nudge."
            </p>
            <div className="pt-1 flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-deep-teal/50">Sent via WhatsApp</span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">· Delivered ✓</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="normal-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {/* Emotional Gate Arrival Card - Light */}
            <button
              type="button"
              onClick={() => setShowGateDetail(!showGateDetail)}
              className="w-full text-left p-3 rounded-xl bg-emerald-50 border border-emerald-200/50 space-y-1.5 group hover:border-emerald-300/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">Aarav is at school</span>
                </div>
                <span className="text-[10px] text-deep-teal/50 group-hover:text-deep-teal/60 transition-colors">
                  {showGateDetail ? '▲ Less' : '▼ Details'}
                </span>
              </div>

              <AnimatePresence>
                {showGateDetail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[11px] text-deep-teal/70 leading-relaxed pt-1.5">
                      Aarav entered through <span className="font-bold text-deep-teal">Gate #2</span> at{' '}
                      <span className="font-bold text-deep-teal">8:14 AM</span>. You don't need to worry —
                      his attendance has already been recorded in Class 8A.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Live Telemetry Row - Light Styling */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Gate Scan', value: '08:14 AM', color: 'text-emerald-600', icon: '🏫' },
          { label: 'Bus #04', value: '8 Mins ETA', color: 'text-amber-600', icon: '🚌' },
          { label: 'Homework', value: '65 Mins Est.', color: 'text-blue-600', icon: '📝' },
        ].map((item) => (
          <div key={item.label} className="p-2.5 rounded-xl bg-white border border-deep-teal/10 text-center">
            <span className="text-sm">{item.icon}</span>
            <span className={`text-[9px] font-bold block uppercase font-mono mt-0.5 ${item.color}`}>{item.label}</span>
            <p className="font-bold text-deep-teal text-[11px] mt-0.5 leading-tight">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ── No Alerts Banner - Light */}
      {!isApproved && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-between">
          <span className="text-[11px] text-deep-teal/70 font-medium">All clear — no new alerts today.</span>
          <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
            ✓ On Track
          </span>
        </div>
      )}
    </div>
  );
}
