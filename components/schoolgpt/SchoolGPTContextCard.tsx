'use client';

import { motion } from 'framer-motion';

interface ContextCardProps {
  role?: string;
  screenName?: string;
  studentName?: string;
  classNameLabel?: string;
}

export default function SchoolGPTContextCard({
  role = 'Teacher',
  screenName = 'Teacher Dashboard',
  studentName = 'Aarav Sharma',
  classNameLabel = 'Class 8A',
}: ContextCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-sm space-y-2 border border-slate-800"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            Active Intelligence Context
          </span>
        </div>
        <span className="text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
          ● Auto-Detected
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 font-extrabold text-[11px] border border-slate-700 flex items-center gap-1.5">
          <span>👤</span> {role}
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 font-extrabold text-[11px] border border-slate-700 flex items-center gap-1.5">
          <span>🖥️</span> {screenName}
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 font-extrabold text-[11px] border border-slate-700 flex items-center gap-1.5">
          <span>🏫</span> {classNameLabel}
        </span>
        {studentName && (
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1.5">
            <span>⭐</span> {studentName}
          </span>
        )}
      </div>
    </motion.div>
  );
}
