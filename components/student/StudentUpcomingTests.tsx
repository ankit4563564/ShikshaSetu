'use client';

import React from 'react';

export interface ExamItem {
  id: string;
  subject: string;
  topic?: string;
  date: string;
  time?: string;
  type?: string;
  syllabus?: string;
  daysLeft: number;
  stepsCompleted?: number;
  totalSteps?: number;
}

const DEFAULT_UPCOMING_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    subject: 'Science',
    topic: 'Chapter 4: Cell Structure & Functions',
    date: 'Tomorrow',
    time: '10:00 AM',
    type: 'Unit Test',
    syllabus: 'Plant vs Animal Cells, Organelles, Cell Division',
    daysLeft: 1,
    stepsCompleted: 2,
    totalSteps: 3,
  },
  {
    id: 'exam-2',
    subject: 'Mathematics',
    topic: 'Fractions, Decimals & Algebraic Expressions',
    date: 'Friday',
    time: '11:30 AM',
    type: 'Weekly Check',
    syllabus: 'Equivalent fractions, Linear terms, Simplification',
    daysLeft: 3,
    stepsCompleted: 1,
    totalSteps: 3,
  },
];

interface StudentUpcomingTestsProps {
  exams?: ExamItem[];
  onPrepareExam?: (exam: ExamItem) => void;
}

export default function StudentUpcomingTests({
  exams = DEFAULT_UPCOMING_EXAMS,
  onPrepareExam,
}: StudentUpcomingTestsProps) {
  const activeExams = exams.length > 0 ? exams : DEFAULT_UPCOMING_EXAMS;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 sm:p-6 shadow-2xs backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📝</span>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-extrabold block">
              EXAM PREPARATION
            </span>
            <h2 className="font-display text-base font-black text-slate-900">
              Upcoming Tests &amp; Exams
            </h2>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
          {activeExams.length} Scheduled
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeExams.map((exam) => (
          <div
            key={exam.id}
            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-indigo-200 transition-all shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wide">
                  {exam.subject}
                </span>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                  exam.daysLeft <= 1
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {exam.daysLeft === 0 ? 'Today' : exam.daysLeft === 1 ? 'Tomorrow' : `In ${exam.daysLeft} days`}
                </span>
              </div>

              <div>
                <h3 className="font-display text-sm font-extrabold text-slate-900">
                  {exam.topic || exam.subject}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {exam.date} &middot; {exam.time || '10:00 AM'} ({exam.type || 'Test'})
                </p>
              </div>

              {exam.syllabus && (
                <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 font-medium leading-relaxed">
                  <strong className="text-slate-900">Syllabus:</strong> {exam.syllabus}
                </p>
              )}

              {/* Checklist */}
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 pt-1">
                <span className="text-emerald-700 flex items-center gap-1">
                  <span>✓</span> <span>Notes</span>
                </span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <span>✓</span> <span>5 Qs</span>
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <span>○</span> <span>Quick Check</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onPrepareExam && onPrepareExam(exam)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Prepare for Test</span>
              <span className="text-sm">&rarr;</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
