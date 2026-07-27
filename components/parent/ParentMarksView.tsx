'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getStudentMarksAction,
  getStudentTrendAction,
} from '@/app/actions/marksActions';
import { generatePerformanceSummary } from '@/lib/ai/performanceSummary';
import { CardSkeleton } from '@/components/shared/SkeletonLoaders';
import { fadeSlideUp, staggerContainer } from '@/lib/animations';

interface ParentMarksViewProps {
  studentId: string;
  studentName: string;
}

export default function ParentMarksView({ studentId, studentName }: ParentMarksViewProps) {
  const [marks, setMarks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStudentMarksAction(studentId);
        setMarks(data);
        const uniqueSubjects = [...new Set(data.map((m: any) => m.subject))];
        setSubjects(uniqueSubjects);
        if (uniqueSubjects.length > 0) setSelectedSubject(uniqueSubjects[0]);
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
        const subjectMarks = marks.filter((m: any) => m.subject === selectedSubject);
        const classAvg = subjectMarks.length > 0
          ? Math.round(subjectMarks.reduce((s: number, m: any) => s + m.percentage, 0) / subjectMarks.length)
          : 0;
        const aiSummary = await generatePerformanceSummary(
          studentName.split(' ')[0],
          selectedSubject,
          data,
          classAvg
        );
        setSummary(aiSummary);
      } catch {
        setSummary(null);
      }
    };
    loadTrend();
  }, [selectedSubject, studentId, studentName, marks]);

  if (loading) {
    return <CardSkeleton className="my-4" />;
  }

  if (marks.length === 0) {
    return (
      <div className="rounded-xl border border-deep-teal/10 bg-white/50 p-6 text-center">
        <p className="text-sm font-semibold text-deep-teal/40">No published marks yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2">
        {subjects.map(subject => {
          const subjectMarks = marks.filter((m: any) => m.subject === subject);
          const avg = subjectMarks.length > 0
            ? Math.round(subjectMarks.reduce((s: number, m: any) => s + m.percentage, 0) / subjectMarks.length)
            : 0;
          return (
            <motion.button
              key={subject}
              variants={fadeSlideUp}
              type="button"
              onClick={() => setSelectedSubject(subject)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedSubject === subject
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-white/80 bg-white/70 backdrop-blur-xl hover:shadow-sm'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/50">{subject}</p>
              <p className={`mt-1 text-lg font-extrabold ${
                avg >= 75 ? 'text-sage' : avg >= 50 ? 'text-marigold' : 'text-warm-clay'
              }`}>{avg}%</p>
            </motion.button>
          );
        })}
      </motion.div>

      {selectedSubject && summary && (
        <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary/50">Performance Summary</p>
          <p className="mt-1 text-sm leading-relaxed text-deep-teal/80">{summary}</p>
        </div>
      )}

      {selectedSubject && (
        <div className="space-y-2">
          {marks.filter((m: any) => m.subject === selectedSubject).map((mark: any) => (
            <div key={mark.id} className="rounded-xl border border-white/80 bg-white/70 p-3 flex items-center justify-between backdrop-blur-xl">
              <div>
                <p className="text-sm font-bold text-deep-teal">{mark.examName}</p>
                <p className="text-xs text-deep-teal/40">{mark.examDate}</p>
              </div>
              <span className={`text-base font-extrabold ${
                mark.percentage >= 75 ? 'text-sage' : mark.percentage >= 50 ? 'text-marigold' : 'text-warm-clay'
              }`}>{mark.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
