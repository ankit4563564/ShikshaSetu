'use client';

import React from 'react';

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
        ? `${needsAttentionCount} student${needsAttentionCount !== 1 ? 's' : ''} need learning support`
        : 'All students are on track',
      icon: '🚨',
      bg: needsAttentionCount > 0
        ? 'bg-rose-50/90 border-rose-200/80 text-rose-800'
        : 'bg-emerald-50 border-emerald-200/80 text-emerald-800',
      actionKey: 'needs_attention_students',
    },
    {
      id: 'p2',
      label: pendingHomeworkCount > 0
        ? `${pendingHomeworkCount} homework assignments active`
        : 'No pending homework review',
      icon: '📝',
      bg: 'bg-amber-50/90 border-amber-200/80 text-amber-800',
      actionKey: 'open_homework_hub',
    },
    {
      id: 'p3',
      label: `Attendance is ${attendanceRate}% today (${totalStudents} enrolled)`,
      icon: '📅',
      bg: 'bg-indigo-50/90 border-indigo-200/80 text-indigo-800',
      actionKey: 'view_attendance_modal',
    },
    {
      id: 'p4',
      label: 'Lesson Planner & Differentiation Ready',
      icon: '✨',
      bg: 'bg-purple-50/90 border-purple-200/80 text-purple-800',
      actionKey: 'open_ai_toolkit',
    },
  ];

  return (
    <div className="space-y-2.5 font-body">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
          🎯 Today&apos;s Focus &amp; Next Best Actions
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          Academic Year 2026–27
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {priorities.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem && onSelectItem(item.actionKey)}
            className={`p-3.5 rounded-2xl border ${item.bg} text-left transition-all hover:shadow-xs flex items-center justify-between group active:scale-95 cursor-pointer`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-sm shrink-0">{item.icon}</span>
              <span className="text-xs font-extrabold truncate">{item.label}</span>
            </div>
            <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity ml-1 shrink-0 font-bold">
              &rarr;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
