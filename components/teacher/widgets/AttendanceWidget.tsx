'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AttendanceWidgetProps {
  grade: string;
  section: string;
  onAskExplain: (query: string) => void;
  onOpenTakeAttendance?: () => void;
}

export default function AttendanceWidget({ grade, section, onAskExplain, onOpenTakeAttendance }: AttendanceWidgetProps) {
  const [attendanceSummary, setAttendanceSummary] = useState<{ totalDays: number; presentDays: number; rate: number; recentTrend: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // 1. Get all student IDs in this class
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('grade', grade)
          .eq('section', section);

        if (!students || students.length === 0) {
          setAttendanceSummary({ totalDays: 0, presentDays: 0, rate: 0, recentTrend: 'stable' });
          setLoading(false);
          return;
        }

        const studentIds = students.map((s) => s.id);

        // 2. Aggregate attendance records for this class
        const { data: records } = await supabase
          .from('attendance')
          .select('id, student_id, status, date')
          .in('student_id', studentIds)
          .gte('date', thirtyDaysAgo);

        const total = (records || []).length;
        const present = (records || []).filter((r) => r.status === 'present').length;
        const late = (records || []).filter((r) => r.status === 'late').length;
        const rate = total > 0 ? (present + late * 0.5) / total : 1.0;

        // Calculate rough trend: compare last 7 days vs prior 7 days
        const now = Date.now();
        const last7 = (records || []).filter((r) => new Date(r.date).getTime() > now - 7 * 24 * 60 * 60 * 1000);
        const prior7 = (records || []).filter((r) => {
          const t = new Date(r.date).getTime();
          return t > now - 14 * 24 * 60 * 60 * 1000 && t <= now - 7 * 24 * 60 * 60 * 1000;
        });
        const last7Rate = last7.length > 0 ? last7.filter((r) => r.status === 'present').length / last7.length : 1;
        const prior7Rate = prior7.length > 0 ? prior7.filter((r) => r.status === 'present').length / prior7.length : 1;
        const recentTrend = last7Rate > prior7Rate + 0.05 ? 'improving' : last7Rate < prior7Rate - 0.05 ? 'declining' : 'stable';

        setAttendanceSummary({ totalDays: total, presentDays: present, rate, recentTrend });
      } catch (error) {
        console.error('Failed to load attendance summary:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [grade, section]);

  const presentRate = attendanceSummary?.rate || 0;
  const presentPercentage = Math.round(presentRate * 100);
  const presentDays = attendanceSummary?.presentDays || 0;
  const totalDays = attendanceSummary?.totalDays || 0;
  const absentDays = totalDays - presentDays;
  const trend = attendanceSummary?.recentTrend || 'stable';

  const trendColor = trend === 'improving' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                    trend === 'declining' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                    'text-slate-700 bg-slate-50 border-slate-200';

  const barColor = trend === 'improving' ? 'bg-emerald-500' :
                  trend === 'declining' ? 'bg-rose-500' :
                  'bg-slate-500';

  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs font-body hover:shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <h3 className="font-display text-sm font-extrabold text-slate-900">Attendance Overview</h3>
        </div>
        {loading ? (
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
            Loading...
          </span>
        ) : (
          <span className={`text-xs font-bold ${trendColor} px-2 py-0.5 rounded-full border`}>
            {presentPercentage}% Present
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
          <span>Class {grade}{section} Daily Attendance Rate</span>
          <span>{loading ? 'Loading...' : `${presentDays}/${totalDays} Present`}</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div className={`${barColor} h-full rounded-full transition-all duration-500`} style={{ width: `${presentPercentage}%` }} />
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between gap-2">
        {onOpenTakeAttendance ? (
          <button
            type="button"
            onClick={onOpenTakeAttendance}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition-all active:scale-95 flex items-center gap-1 shadow-xs"
          >
            <span>📝 Take Attendance</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            {loading ? 'Loading data...' : `${absentDays} Absent Days`}
          </span>
        )}

        <button
          type="button"
          onClick={() => onAskExplain('Explain Class 8A attendance trends this week.')}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] transition-all active:scale-95 flex items-center gap-1"
        >
          <span>Explain Trend</span>
          <span className="text-[10px]">✨</span>
        </button>
      </div>
    </div>
  );
}

