'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStudentMarksAction,
  getStudentTrendAction,
} from '@/app/actions/marksActions';
import { explainStudentPerformanceAction, type AcademicExplanationResult } from '@/app/actions/parentAiActions';
import { CardSkeleton } from '@/components/shared/SkeletonLoaders';

interface ParentMarksViewProps {
  studentId: string;
  studentName: string;
}

export default function ParentMarksView({ studentId, studentName }: ParentMarksViewProps) {
  const [marks, setMarks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<AcademicExplanationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiCard, setShowAiCard] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getStudentMarksAction(studentId);
        setMarks(data || []);
        const uniqueSubjects = [...new Set((data || []).map((m: any) => m.subject))];
        setSubjects(uniqueSubjects);
        if (uniqueSubjects.length > 0) setSelectedSubject(uniqueSubjects[0]);

        // Fetch AI Explanation
        setAiLoading(true);
        const aiRes = await explainStudentPerformanceAction(studentId);
        if (aiRes.success && aiRes.explanation) {
          setAiExplanation(aiRes.explanation);
        }
      } catch (err) {
        console.error('Failed to load marks:', err);
      } finally {
        setLoading(false);
        setAiLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (loading) {
    return <CardSkeleton className="my-4" />;
  }

  // Calculate Overall Average
  const totalPercentage = marks.length > 0
    ? Math.round(marks.reduce((acc, curr) => acc + curr.percentage, 0) / marks.length)
    : 0;

  if (marks.length === 0) {
    return (
      <div className="rounded-3xl border border-deep-teal/10 bg-white p-8 text-center space-y-2 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-deep-teal/5 text-deep-teal text-2xl flex items-center justify-center mx-auto">
          📊
        </div>
        <h4 className="font-display text-sm font-extrabold text-deep-teal">
          Academic Results Pending
        </h4>
        <p className="font-body text-xs text-deep-teal/60 max-w-sm mx-auto">
          Term evaluations for {studentName.split(' ')[0]} will appear here as soon as subject teachers officially publish assessment scores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Overall Summary Header ── */}
      <div className="rounded-3xl bg-gradient-to-br from-deep-teal to-teal-800 text-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70 block">
              Cumulative Term Average
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white">
                {totalPercentage}%
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                {totalPercentage >= 75 ? '✓ Strong Standing' : 'Needs Practice'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold border border-white/10">
              {marks.length} Assessments
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, totalPercentage))}%` }}
          />
        </div>
      </div>

      {/* ── AI Performance Explainer Card ── */}
      {showAiCard && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white border border-teal-600/20 p-5 shadow-xs space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-deep-teal">
                AI Performance Explanation for Parents
              </h4>
            </div>
            <span className="text-[9px] font-bold text-deep-teal/40 uppercase font-mono">
              Grounded in Real Marks
            </span>
          </div>

          {aiLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-4 bg-deep-teal/5 rounded animate-pulse w-full" />
              <div className="h-4 bg-deep-teal/5 rounded animate-pulse w-4/5" />
            </div>
          ) : aiExplanation ? (
            <div className="space-y-3 text-xs">
              <p className="font-body text-deep-teal/80 leading-relaxed font-medium">
                {aiExplanation.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                    🌟 Strongest Subjects
                  </span>
                  <p className="text-emerald-900 font-semibold">
                    {aiExplanation.strongSubjects.join(', ')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                    🎯 Practice Focus
                  </span>
                  <p className="text-amber-900 font-semibold">
                    {aiExplanation.focusSubjects.join(', ')}
                  </p>
                </div>
              </div>

              {aiExplanation.actionPlan && aiExplanation.actionPlan.length > 0 && (
                <div className="pt-2 border-t border-deep-teal/5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-deep-teal/60 block mb-1.5">
                    💡 Suggested Steps for Home:
                  </span>
                  <ul className="space-y-1 text-[11px] text-deep-teal/70 font-medium list-disc list-inside">
                    {aiExplanation.actionPlan.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </motion.div>
      )}

      {/* ── Subject Chips Grid ── */}
      <div className="space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-deep-teal/50 px-1 block">
          Subject Breakdown
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {subjects.map((subject) => {
            const subjectMarks = marks.filter((m) => m.subject === subject);
            const avg = subjectMarks.length > 0
              ? Math.round(subjectMarks.reduce((s, m) => s + m.percentage, 0) / subjectMarks.length)
              : 0;

            const isSelected = selectedSubject === subject;

            return (
              <button
                key={subject}
                type="button"
                onClick={() => setSelectedSubject(subject)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-deep-teal bg-deep-teal/10 shadow-xs'
                    : 'border-deep-teal/10 bg-white hover:border-deep-teal/30 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-deep-teal truncate">
                    {subject}
                  </span>
                  <span
                    className={`font-mono text-xs font-black ${
                      avg >= 75 ? 'text-emerald-700' : avg >= 50 ? 'text-amber-700' : 'text-rose-700'
                    }`}
                  >
                    {avg}%
                  </span>
                </div>
                <div className="w-full bg-deep-teal/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      avg >= 75 ? 'bg-emerald-500' : avg >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${avg}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Assessment Details List for Selected Subject ── */}
      {selectedSubject && (
        <div className="rounded-3xl bg-white border border-deep-teal/10 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
            <h4 className="font-display text-sm font-extrabold text-deep-teal">
              {selectedSubject} Assessments
            </h4>
            <span className="text-[10px] text-deep-teal/40 font-bold uppercase">
              {marks.filter((m) => m.subject === selectedSubject).length} Recorded Tests
            </span>
          </div>

          <div className="space-y-2">
            {marks
              .filter((m) => m.subject === selectedSubject)
              .map((mark) => (
                <div
                  key={mark.id}
                  className="p-3 rounded-2xl bg-paper border border-deep-teal/5 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="font-display text-xs font-bold text-deep-teal">
                      {mark.examName || mark.assessmentName}
                    </p>
                    <p className="text-[10px] text-deep-teal/50 font-medium">
                      Date: {mark.examDate || 'Term 1'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-black text-deep-teal">
                      {mark.score} / {mark.maxScore}
                    </span>
                    <span
                      className={`block text-[10px] font-bold ${
                        mark.percentage >= 75
                          ? 'text-emerald-700'
                          : mark.percentage >= 50
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {mark.percentage}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
