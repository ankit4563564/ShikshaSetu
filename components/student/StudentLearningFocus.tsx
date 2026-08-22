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
  onOpenRevisionMaps?: () => void;
  onOpenStudyHelp?: () => void;
}

export default function StudentLearningFocus({
  grades = [],
  onOpenRevisionMaps,
  onOpenStudyHelp,
}: StudentLearningFocusProps) {
  // Analyze grades to find weak areas (< 80% score or lowest score)
  const evaluatedGrades = grades
    .filter((g) => (g.maxScore || g.max_score || 0) > 0)
    .map((g) => {
      const max = g.maxScore || g.max_score || 100;
      const pct = Math.round((g.score / max) * 100);
      const name = g.assessmentName || g.assessment_name || 'Assessment';
      return {
        ...g,
        percentage: pct,
        name,
      };
    });

  // Find lowest scoring topic or anything below 80%
  const lowestGrade = evaluatedGrades.length > 0
    ? [...evaluatedGrades].sort((a, b) => a.percentage - b.percentage)[0]
    : null;

  const hasFocusArea = lowestGrade && lowestGrade.percentage < 85;

  return (
    <section className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl transition-all">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-deep-teal/60">
            Priority 3 · What you should study
          </p>
          <h2 className="font-display text-base font-black text-deep-teal">
            Your Learning Focus
          </h2>
        </div>
        {hasFocusArea && (
          <span className="rounded-full bg-warm-clay/10 border border-warm-clay/20 px-3 py-1 text-xs font-extrabold text-warm-clay">
            Topic to strengthen
          </span>
        )}
      </div>

      {hasFocusArea ? (
        <div className="rounded-xl border border-warm-clay/20 bg-gradient-to-r from-warm-clay/5 via-white to-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-warm-clay/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-warm-clay">
                  {lowestGrade.subject}
                </span>
                <span className="text-xs font-bold text-muted">
                  Recent assessment: {lowestGrade.percentage}% ({lowestGrade.score}/{lowestGrade.maxScore || lowestGrade.max_score})
                </span>
              </div>
              <p className="text-sm font-extrabold text-deep-teal">
                {lowestGrade.name}
              </p>
              <p className="text-xs font-medium text-muted">
                Strengthening this topic will boost your upcoming term assessment confidence.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
              {onOpenRevisionMaps && (
                <button
                  type="button"
                  onClick={onOpenRevisionMaps}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-deep-teal px-3.5 py-2 text-xs font-extrabold text-white shadow-2xs transition hover:bg-deep-teal/90 active:scale-95 cursor-pointer"
                >
                  <span>🗺️ Revise Mind Map</span>
                </button>
              )}
              {onOpenStudyHelp && (
                <button
                  type="button"
                  onClick={onOpenStudyHelp}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-deep-teal/20 bg-white px-3 py-2 text-xs font-bold text-deep-teal transition hover:bg-deep-teal/5 cursor-pointer"
                >
                  <span>Ask Doubt</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 text-center">
          <span className="text-2xl block mb-1">📖</span>
          <p className="text-xs font-extrabold text-deep-teal">
            {evaluatedGrades.length === 0
              ? 'Your learning focus will appear after you complete a few practice activities.'
              : 'Great work! All your recent assessment scores are on track.'}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-muted max-w-md mx-auto">
            {evaluatedGrades.length === 0
              ? 'Complete assignments and practice tests to receive targeted topic recommendations.'
              : 'Review your visual mind maps or ask doubt questions anytime to stay ahead.'}
          </p>
          {onOpenRevisionMaps && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onOpenRevisionMaps}
                className="inline-flex items-center gap-1.5 rounded-xl border border-deep-teal/15 bg-white px-3 py-1.5 text-xs font-extrabold text-deep-teal hover:bg-deep-teal/5 cursor-pointer shadow-2xs"
              >
                <span>Open Revision Maps</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
