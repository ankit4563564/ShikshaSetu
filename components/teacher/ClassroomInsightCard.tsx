'use client';

import React, { useState, useEffect } from 'react';
import {
  generateClassroomInsightsAction,
  getWhatShouldITeachNextAction,
  type ClassroomInsightResult,
  type WhatShouldITeachNextResult,
} from '@/app/actions/teacherAiActions';

interface ClassroomInsightCardProps {
  grade: string;
  section: string;
  totalStudents: number;
  needsAttentionCount: number;
  worthWatchingCount: number;
  onTrackCount: number;
  onOpenToolkitTab?: (tab: 'lesson' | 'differentiation' | 'exit_ticket' | 'explain_differently') => void;
}

export default function ClassroomInsightCard({
  grade,
  section,
  totalStudents,
  needsAttentionCount,
  worthWatchingCount,
  onTrackCount,
  onOpenToolkitTab,
}: ClassroomInsightCardProps) {
  const [insight, setInsight] = useState<ClassroomInsightResult | null>(null);
  const [nextTeach, setNextTeach] = useState<WhatShouldITeachNextResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const [resInsight, resNext] = await Promise.all([
          generateClassroomInsightsAction({
            grade,
            section,
            studentsSummary: {
              totalStudents,
              needsAttentionCount,
              worthWatchingCount,
              onTrackCount,
              averageAttendancePct: 96,
              averageGradePct: 84,
            },
          }),
          getWhatShouldITeachNextAction(grade, section),
        ]);

        if (resInsight.success && resInsight.insight) {
          setInsight(resInsight.insight);
        }
        if (resNext.success && resNext.recommendation) {
          setNextTeach(resNext.recommendation);
        }
      } catch (err) {
        console.error('Failed to load classroom insights:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, [grade, section, totalStudents, needsAttentionCount, worthWatchingCount, onTrackCount]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded-md" />
        <div className="h-3 w-48 bg-slate-100 rounded-md" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <section className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm shadow-xs font-black">
            📊
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 block">
              Classroom Intelligence • Class {grade}{section}
            </span>
            <h3 className="font-display text-sm sm:text-base font-black text-slate-900">
              {insight.headline}
            </h3>
          </div>
        </div>

        {/* Quick Toolkit Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenToolkitTab && (
            <>
              <button
                type="button"
                onClick={() => onOpenToolkitTab('exit_ticket')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1 border border-indigo-200"
              >
                <span>⭐</span>
                <span>Exit Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenToolkitTab('explain_differently')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1 border border-indigo-200"
              >
                <span>🧠</span>
                <span>Explain Differently</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenToolkitTab('lesson')}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>📖</span>
                <span>Lesson Plan</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🎯 "What Should I Teach Next?" Prominent Card */}
      {nextTeach && (
        <div className="p-4 bg-gradient-to-r from-amber-50/80 via-white to-white border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <h4 className="font-display text-xs font-black text-amber-950 uppercase tracking-wide">
                What Should I Teach Next?
              </h4>
              <span className="text-[10px] text-amber-700 font-medium font-mono">
                {nextTeach.evidenceSource}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-bold">
              {nextTeach.gapObservation}
            </p>
            <p className="text-[11px] text-indigo-900 font-semibold">
              💡 {nextTeach.recommendedAction}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenToolkitTab && (
              <button
                type="button"
                onClick={() => onOpenToolkitTab(nextTeach.actionType === 'exit_ticket' ? 'exit_ticket' : 'explain_differently')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {nextTeach.actionType === 'exit_ticket' ? 'Create Exit Ticket →' : 'Plan Revision →'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Facts vs Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Facts Column */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">📌</span>
            <h4 className="font-display text-xs font-extrabold text-slate-700 uppercase tracking-wide">
              What the Data Shows (Facts)
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
            {insight.facts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations Column */}
        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">💡</span>
            <h4 className="font-display text-xs font-extrabold text-indigo-900 uppercase tracking-wide">
              Suggested Teaching Actions
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
            {insight.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&rarr;</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
