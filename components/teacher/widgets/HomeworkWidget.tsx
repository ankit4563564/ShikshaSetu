'use client';

interface HomeworkWidgetProps {
  onDraftReminder: (query: string) => void;
}

export default function HomeworkWidget({ onDraftReminder }: HomeworkWidgetProps) {
  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs font-body hover:shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📝</span>
          <h3 className="font-display text-sm font-extrabold text-slate-900">Homework &amp; Assignments</h3>
        </div>
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          14 Waiting Review
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900">Physics Lab Experiment #3</h4>
            <p className="text-[11px] text-slate-500 font-medium">Due Today • 24/38 Submitted</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">63%</span>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">14 pending reviews</span>
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
