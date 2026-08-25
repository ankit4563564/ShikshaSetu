'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TodaysFocusBarProps {
  needsAttentionCount?: number;
  pendingHomeworkCount?: number;
  attendanceRate?: number;
  totalStudents?: number;
  onSelectItem?: (action: string) => void;
}

export default function TodaysFocusBar({
  needsAttentionCount = 1,
  pendingHomeworkCount = 3,
  attendanceRate = 96,
  totalStudents = 5,
  onSelectItem,
}: TodaysFocusBarProps) {
  const priorities = [
    {
      id: 'p1',
      label: needsAttentionCount > 0
        ? `${needsAttentionCount} student${needsAttentionCount !== 1 ? 's' : ''} need targeted support`
        : 'All students on track',
      icon: '🚨',
      bg: needsAttentionCount > 0
        ? 'bg-gradient-to-r from-rose-50/90 via-rose-50/40 to-white border-rose-200/90 text-rose-900 shadow-rose-500/5'
        : 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white border-emerald-200/90 text-emerald-900 shadow-emerald-500/5',
      actionKey: 'needs_attention_students',
    },
    {
      id: 'p2',
      label: pendingHomeworkCount > 0
        ? `${pendingHomeworkCount} homework assignments active`
        : 'No pending homework review',
      icon: '📝',
      bg: 'bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-white border-amber-200/90 text-amber-900 shadow-amber-500/5',
      actionKey: 'open_homework_hub',
    },
    {
      id: 'p3',
      label: `Attendance ${attendanceRate}% today (${totalStudents} enrolled)`,
      icon: '📅',
      bg: 'bg-gradient-to-r from-indigo-50/90 via-indigo-50/40 to-white border-indigo-200/90 text-indigo-900 shadow-indigo-500/5',
      actionKey: 'view_attendance_modal',
    },
    {
      id: 'p4',
      label: 'AI Lesson Studio & Exit Tickets',
      icon: '✨',
      bg: 'bg-gradient-to-r from-purple-50/90 via-purple-50/40 to-white border-purple-200/90 text-purple-900 shadow-purple-500/5',
      actionKey: 'open_ai_toolkit',
    },
  ];

  return (
    <div className="space-y-3 font-body">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
          🎯 Today&apos;s Focus &amp; Action Priorities
        </span>
        <span className="text-xs font-extrabold text-slate-400">
          Academic Year 2026–27
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {priorities.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectItem && onSelectItem(item.actionKey)}
            className={`p-4 rounded-2xl border ${item.bg} text-left transition-all shadow-sm flex items-center justify-between group cursor-pointer backdrop-blur-md`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-base shrink-0 p-1.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">{item.icon}</span>
              <span className="text-xs font-black truncate">{item.label}</span>
            </div>
            <span className="text-xs opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-1 shrink-0 font-black">
              &rarr;
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
