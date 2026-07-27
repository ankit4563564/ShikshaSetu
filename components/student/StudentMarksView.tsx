'use client';

import { CardSkeleton } from '@/components/shared/SkeletonLoaders';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getStudentMarksAction,
  getStudentTrendAction,
  getExamsForStudentAction,
  type ExamRecord,
} from '@/app/actions/marksActions';
import { generatePerformanceSummary } from '@/lib/ai/performanceSummary';
import { fadeSlideUp, staggerContainer } from '@/lib/animations';

interface StudentMarksViewProps {
  studentId: string;
  studentName: string;
}

interface MarkEntry {
  id: string;
  subject: string;
  assessmentName: string;
  examName: string;
  score: number;
  maxScore: number;
  percentage: number;
  examDate: string;
  isPublished: boolean;
  publishedAt: string | null;
}

export default function StudentMarksView({ studentId, studentName }: StudentMarksViewProps) {
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [trend, setTrend] = useState<{ percentage: number; assessmentName: string; date: string }[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStudentMarksAction(studentId);
        setMarks(data);
        const uniqueSubjects = [...new Set(data.map(m => m.subject))];
        setSubjects(uniqueSubjects);
        if (uniqueSubjects.length > 0) {
          setSelectedSubject(uniqueSubjects[0]);
        }
      } catch (err) {
        console.error('Failed to load marks:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  useEffect(() => {
    if (!selectedSubject) return;
    const loadTrend = async () => {
      try {
        const data = await getStudentTrendAction(studentId, selectedSubject);
        setTrend(data);

        const allSubjectMarks = marks.filter(m => m.subject === selectedSubject);
        const classAvg = allSubjectMarks.length > 0
          ? Math.round(allSubjectMarks.reduce((s, m) => s + m.percentage, 0) / allSubjectMarks.length)
          : 0;

        const aiSummary = await generatePerformanceSummary(
          studentName.split(' ')[0],
          selectedSubject,
          data,
          classAvg
        );
        setSummary(aiSummary);
      } catch {
        setTrend([]);
        setSummary(null);
      }
    };
    loadTrend();
  }, [selectedSubject, studentId, studentName, marks]);

  const subjectStats = (subject: string) => {
    const subjectMarks = marks.filter(m => m.subject === subject);
    if (subjectMarks.length === 0) return null;
    const percentages = subjectMarks.map(m => m.percentage);
    return {
      average: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
      count: subjectMarks.length,
    };
  };

  if (loading) {
    return <CardSkeleton className="my-6" />;
  }

  if (marks.length === 0) {
    return (
      <div className="rounded-2xl border border-deep-teal/10 bg-[#F8FAFC] p-8 text-center space-y-1">
        <p className="text-sm font-bold text-deep-teal">✨ You&apos;re All Caught Up!</p>
        <p className="text-xs text-deep-teal/60">Your exam scores and subject grade feedback will show up here once evaluations are released.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject-wise summary cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {subjects.map(subject => {
          const stats = subjectStats(subject);
          if (!stats) return null;
          return (
            <motion.button
              key={subject}
              variants={fadeSlideUp}
              type="button"
              onClick={() => {
                setSelectedSubject(subject);
                setExpandedSubject(expandedSubject === subject ? null : subject);
              }}
              className={`rounded-2xl border p-4 text-left transition-all ${
                selectedSubject === subject
                  ? 'border-primary/30 bg-primary/5 shadow-sm'
                  : 'border-white/80 bg-white/70 hover:shadow-sm backdrop-blur-xl'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/50">{subject}</p>
              <p className={`mt-1 text-2xl font-extrabold ${
                stats.average >= 75 ? 'text-sage' :
                stats.average >= 50 ? 'text-marigold' :
                'text-warm-clay'
              }`}>{stats.average}%</p>
              <p className="mt-0.5 text-[10px] text-deep-teal/40">{stats.count} assessments</p>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected subject detail */}
      {selectedSubject && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* AI Performance Summary */}
          {summary && (
            <div className="rounded-2xl border border-primary/10 bg-primary/[0.02] p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary/50">AI Performance Summary</p>
              <p className="mt-2 text-sm leading-relaxed text-deep-teal/80">{summary}</p>
            </div>
          )}

          {/* Trend Line - score history */}
          {trend.length > 0 && (
            <div className="rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">Score Trend</p>
              <div className="mt-4 flex items-end gap-2" style={{ height: 120 }}>
                {trend.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-[9px] font-bold ${
                      t.percentage >= 75 ? 'text-sage' :
                      t.percentage >= 50 ? 'text-marigold' :
                      'text-warm-clay'
                    }`}>{t.percentage}%</span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        t.percentage >= 75 ? 'bg-sage' :
                        t.percentage >= 50 ? 'bg-marigold' :
                        'bg-warm-clay'
                      }`}
                      style={{ height: `${t.percentage}%`, maxHeight: 80, minHeight: 4 }}
                    />
                    <span className="text-[7px] font-bold text-deep-teal/30 uppercase tracking-wider text-center leading-tight">
                      {t.assessmentName.length > 12 ? t.assessmentName.slice(0, 12) + '…' : t.assessmentName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All marks in this subject */}
          <div className="space-y-2">
            {marks.filter(m => m.subject === selectedSubject).map(mark => (
              <div key={mark.id} className="rounded-xl border border-white/80 bg-white/70 p-4 flex items-center justify-between backdrop-blur-xl">
                <div>
                  <p className="text-sm font-bold text-deep-teal">{mark.examName}</p>
                  <p className="text-xs text-deep-teal/40">{mark.assessmentName} · {mark.examDate}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-extrabold ${
                    mark.percentage >= 75 ? 'text-sage' :
                    mark.percentage >= 50 ? 'text-marigold' :
                    'text-warm-clay'
                  }`}>{mark.percentage}%</span>
                  <p className="text-[10px] text-deep-teal/40">{mark.score}/{mark.maxScore}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
