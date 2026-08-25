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
  onOpenRevisionNotes?: () => void;
  onOpenStudyHelp?: () => void;
}

export default function StudentLearningFocus({
  grades = [],
  onOpenRevisionNotes,
  onOpenStudyHelp,
}: StudentLearningFocusProps) {
  // Analyze grades to find weak areas
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

  const weakSubjects = subjectAverages.filter((s) => s.average < 80);
  const hasWeakAreas = weakSubjects.length > 0;

  return (
    <section className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl transition-all">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-deep-teal/60">
            What you should study
          </p>
          <h2 className="font-display text-base font-black text-deep-teal">
            Learning Focus
          </h2>
        </div>
        {hasWeakAreas && (
          <span className="rounded-full bg-warm-clay/10 border border-warm-clay/20 px-3 py-1 text-xs font-extrabold text-warm-clay">
            {weakSubjects.length} area{weakSubjects.length !== 1 ? 's' : ''} to strengthen
          </span>
        )}
      </div>

      {hasWeakAreas ? (
        <div className="space-y-3">
          {weakSubjects.slice(0, 3).map((subject) => (
            <div
              key={subject.subject}
              className="rounded-xl border border-warm-clay/15 bg-gradient-to-r from-warm-clay/5 via-white to-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-warm-clay/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-warm-clay">
                      {subject.subject}
                    </span>
                    <span className="text-xs font-bold text-muted">
                      Average: {subject.average}%
                    </span>
                  </div>
                  <p className="text-sm font-bold text-deep-teal">
                    {subject.subject} needs attention
                  </p>
                  <p className="text-xs text-muted">
                    Your recent results suggest this is one of your weaker areas.
                    {subject.assessments > 1 && ` Based on ${subject.assessments} assessments.`}
                  </p>
                  <p className="text-xs font-semibold text-deep-teal/80">
                    Recommended: Practice {subject.subject} for 15 minutes.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  {onOpenRevisionNotes && (
                    <button
                      type="button"
                      onClick={onOpenRevisionNotes}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-deep-teal px-3.5 py-2 text-xs font-extrabold text-white shadow-2xs transition hover:bg-deep-teal/90 active:scale-95 cursor-pointer"
                    >
                      Start Revision →
                    </button>
                  )}
                  {onOpenStudyHelp && (
                    <button
                      type="button"
                      onClick={onOpenStudyHelp}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-deep-teal/20 bg-white px-3 py-2 text-xs font-bold text-deep-teal transition hover:bg-deep-teal/5 cursor-pointer"
                    >
                      Ask Doubt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 text-center">
          <span className="text-2xl block mb-1">📖</span>
          <p className="text-xs font-extrabold text-deep-teal">
            {evaluatedGrades.length === 0
              ? 'Your learning focus will appear after your first assessment.'
              : 'Great work! All your recent scores are on track.'}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-muted max-w-md mx-auto">
            {evaluatedGrades.length === 0
              ? 'Complete assignments and practice tests to receive targeted recommendations.'
              : 'Keep it up. Use AI revision notes or ask doubts anytime to stay ahead.'}
          </p>
          {onOpenRevisionNotes && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onOpenRevisionNotes}
                className="inline-flex items-center gap-1.5 rounded-xl border border-deep-teal/15 bg-white px-3 py-1.5 text-xs font-extrabold text-deep-teal hover:bg-deep-teal/5 cursor-pointer shadow-2xs"
              >
                <span>Open Revision Notes 📚</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
