'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMarksOverviewAction } from '@/app/actions/marksActions';

interface SubjectBreakdown {
  subject: string;
  avg: number;
  passRate: number;
}

interface ExamAnalytics {
  examId: string;
  examName: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  subjectBreakdown: SubjectBreakdown[];
}

export default function AdminMarksAnalytics() {
  const [analytics, setAnalytics] = useState<ExamAnalytics[]>([]);
  const [overview, setOverview] = useState<{ totalExams: number; totalMarks: number; overallAvg: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const examOverviews = await getMarksOverviewAction() as any[];
        setAnalytics(examOverviews.map((eo: any) => ({
          examId: eo.examId,
          examName: eo.examName,
          totalStudents: eo.totalStudents,
          averageScore: eo.classAverage,
          highestScore: eo.highestScore,
          lowestScore: eo.lowestScore,
          passRate: 0,
          subjectBreakdown: [],
        })));

        if (examOverviews.length > 0) {
          const totalMarks = examOverviews.reduce((s: number, eo: any) => s + eo.totalStudents, 0);
          const totalExams = examOverviews.length;
          const overallAvg = examOverviews.length > 0
            ? Math.round(examOverviews.reduce((s: number, eo: any) => s + eo.classAverage, 0) / examOverviews.length)
            : 0;
          setOverview({ totalExams, totalMarks, overallAvg });
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
      </div>
    );
  }

  if (analytics.length === 0 && !overview) {
    return (
      <div className="rounded-2xl border border-deep-teal/10 bg-white/50 p-8 text-center">
        <p className="text-sm font-semibold text-deep-teal/40">No exam data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      {overview && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">Total Exams</p>
            <p className="mt-1 text-2xl font-extrabold text-deep-teal">{overview.totalExams}</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">Total Marks</p>
            <p className="mt-1 text-2xl font-extrabold text-deep-teal">{overview.totalMarks}</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">Overall Avg</p>
            <p className={`mt-1 text-2xl font-extrabold ${
              overview.overallAvg >= 75 ? 'text-sage' :
              overview.overallAvg >= 50 ? 'text-marigold' : 'text-warm-clay'
            }`}>{overview.overallAvg}%</p>
          </div>
        </div>
      )}

      {/* Per-exam analytics */}
      <div className="space-y-4">
        {analytics.map(exam => (
          <motion.div
            key={exam.examId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-deep-teal">{exam.examName}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                exam.averageScore >= 75 ? 'bg-sage/10 text-sage' :
                exam.averageScore >= 50 ? 'bg-marigold/10 text-marigold' :
                'bg-warm-clay/10 text-warm-clay'
              }`}>{exam.averageScore}% avg</span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <p className="text-[9px] font-bold uppercase text-deep-teal/40">Students</p>
                <p className="text-sm font-extrabold text-deep-teal">{exam.totalStudents}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-deep-teal/40">Highest</p>
                <p className="text-sm font-extrabold text-sage">{exam.highestScore}%</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-deep-teal/40">Lowest</p>
                <p className="text-sm font-extrabold text-warm-clay">{exam.lowestScore}%</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-deep-teal/40">Pass Rate</p>
                <p className={`text-sm font-extrabold ${
                  exam.passRate >= 75 ? 'text-sage' : 'text-marigold'
                }`}>{exam.passRate}%</p>
              </div>
            </div>

            {/* Subject breakdown */}
            {exam.subjectBreakdown.length > 0 && (
              <div className="border-t border-deep-teal/5 pt-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 mb-2">By Subject</p>
                <div className="grid grid-cols-2 gap-2">
                  {exam.subjectBreakdown.map(sub => (
                    <div key={sub.subject} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-deep-teal/70">{sub.subject}</span>
                      <span className={`text-xs font-extrabold ${
                        sub.avg >= 75 ? 'text-sage' : sub.avg >= 50 ? 'text-marigold' : 'text-warm-clay'
                      }`}>{sub.avg}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
