'use client';

import { useEffect, useState } from 'react';
import { getCanonicalHomeworkSummary } from '@/lib/canonical';

interface HomeworkWidgetProps {
  onDraftReminder: (query: string) => void;
}

export default function HomeworkWidget({ onDraftReminder }: HomeworkWidgetProps) {
  const [homeworkSummary, setHomeworkSummary] = useState<{ total: number; submitted: number; pending: number; missed: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const summary = await getCanonicalHomeworkSummary(30);
        setHomeworkSummary(summary);
      } catch (error) {
        console.error('Failed to load homework summary:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = homeworkSummary?.pending || 0;
  const submittedCount = homeworkSummary?.submitted || 0;
  const totalCount = homeworkSummary?.total || 0;
  const submissionRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs font-body hover:shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📝</span>
          <h3 className="font-display text-sm font-extrabold text-slate-900">Homework &amp; Assignments</h3>
        </div>
        {loading ? (
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
            Loading...
          </span>
        ) : (
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {pendingCount} Pending
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900">Class 8A Overview</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              {loading ? 'Loading...' : `Due This Month • ${submittedCount}/${totalCount} Submitted`}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">{loading ? '--' : `${submissionRate}%`}</span>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {loading ? 'Loading data...' : `${pendingCount} pending reviews`}
        </span>
        <button
          type="button"
          onClick={() => onDraftReminder('Generate homework reminder for Class 8A parents.')}
          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[11px] transition-all active:scale-95 flex items-center gap-1"
        >
          <span>Draft Reminder</span>
          <span className="text-[10px]">✨</span>
        </button>
      </div>
    </div>
  );
}
