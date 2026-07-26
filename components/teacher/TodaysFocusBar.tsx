'use client';

interface TodaysFocusBarProps {
  onSelectItem?: (item: string) => void;
}

export default function TodaysFocusBar({ onSelectItem }: TodaysFocusBarProps) {
  const priorities = [
    { id: 'p1', label: '3 students require follow-up', icon: '🚨', bg: 'bg-rose-50 border-rose-200/80 text-rose-800' },
    { id: 'p2', label: '14 homework submissions awaiting review', icon: '📝', bg: 'bg-amber-50 border-amber-200/80 text-amber-800' },
    { id: 'p3', label: "PTM with Aarav's parents at 2:00 PM", icon: '📅', bg: 'bg-purple-50 border-purple-200/80 text-purple-800' },
    { id: 'p4', label: 'Attendance is 96% present today', icon: '✅', bg: 'bg-emerald-50 border-emerald-200/80 text-emerald-800' },
  ];

  return (
    <div className="space-y-2.5 font-body">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
          Today&apos;s Focus &amp; Priorities
        </span>
        <span className="text-[11px] font-medium text-slate-400">Wednesday, 22nd July</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {priorities.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem && onSelectItem(item.label)}
            className={`p-3.5 rounded-2xl border ${item.bg} text-left transition-all hover:shadow-xs flex items-center justify-between group active:scale-95`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-sm shrink-0">{item.icon}</span>
              <span className="text-xs font-bold truncate">{item.label}</span>
            </div>
            <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity ml-1 shrink-0">&rarr;</span>
          </button>
        ))}
      </div>
    </div>
  );
}
