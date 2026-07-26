'use client';

export default function ScheduleCalendarWidget() {
  const schedule = [
    { time: '9:00 AM', event: 'Class 8A Science Lab', room: 'Lab #2', active: true },
    { time: '11:15 AM', event: 'Class 9B Physics Lecture', room: 'Room 104', active: false },
    { time: '2:00 PM', event: "PTM with Aarav's Parents", room: 'Staff Room', active: false },
  ];

  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs font-body hover:shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📅</span>
          <h3 className="font-display text-sm font-extrabold text-slate-900">Today&apos;s Schedule</h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">3 Events</span>
      </div>

      <div className="space-y-2 text-xs">
        {schedule.map((item, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
              item.active
                ? 'bg-indigo-50 border-indigo-200/90 text-indigo-900 font-bold'
                : 'bg-slate-50 border-slate-200/70 text-slate-700 font-medium'
            }`}
          >
            <div>
              <h4 className="font-bold text-slate-900">{item.event}</h4>
              <p className="text-[10px] text-slate-500">{item.room}</p>
            </div>
            <span className="font-mono text-[11px] font-bold text-slate-700">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
