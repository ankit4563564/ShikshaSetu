'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toast } from '@/components/shared/Toast';
import { TableRowSkeleton } from '@/components/shared/SkeletonLoaders';
import {
  createExamAction,
  updateMarksAction,
  publishExamAction,
  getExamsAction,
  getExamMarksAction,
  getExamAnalyticsAction,
  type ExamRecord,
  type GradeRecord,
  type ExamAnalytics,
} from '@/app/actions/marksActions';

interface TeacherMarksPanelProps {
  teacherId?: string;
}

type PanelView = 'list' | 'create' | 'edit' | 'analytics';

export default function TeacherMarksPanel({ teacherId }: TeacherMarksPanelProps) {
  const [view, setView] = useState<PanelView>('list');
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExamsAction(teacherId);
      setExams(data);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleCreateExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await createExamAction(formData);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Exam created successfully!', type: 'success' });
      form.reset();
      setView('list');
      loadExams();
    }
  };

  const handleOpenExam = async (exam: ExamRecord) => {
    setSelectedExam(exam);
    setView('edit');
    try {
      const marks = await getExamMarksAction(exam.id);
      setGrades(marks);

      const examAnalytics = await getExamAnalyticsAction(exam.id);
      setAnalytics(examAnalytics);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleScoreChange = (gradeId: string, score: number) => {
    setGrades(prev =>
      prev.map(g =>
        g.id === gradeId
          ? { ...g, score, percentage: g.maxScore > 0 ? Math.round((score / g.maxScore) * 100) : 0 }
          : g
      )
    );
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) return;

    const updates = grades.map(g => ({
      gradeId: g.id,
      score: g.score,
    }));

    const result = await updateMarksAction(selectedExam.id, updates);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Marks saved!', type: 'success' });
    }
  };

  const handlePublish = async () => {
    if (!selectedExam) return;

    const result = await publishExamAction(selectedExam.id);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Marks published! Parents and students can now view them.', type: 'success' });
      setSelectedExam({ ...selectedExam, isPublished: true });
      loadExams();
    }
  };

  if (view === 'create') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/55">Create New Exam</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-deep-teal">New Assessment</h2>
          </div>
          <button type="button" onClick={() => setView('list')} className="rounded-xl border border-deep-teal/20 bg-white px-4 py-2 text-xs font-bold text-deep-teal hover:bg-deep-teal/5">← Back</button>
        </div>

        <form onSubmit={handleCreateExam} className="space-y-5 rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-deep-teal/60">Subject *</label>
              <select name="subject" required className="mt-1 w-full rounded-xl border border-deep-teal/20 bg-white px-4 py-3 text-sm font-semibold text-deep-teal">
                <option value="">Select subject</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Social Studies">Social Studies</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-deep-teal/60">Exam Name *</label>
              <input type="text" name="examName" required placeholder="e.g. Unit Test 3" className="mt-1 w-full rounded-xl border border-deep-teal/20 bg-white px-4 py-3 text-sm font-semibold text-deep-teal" />
            </div>
            <div>
              <label className="text-xs font-bold text-deep-teal/60">Max Score *</label>
              <input type="number" name="maxScore" required min="1" step="0.01" placeholder="e.g. 50" className="mt-1 w-full rounded-xl border border-deep-teal/20 bg-white px-4 py-3 text-sm font-semibold text-deep-teal" />
            </div>
            <div>
              <label className="text-xs font-bold text-deep-teal/60">Exam Date *</label>
              <input type="date" name="examDate" required className="mt-1 w-full rounded-xl border border-deep-teal/20 bg-white px-4 py-3 text-sm font-semibold text-deep-teal" />
            </div>
            <div>
              <label className="text-xs font-bold text-deep-teal/60">Class / Grade *</label>
              <input type="text" name="classGrade" required placeholder="e.g. 8" className="mt-1 w-full rounded-xl border border-deep-teal/20 bg-white px-4 py-3 text-sm font-semibold text-deep-teal" />
            </div>
            <div>
              <label className="text-xs font-bold text-deep-teal/60">Section</label>
              <input type="text" name="classSection" placeholder="e.g. A (optional)" className="mt-1 w-full rounded-xl border border-deep-teal/20 bg-white px-4 py-3 text-sm font-semibold text-deep-teal" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary px-5 py-4 font-display text-base font-bold text-white shadow-md transition-all hover:bg-primary/90">Create Exam & Initialize Marks</button>
        </form>
        {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
      </motion.div>
    );
  }

  if (view === 'edit' && selectedExam) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/55">
              {selectedExam.subject} · {selectedExam.classGrade}{selectedExam.classSection ? `-${selectedExam.classSection}` : ''}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-deep-teal">{selectedExam.examName}</h2>
            <p className="text-xs text-deep-teal/50">Max Score: {selectedExam.maxScore} · Date: {selectedExam.examDate}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setView('list')} className="rounded-xl border border-deep-teal/20 bg-white px-4 py-2 text-xs font-bold text-deep-teal hover:bg-deep-teal/5">← Back</button>
            {!selectedExam.isPublished && (
              <button type="button" onClick={handlePublish} className="rounded-xl bg-sage px-4 py-2 text-xs font-bold text-white hover:bg-sage/90">Publish Marks</button>
            )}
          </div>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-deep-teal/10 bg-white p-3 text-center">
              <p className="text-2xl font-extrabold text-deep-teal">{analytics.classAverage}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">Class Average</p>
            </div>
            <div className="rounded-xl border border-sage/20 bg-sage/5 p-3 text-center">
              <p className="text-2xl font-extrabold text-sage">{analytics.highestScore}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sage/60">Highest</p>
            </div>
            <div className="rounded-xl border border-warm-clay/20 bg-warm-clay/5 p-3 text-center">
              <p className="text-2xl font-extrabold text-warm-clay">{analytics.lowestScore}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-clay/60">Lowest</p>
            </div>
            <div className="rounded-xl border border-marigold/20 bg-marigold/5 p-3 text-center">
              <p className="text-2xl font-extrabold text-marigold">{analytics.totalStudents}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-marigold/60">Students</p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="min-w-max w-full text-left text-sm">
              <thead className="sticky top-0 bg-deep-teal/5">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-deep-teal/50">Student</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-deep-teal/50">Score</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-deep-teal/50">Percentage</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-deep-teal/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-teal/5">
                {grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-deep-teal/[0.02]">
                    <td className="px-4 py-3 font-semibold text-deep-teal">{grade.studentName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={grade.maxScore}
                          step={0.5}
                          value={grade.score}
                          onChange={(e) => handleScoreChange(grade.id, parseFloat(e.target.value) || 0)}
                          disabled={selectedExam.isPublished}
                          className="w-20 rounded-lg border border-deep-teal/20 bg-white px-3 py-1.5 text-sm font-bold text-deep-teal disabled:opacity-50"
                        />
                        <span className="text-xs text-deep-teal/40">/ {grade.maxScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-extrabold ${
                        grade.percentage >= 75 ? 'text-sage' :
                        grade.percentage >= 50 ? 'text-marigold' :
                        'text-warm-clay'
                      }`}>
                        {grade.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {selectedExam.isPublished ? (
                        <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-bold text-sage">Published</span>
                      ) : (
                        <span className="rounded-full bg-marigold/10 px-2 py-0.5 text-[10px] font-bold text-marigold">Draft</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!selectedExam.isPublished && (
          <div className="flex gap-3">
            <button type="button" onClick={handleSaveMarks} className="flex-1 rounded-xl bg-primary px-5 py-4 font-display text-base font-bold text-white shadow-md transition-all hover:bg-primary/90">Save Marks</button>
            <button type="button" onClick={handlePublish} className="flex-1 rounded-xl bg-sage px-5 py-4 font-display text-base font-bold text-white shadow-md transition-all hover:bg-sage/90">Publish to Parents & Students</button>
          </div>
        )}

        {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
      </motion.div>
    );
  }

  if (view === 'analytics') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/55">Aggregated Analytics</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-deep-teal">All Exams Overview</h2>
          </div>
          <button type="button" onClick={() => setView('list')} className="rounded-xl border border-deep-teal/20 bg-white px-4 py-2 text-xs font-bold text-deep-teal hover:bg-deep-teal/5">← Back</button>
        </div>
        <div className="space-y-4">
          {exams.filter(e => e.isPublished).map(exam => (
            <div key={exam.id} className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-display text-base font-bold text-deep-teal">{exam.examName}</p>
                  <p className="text-xs text-deep-teal/50">{exam.subject} · {exam.examDate}</p>
                </div>
                <button type="button" onClick={() => handleOpenExam(exam)} className="rounded-xl border border-deep-teal/20 bg-white px-3 py-1.5 text-[10px] font-bold text-deep-teal hover:bg-deep-teal/5">View Details</button>
              </div>
            </div>
          ))}
          {exams.filter(e => e.isPublished).length === 0 && (
            <div className="rounded-2xl border border-deep-teal/10 bg-white/50 p-8 text-center">
              <p className="text-sm font-semibold text-deep-teal/40">No published exams yet. Create and publish an exam to see analytics.</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/55">Marks Management</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-deep-teal">My Exams</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setView('analytics')} className="rounded-xl border border-deep-teal/20 bg-white px-4 py-2 text-xs font-bold text-deep-teal hover:bg-deep-teal/5">Analytics</button>
          <button type="button" onClick={() => setView('create')} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90">+ New Exam</button>
        </div>
      </div>

      {loading ? (
        <TableRowSkeleton rows={4} />
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-deep-teal/10 bg-white/50 p-12 text-center">
          <p className="text-lg font-display font-bold text-deep-teal/40">No exams yet</p>
          <p className="mt-1 text-sm text-deep-teal/30">Create your first exam to start managing marks.</p>
          <button type="button" onClick={() => setView('create')} className="mt-4 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90">+ Create Exam</button>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleOpenExam(exam)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${
                    exam.isPublished ? 'bg-sage/10 text-sage' : 'bg-marigold/10 text-marigold'
                  }`}>
                    {exam.isPublished ? '📊' : '📝'}
                  </div>
                  <div>
                    <p className="font-display text-base font-bold text-deep-teal">{exam.examName}</p>
                    <p className="text-xs text-deep-teal/50">
                      {exam.subject} · {exam.classGrade}{exam.classSection ? `-${exam.classSection}` : ''} · {exam.examDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    exam.isPublished
                      ? 'bg-sage/10 text-sage'
                      : 'bg-marigold/10 text-marigold'
                  }`}>
                    {exam.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-deep-teal/20 text-lg">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
