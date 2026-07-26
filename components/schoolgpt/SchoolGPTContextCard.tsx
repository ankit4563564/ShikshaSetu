'use client';

import { motion } from 'framer-motion';

interface ContextCardProps {
  screenName?: string;
  studentName?: string;
  classNameLabel?: string;
}

export default function SchoolGPTContextCard({
  screenName = 'Your Classroom',
  studentName = 'Aarav Sharma',
  classNameLabel = 'Class 8A',
}: ContextCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xs flex items-center justify-between gap-3 text-xs"
    >
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-body text-slate-300 font-semibold">
          You are viewing <strong className="text-white font-extrabold">{classNameLabel}</strong> {studentName ? `• ${studentName}` : ''}
        </span>
      </div>
      <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-xl">
        {screenName}
      </span>
    </motion.div>
  );
}
