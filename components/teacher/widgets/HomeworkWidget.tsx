'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface HomeworkWidgetProps {
  grade: string;
  section: string;
  onDraftReminder: (query: string) => void;
  onOpenCreateHomework?: () => void;
}

export default function HomeworkWidget({ grade, section, onDraftReminder, onOpenCreateHomework }: HomeworkWidgetProps) {
  const [homeworkSummary, setHomeworkSummary] = useState<{ total: number; submitted: number; pending: number; missed: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        // 1. Get all student IDs in this class
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('grade', grade)
          .eq('section', section);

        if (!students || students.length === 0) {
          setHomeworkSummary({ total: 0, submitted: 0, pending: 0, missed: 0 });
          setLoading(false);
          return;
        }

        const studentIds = students.map((s) => s.id);

        // 2. Aggregate homework records for this class
        const { data: records } = await supabase
          .from('homework')
          .select('id, student_id, is_submitted, due_date')
          .in('student_id', studentIds)
          .gte('due_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const today = new Date();
        const total = (records || []).length;
        const submitted = (records || []).filter((r) => r.is_submitted).length;
        const pending = (records || []).filter((r) => !r.is_submitted && new Date(r.due_date) >= today).length;
        const missed = (records || []).filter((r) => !r.is_submitted && new Date(r.due_date) < today).length;

        setHomeworkSummary({ total, submitted, pending, missed });
      } catch (error) {
        console.error('Failed to load homework summary:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [grade, section]);

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
            <h4 className="font-bold text-slate-900">Class {grade}{section} Overview</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              {loading ? 'Loading...' : `Due This Month • ${submittedCount}/${totalCount} Submitted`}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">{loading ? '--' : `${submissionRate}%`}</span>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between gap-2">
        {onOpenCreateHomework ? (
          <button
            type="button"
            onClick={onOpenCreateHomework}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
          >
            <span>✨ Create Homework</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            {loading ? 'Loading data...' : `${pendingCount} pending reviews`}
          </span>
        )}

        <button
          type="button"
          onClick={() => onDraftReminder(`Generate homework reminder for Class ${grade}${section} parents.`)}
          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[11px] transition-all active:scale-95 flex items-center gap-1"
        >
          <span>Draft Reminder</span>
          <span className="text-[10px]">✨</span>
        </button>
      </div>
    </div>
  );
}
