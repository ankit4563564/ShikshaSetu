'use client';

import React from 'react';

export interface HomeworkItem {
  id?: string;
  subject: string;
  title: string;
  dueDate?: string;
  due_date?: string;
  isSubmitted?: boolean;
  is_submitted?: boolean;
  submittedAt?: string;
  submitted_at?: string;
}

interface StudentTodayTasksProps {
  homework: HomeworkItem[];
  onOpenHomeworkTab?: () => void;
  onOpenRevisionNotes?: () => void;
  onOpenStudyHelp?: (hwTitle?: string, subject?: string) => void;
}

export default function StudentTodayTasks({
  homework,
  onOpenHomeworkTab,
  onOpenRevisionNotes,
  onOpenStudyHelp,
}: StudentTodayTasksProps) {
  // Deduplicate and filter only pending items
  const seenKeys = new Set<string>();
  const pendingTasks = (homework || []).filter((hw) => {
    if (!hw || hw.isSubmitted || hw.is_submitted) return false;
    const normalizedTitle = (hw.title || '').trim().toLowerCase();
    const key = hw.id || `${hw.subject}-${normalizedTitle}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // Helper to categorize urgency and priority
  const getUrgency = (hw: HomeworkItem): {
    priorityOrder: number;
    level: 'needs_attention' | 'due_today' | 'recommended' | 'up_next';
    label: string;
    dotColor: string;
    badgeClass: string;
  } => {
    const rawDue = (hw.dueDate || hw.due_date || '').toLowerCase();
    if (rawDue.includes('urgent') || rawDue.includes('overdue')) {
      return {
        priorityOrder: 0,
        level: 'needs_attention',
        label: 'NEEDS ATTENTION',
        dotColor: 'bg-rose-500',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      };
    }
    if (rawDue.includes('today') || rawDue.includes('4:') || rawDue.includes('5:')) {
      return {
        priorityOrder: 1,
        level: 'due_today',
        label: 'DUE TODAY',
        dotColor: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
      };
    }
    if (rawDue.includes('tomorrow')) {
      return {
        priorityOrder: 2,
        level: 'recommended',
        label: 'DUE TOMORROW',
        dotColor: 'bg-indigo-500',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
      };
    }
    return {
      priorityOrder: 3,
      level: 'up_next',
      label: hw.dueDate || hw.due_date ? `Due ${hw.dueDate || hw.due_date}` : 'UP NEXT',
      dotColor: 'bg-teal-600',
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200 font-semibold',
    };
  };

  // Sort by priority order
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    return getUrgency(a).priorityOrder - getUrgency(b).priorityOrder;
  });

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 sm:p-6 shadow-2xs backdrop-blur-xl transition-all">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            ACTIONABLE WORK &middot; PRIORITIZED FOR YOU
          </p>
          <h2 className="font-display text-base font-black text-slate-900">
            Today&apos;s Actions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              sortedTasks.length > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {sortedTasks.length === 0
              ? '✓ All clear'
              : `${sortedTasks.length} task${sortedTasks.length === 1 ? '' : 's'} remaining`}
          </span>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-6 text-center">
          <span className="text-3xl block mb-2">🎉</span>
          <p className="text-sm font-extrabold text-emerald-950">You&apos;re all caught up!</p>
          <p className="mt-1 text-xs font-semibold text-emerald-800/80">
            No pending homework assignments today. Use this time for a quick 5-min concept revision.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task, idx) => {
            const urgency = getUrgency(task);
            return (
              <div
                key={task.id || `task-${idx}-${task.subject}-${task.title}`}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-indigo-300 hover:shadow-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${urgency.dotColor}`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-800">
                        {task.subject}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] ${urgency.badgeClass}`}
                      >
                        {urgency.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-extrabold text-slate-900 leading-snug">
                      {task.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0">
                  {onOpenStudyHelp && (
                    <button
                      type="button"
                      onClick={() => onOpenStudyHelp(task.title, task.subject)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 cursor-pointer shadow-2xs"
                      title="Ask SchoolMitra for guidance on this assignment"
                    >
                      <span>💡 Explain Task</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenHomeworkTab}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-2xs transition hover:bg-slate-800 active:scale-95 cursor-pointer"
                  >
                    <span>{urgency.level === 'due_today' ? 'Submit' : 'Open'}</span>
                    <span className="text-[11px]">&rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
