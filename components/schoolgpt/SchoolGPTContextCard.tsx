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
      className="p-3.5 bg-slate-50 border border-slate-200/80 text-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs font-body"
    >
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-slate-600 font-medium">
          Viewing <strong className="text-slate-900 font-bold">{classNameLabel}</strong> {studentName ? `• ${studentName}` : ''}
        </span>
      </div>
      <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
        {screenName}
      </span>
    </motion.div>
  );
}
