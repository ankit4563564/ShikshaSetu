'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';

export function StudentCopilotStrip() {
  const [state, setState] = useState(getCopilotState());
  const [homeworkProgress, setHomeworkProgress] = useState(40);

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const aaravAction = state.items.find((i) => i.id === 'act_001');
  const isApproved = aaravAction?.status === 'approved';

  return (
    <div className="space-y-3">

      {/* ── Today's Goal Card ── */}
      <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
            🎯 Today's Goal
          </span>
          <span className="text-[9px] font-mono text-slate-400">Est. finish: 4:30 PM</span>
        </div>
        <p className="text-xs font-bold text-white">Complete all homework before 5 PM to keep your 14-day streak! 🔥</p>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Progress</span>
            <span className="text-amber-400 font-bold">{homeworkProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${homeworkProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
            />
          </div>
        </div>
      </div>

      {/* ── New Worksheet if Approved ── */}
      <AnimatePresence>
        {isApproved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-700/50 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-emerald-300">✦ New: Algebra Practice Worksheet B</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Assigned by Mrs. Kavita Rao · ~15 mins</p>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-1 rounded-full bg-emerald-600 text-white shrink-0 ml-2">
                Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Next Tasks ── */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Next Tasks</span>
        {[
          { task: 'Science Lab Report (Acid-Base Test)', due: 'Due 4:00 PM', urgent: true },
          { task: 'Mathematics Algebra Review Set', due: 'Due Today', urgent: false },
        ].map((t, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.urgent ? 'bg-red-400' : 'bg-slate-600'}`} />
              <span className="font-medium text-slate-200">{t.task}</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px] shrink-0 ml-2">{t.due}</span>
          </div>
        ))}
      </div>

      {/* ── Streak Motivation ── */}
      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center gap-2.5">
        <span className="text-xl">🔥</span>
        <div>
          <p className="text-xs font-bold text-purple-300">14-Day Streak Active</p>
          <p className="text-[10px] text-slate-400">Keep going — you're in the top 5% of your class!</p>
        </div>
      </div>
    </div>
  );
}
