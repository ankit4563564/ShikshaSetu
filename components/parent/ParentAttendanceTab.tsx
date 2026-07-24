'use client';

import { useState, useMemo } from 'react';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
}

interface ParentAttendanceTabProps {
  attendance: AttendanceRecord[];
  isLoading?: boolean;
  isEnabled?: boolean;
}

export function ParentAttendanceTab({
  attendance,
  isLoading = false,
  isEnabled = true,
}: ParentAttendanceTabProps) {
  const [showAllAttendance, setShowAllAttendance] = useState(false);

  // Helper to map daily attendance to a Mon-Fri grid
  const attendanceWeeks = useMemo(() => {
    if (!attendance) return [];
    
    // Sort attendance by date ascending
    const sorted = [...attendance].sort((a, b) => a.date.localeCompare(b.date));
    
    const weeks = [];
    for (let i = 0; i < sorted.length; i += 5) {
      weeks.push({
        name: `Week ${Math.floor(i / 5) + 1}`,
        days: sorted.slice(i, i + 5),
      });
    }
    return weeks;
  }, [attendance]);

  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-extrabold text-deep-teal">Attendance History</h3>
          <p className="font-body text-xs text-deep-teal/60">View your child's attendance records.</p>
        </div>
        <div className="rounded-2xl border border-deep-teal/10 bg-white p-6 shadow-sm text-center py-10">
          <p className="font-body text-sm text-deep-teal/40 italic">
            🔒 Attendance is hidden because this preference is disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-extrabold text-deep-teal">
          Attendance History
        </h3>
        <p className="font-body text-xs text-deep-teal/60">
          This month: {attendance.filter(a => a.status === 'present').length}/{attendance.length} days
        </p>
      </div>

      <div className="rounded-2xl border border-deep-teal/5 bg-paper p-5 shadow-sm space-y-4">
        {/* Mon-Fri column headers */}
        <div className="grid grid-cols-5 text-center border-b border-deep-teal/5 pb-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr'].map((day) => (
            <span key={day} className="font-display text-xs font-bold text-deep-teal/40">
              {day}
            </span>
          ))}
        </div>

        {/* Weekly rows */}
        <div className="space-y-4">
          {(showAllAttendance ? attendanceWeeks : attendanceWeeks.slice(-2)).map((week, wIdx) => (
            <div key={wIdx} className="flex items-center justify-between">
              <span className="font-body text-[9px] font-extrabold text-deep-teal/30 w-10 uppercase tracking-widest">
                {week.name}
              </span>
              <div className="grid grid-cols-5 flex-1 items-center justify-items-center">
                {week.days.map((day: any) => {
                  const symbol =
                    day.status === 'present' || day.status === 'late'
                      ? '✓'
                      : day.status === 'absent'
                      ? '✗'
                      : '-';
                  return (
                    <div key={day.id} className="flex flex-col items-center justify-center p-1">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                          day.status === 'present'
                            ? 'bg-sage/10 text-sage'
                            : day.status === 'late'
                            ? 'bg-marigold/10 text-marigold'
                            : 'bg-warm-clay/10 text-warm-clay'
                        }`}
                        title={`${day.date}: ${day.status}`}
                      >
                        {symbol}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!showAllAttendance && attendanceWeeks.length > 2 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllAttendance(true)}
            className="font-display text-xs font-bold text-deep-teal underline hover:text-deep-teal/80 transition-all bg-transparent disabled:opacity-50"
            disabled={isLoading}
          >
            [See Details]
          </button>
        </div>
      )}
    </div>
  );
}
