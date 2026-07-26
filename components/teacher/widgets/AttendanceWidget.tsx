'use client';

interface AttendanceWidgetProps {
  onAskExplain: (query: string) => void;
}

export default function AttendanceWidget({ onAskExplain }: AttendanceWidgetProps) {
  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs font-body hover:shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <h3 className="font-display text-sm font-extrabold text-slate-900">Attendance Overview</h3>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          96% Present
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
          <span>Class 8A Daily Attendance Rate</span>
          <span>36/38 Present</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full w-[96%]" />
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">2 Absent Students (Fever)</span>
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
