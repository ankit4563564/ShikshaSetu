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
  onOpenRevisionMaps?: () => void;
}

export default function StudentTodayTasks({
  homework,
  onOpenHomeworkTab,
  onOpenRevisionMaps,
}: StudentTodayTasksProps) {
  // Filter only pending items
  const pendingTasks = (homework || []).filter(
    (hw) => !hw.isSubmitted && !hw.is_submitted
  );

  // Helper to categorize urgency
  const getUrgency = (hw: HomeworkItem): { level: 'today' | 'tomorrow' | 'upcoming'; label: string; dotColor: string; badgeClass: string } => {
    const rawDue = (hw.dueDate || hw.due_date || '').toLowerCase();
    if (rawDue.includes('today') || rawDue.includes('4:') || rawDue.includes('5:') || rawDue.includes('urgent')) {
      return {
        level: 'today',
        label: 'Due today',
        dotColor: 'bg-rose-500',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/60',
      };
    }
    if (rawDue.includes('tomorrow')) {
      return {
        level: 'tomorrow',
        label: 'Due tomorrow',
        dotColor: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
      };
    }
    return {
      level: 'upcoming',
      label: hw.dueDate || hw.due_date ? `Due ${hw.dueDate || hw.due_date}` : 'Pending',
      dotColor: 'bg-teal-600',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/60',
    };
  };

  // Sort by urgency: 'today' first, then 'tomorrow', then 'upcoming'
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const order = { today: 0, tomorrow: 1, upcoming: 2 };
    return order[getUrgency(a).level] - order[getUrgency(b).level];
  });

  return (
    <section className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl transition-all">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-deep-teal/60">
            Priority 1 · What you need to do
          </p>
          <h2 className="font-display text-base font-black text-deep-teal">
            Today&apos;s Actions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-extrabold ${
              sortedTasks.length > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                : 'bg-sage/15 text-sage'
            }`}
          >
            {sortedTasks.length === 0
              ? 'All clear'
              : `${sortedTasks.length} task${sortedTasks.length === 1 ? '' : 's'} to finish`}
          </span>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="rounded-xl border border-sage/20 bg-sage/5 p-6 text-center">
          <span className="text-3xl block mb-2">🎉</span>
          <p className="text-sm font-extrabold text-deep-teal">You&apos;re all caught up!</p>
          <p className="mt-1 text-xs font-semibold text-muted">
            No pending homework for today. Great job keeping your work up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedTasks.map((task, idx) => {
            const urgency = getUrgency(task);
            return (
              <div
                key={task.id || `task-${idx}`}
                className="group flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition hover:border-deep-teal/25 hover:shadow-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${urgency.dotColor}`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-deep-teal">
                        {task.subject}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${urgency.badgeClass}`}
                      >
                        {urgency.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-extrabold text-deep-teal leading-snug">
                      {task.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={onOpenHomeworkTab}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-deep-teal px-3.5 py-1.5 text-xs font-extrabold text-white shadow-2xs transition hover:bg-deep-teal/90 active:scale-95 cursor-pointer"
                  >
                    {urgency.level === 'today' ? 'Submit' : 'Open'}
                    <span className="text-[11px]">→</span>
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
