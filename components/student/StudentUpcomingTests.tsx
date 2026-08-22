'use client';

import React from 'react';

export interface ExamItem {
  id: string;
  subject: string;
  date: string;
  time?: string;
  type?: string;
  syllabus?: string;
  daysLeft: number;
}

interface StudentUpcomingTestsProps {
  exams: ExamItem[];
  onPrepareExam?: (exam: ExamItem) => void;
}

export default function StudentUpcomingTests({
  exams = [],
  onPrepareExam,
}: StudentUpcomingTestsProps) {
  return (
    <section className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl transition-all flex flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-deep-teal/60">
              Priority 4 · Assessments
            </p>
            <h2 className="font-display text-base font-black text-deep-teal">
              Upcoming Tests
            </h2>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-extrabold text-primary">
            {exams.length} scheduled
          </span>
        </div>

        {exams.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
            <span className="text-xl block mb-1">📝</span>
            <p className="text-xs font-bold text-deep-teal">No upcoming tests</p>
            <p className="text-[11px] text-muted">Your scheduled exams will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 transition hover:border-deep-teal/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-deep-teal">
                      {exam.subject}
                    </p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[9px] font-extrabold text-primary">
                      {exam.daysLeft} day{exam.daysLeft === 1 ? '' : 's'} left
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-muted">
                    {exam.date} {exam.type ? `· ${exam.type}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onPrepareExam && onPrepareExam(exam)}
                  className="rounded-lg bg-deep-teal/10 px-3 py-1.5 text-xs font-extrabold text-deep-teal transition hover:bg-deep-teal hover:text-white cursor-pointer"
                >
                  Prepare
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
