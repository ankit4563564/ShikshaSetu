'use client';

import React, { useState } from 'react';

export interface ScheduleClass {
  period: number;
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
  status?: 'done' | 'current' | 'upcoming' | string;
  icon?: string;
}

interface StudentCompactTimetableProps {
  schedule: ScheduleClass[];
  studentGrade?: string;
  studentSection?: string;
}

export default function StudentCompactTimetable({
  schedule,
  studentGrade = '8',
  studentSection = 'A',
}: StudentCompactTimetableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out break/lunch for the main NOW/NEXT view if preferred, or keep them with clear labels
  const academicClasses = schedule.filter((c) => c.period > 0);

  // Find current and next classes
  let currentClass = schedule.find((c) => c.status === 'current');
  let nextClass = schedule.find((c) => c.status === 'upcoming');

  // Fallbacks if status flags are not preset
  if (!currentClass && academicClasses.length > 0) {
    currentClass = academicClasses[0];
    nextClass = academicClasses[1] || academicClasses[0];
  } else if (!nextClass && academicClasses.length > 1) {
    const currentIndex = academicClasses.findIndex((c) => c.period === currentClass?.period);
    nextClass = academicClasses[currentIndex + 1] || academicClasses[0];
  }

  return (
    <section className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl transition-all">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-deep-teal/60">
            Priority 2 · Today&apos;s Schedule
          </p>
          <h2 className="font-display text-base font-black text-deep-teal">
            Class {studentGrade}{studentSection} Classes
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-deep-teal/15 bg-paper px-3 py-1 text-xs font-extrabold text-deep-teal transition hover:bg-deep-teal/10 cursor-pointer"
        >
          <span>{isExpanded ? 'Hide full schedule' : 'View full timetable'}</span>
          <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Compact NOW & NEXT view */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* NOW Card */}
        {currentClass && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-deep-teal px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                NOW
              </span>
              <span className="text-xs font-bold text-deep-teal font-mono">
                {currentClass.time}
              </span>
            </div>
            <div className="mt-3 flex items-start justify-between">
              <div>
                <p className="text-base font-extrabold text-deep-teal">
                  {currentClass.subject}
                </p>
                {currentClass.teacher && (
                  <p className="mt-0.5 text-xs font-semibold text-muted">
                    {currentClass.teacher}
                  </p>
                )}
              </div>
              {currentClass.room && (
                <span className="rounded-lg bg-white/90 border border-deep-teal/10 px-2.5 py-1 text-xs font-bold text-deep-teal">
                  {currentClass.room}
                </span>
              )}
            </div>
          </div>
        )}

        {/* NEXT Card */}
        {nextClass && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-deep-teal">
                NEXT
              </span>
              <span className="text-xs font-bold text-muted font-mono">
                {nextClass.time}
              </span>
            </div>
            <div className="mt-3 flex items-start justify-between">
              <div>
                <p className="text-base font-extrabold text-deep-teal">
                  {nextClass.subject}
                </p>
                {nextClass.teacher && (
                  <p className="mt-0.5 text-xs font-semibold text-muted">
                    {nextClass.teacher}
                  </p>
                )}
              </div>
              {nextClass.room && (
                <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                  {nextClass.room}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded full schedule */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
            All periods today ({schedule.length} sessions)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {schedule.map((cls, idx) => {
              const isCurrent = cls.status === 'current';
              return (
                <div
                  key={cls.period > 0 ? `period-${cls.period}` : `break-${idx}`}
                  className={`rounded-xl border p-3 text-xs transition ${
                    isCurrent
                      ? 'border-primary/30 bg-primary/5 font-bold text-deep-teal'
                      : 'border-slate-100 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                    <span>{cls.time}</span>
                    {isCurrent && (
                      <span className="rounded-full bg-deep-teal px-1.5 py-0.2 text-[8px] font-extrabold text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-extrabold text-deep-teal text-sm">
                    {cls.subject}
                  </p>
                  {cls.teacher && (
                    <p className="text-[11px] text-muted">{cls.teacher}</p>
                  )}
                  {cls.room && (
                    <p className="mt-1 text-[10px] font-semibold text-sage">
                      {cls.room}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
