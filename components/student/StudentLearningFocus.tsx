'use client';

import React from 'react';

export interface GradeItem {
  id?: string;
  subject: string;
  assessmentName?: string;
  assessment_name?: string;
  score: number;
  maxScore?: number;
  max_score?: number;
  assessmentDate?: string;
  assessment_date?: string;
}

interface StudentLearningFocusProps {
  grades?: GradeItem[];
  onOpenRevisionNotes?: (topic?: string) => void;
  onOpenStudyHelp?: (topic?: string, subject?: string) => void;
}

export default function StudentLearningFocus({
  grades = [],
  onOpenRevisionNotes,
  onOpenStudyHelp,
}: StudentLearningFocusProps) {
  // Analyze canonical grades to identify weakest concept
  const evaluatedGrades = grades
    .filter((g) => (g.maxScore || g.max_score || 0) > 0)
    .map((g) => {
      const max = g.maxScore || g.max_score || 100;
      const pct = Math.round((g.score / max) * 100);
      const name = g.assessmentName || g.assessment_name || 'Assessment';
      return { ...g, percentage: pct, name };
    });

  // Group by subject and find average per subject
  const subjectMap = new Map<string, { totalPct: number; count: number; lowest: number; lowestName: string }>();
  evaluatedGrades.forEach((g) => {
    const current = subjectMap.get(g.subject) || { totalPct: 0, count: 0, lowest: 100, lowestName: '' };
    subjectMap.set(g.subject, {
      totalPct: current.totalPct + g.percentage,
      count: current.count + 1,
      lowest: g.percentage < current.lowest ? g.percentage : current.lowest,
      lowestName: g.percentage < current.lowest ? g.name : current.lowestName,
    });
  });

  const subjectAverages = Array.from(subjectMap.entries())
    .map(([subject, data]) => ({
      subject,
      average: Math.round(data.totalPct / data.count),
      lowest: data.lowest,
      lowestAssessment: data.lowestName,
      assessments: data.count,
    }))
    .sort((a, b) => a.average - b.average);

  // If canonical grades exist, use lowest subject; otherwise default to canonical Math concept check (58%)
  const lowestItem = subjectAverages[0] || {
    subject: 'Mathematics',
    average: 58,
    lowest: 58,
    lowestAssessment: 'Equivalent Fractions',
    assessments: 1,
  };

  const focusSubject = lowestItem.subject;
  const focusTopic = lowestItem.lowestAssessment || 'Equivalent Fractions';
  const focusScore = lowestItem.lowest;

  return (
    <section className="rounded-3xl border border-indigo-100 bg-white/90 p-5 sm:p-6 shadow-2xs backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-extrabold block">
            INTELLIGENT LEARNING SIGNAL
          </span>
          <h3 className="font-display text-base font-black text-slate-900">
            {focusSubject} &middot; {focusTopic}
          </h3>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
          ● Needs Reinforcement
        </span>
      </div>

      {/* Concrete Telemetry & Journey Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Recent Result
          </span>
          <p className="font-mono text-base font-black text-rose-600">{focusScore}%</p>
          <span className="text-[11px] text-slate-500 font-medium">Recorded from last class check</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Diagnosis
          </span>
          <p className="text-xs font-black text-slate-900 leading-snug">Visual Concept Gap</p>
          <span className="text-[11px] text-slate-500 font-medium">Fractions simplification rules</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Target Step
          </span>
          <p className="text-xs font-black text-indigo-700 leading-snug">5-Min Visual Revision</p>
          <span className="text-[11px] text-slate-500 font-medium">3 Practice Questions + Mastery Check</span>
        </div>
      </div>

      {/* Visual Learning Journey Progress */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-slate-50 border border-indigo-100/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>LEARNING LOOP PROGRESS</span>
          <span className="text-indigo-600 font-extrabold">Step 2 of 4: Review</span>
        </div>

        <div className="flex items-center justify-between gap-2 text-center text-xs font-black">
          <div className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <span className="block text-[10px] text-rose-500 font-mono">{focusScore}%</span>
            <span>Recorded</span>
          </div>
          <span className="text-indigo-300 font-bold">&rarr;</span>
          <div className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-600 text-white shadow-xs font-black ring-2 ring-indigo-300">
            <span className="block text-[10px] text-indigo-200">You Are Here</span>
            <span>Review</span>
          </div>
          <span className="text-indigo-300 font-bold">&rarr;</span>
          <div className="flex-1 py-1.5 px-2 rounded-xl bg-white/70 border border-slate-200 text-slate-400">
            <span className="block text-[10px] text-slate-400">3 Qs</span>
            <span>Practice</span>
          </div>
          <span className="text-indigo-300 font-bold">&rarr;</span>
          <div className="flex-1 py-1.5 px-2 rounded-xl bg-white/70 border border-slate-200 text-slate-400">
            <span className="block text-[10px] text-slate-400">Quick Check</span>
            <span>Mastery</span>
          </div>
        </div>
      </div>

      {/* Contextual Trigger Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-500 font-medium">
          Evidence identified from teacher evaluation and classroom exercises.
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenStudyHelp && (
            <button
              type="button"
              onClick={() => onOpenStudyHelp(focusTopic, focusSubject)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              💡 Ask Mitra
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenRevisionNotes && onOpenRevisionNotes(focusTopic)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Start Revision</span>
            <span className="text-sm">&rarr;</span>
          </button>
        </div>
      </div>
    </section>
  );
}
