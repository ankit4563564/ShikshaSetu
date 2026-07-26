'use client';

interface SupportRadarWidgetProps {
  onAskWhy: (studentName: string) => void;
}

const atRiskStudents = [
  { id: '1', name: 'Aarav Sharma', score: '92%', status: 'ON TRACK', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: '2', name: 'Priya Patel', score: '78%', status: 'WATCHING', statusColor: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: '3', name: 'Rohan Kumar', score: '64%', status: 'ATTENTION', statusColor: 'text-rose-700 bg-rose-50 border-rose-200' },
];

export default function SupportRadarWidget({ onAskWhy }: SupportRadarWidgetProps) {
  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs font-body hover:shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🚨</span>
          <h3 className="font-display text-sm font-extrabold text-slate-900">Student Support Radar</h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">3 Students</span>
      </div>

      <div className="space-y-2.5">
        {atRiskStudents.map((s) => (
          <div
            key={s.id}
            className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-[10px]">
                {s.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{s.name}</h4>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${s.statusColor}`}>
                  {s.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAskWhy(`Why does ${s.name} need attention?`)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] transition-all active:scale-95 shadow-2xs flex items-center gap-1"
            >
              <span>Ask Why</span>
              <span className="text-[10px]">✨</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
