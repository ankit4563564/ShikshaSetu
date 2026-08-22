'use client';

import React from 'react';

export interface StudentGradeRecord {
  id?: string;
  subject: string;
  score: number;
  maxScore?: number;
  max_score?: number;
}

interface StudentProgressSummaryProps {
  grades: StudentGradeRecord[];
}

export default function StudentProgressSummary({
  grades = [],
}: StudentProgressSummaryProps) {
  // Group grades by subject and calculate average percentage
  const subjectMap = new Map<string, { totalPct: number; count: number }>();

  grades.forEach((g) => {
    const max = g.maxScore || g.max_score || 100;
    if (max > 0 && typeof g.score === 'number') {
      const pct = Math.round((g.score / max) * 100);
      const current = subjectMap.get(g.subject) || { totalPct: 0, count: 0 };
      subjectMap.set(g.subject, {
        totalPct: current.totalPct + pct,
        count: current.count + 1,
      });
    }
  });

  const subjectAverages = Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    average: Math.round(data.totalPct / data.count),
    assessmentsCount: data.count,
  }));

  return (
    <section className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl transition-all flex flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-deep-teal/60">
              Priority 5 · Performance
            </p>
            <h2 className="font-display text-base font-black text-deep-teal">
              Your Progress
            </h2>
          </div>
          {subjectAverages.length > 0 && (
            <span className="text-[11px] font-bold text-muted">
              {subjectAverages.length} subjects
            </span>
          )}
        </div>

        {subjectAverages.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
            <span className="text-xl block mb-1">📊</span>
            <p className="text-xs font-bold text-deep-teal">No graded evaluations yet</p>
            <p className="text-[11px] text-muted">
              Subject mastery will appear once teacher evaluations are recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subjectAverages.map((item) => (
              <div key={item.subject} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-deep-teal">{item.subject}</span>
                  <span className="text-deep-teal font-mono">{item.average}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.average >= 75
                        ? 'bg-sage'
                        : item.average >= 50
                        ? 'bg-marigold'
                        : 'bg-warm-clay'
                    }`}
                    style={{ width: `${Math.min(100, item.average)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
