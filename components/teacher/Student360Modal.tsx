'use client';

import { useState, useEffect } from 'react';
import type { Student360Data } from '@/lib/student360/getStudent360';
import { approveSupportPlanAction } from '@/app/actions/interventionActions';
import { fetchStudent360Action } from '@/app/actions/student360Actions';

interface Student360ModalProps {
  readonly initialData?: Student360Data | null;
  readonly studentId?: string | null;
  readonly onClose: () => void;
  readonly onInterventionCreated?: () => void;
}

interface InterventionFormData {
  actionTitle: string;
  category: string;
  priority: string;
  goal: string;
  reviewDate: string;
  notes: string;
}

export default function Student360Modal({
  initialData,
  studentId,
  onClose,
  onInterventionCreated,
}: Student360ModalProps) {
  const [data, setData] = useState<Student360Data | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData && !!studentId);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'timeline'>('overview');
  
  // Review/Edit Form state
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<InterventionFormData>({
    actionTitle: '',
    category: 'academic_tutoring',
    priority: 'high',
    goal: '',
    reviewDate: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load student 360 data dynamically if only studentId is supplied
  useEffect(() => {
    if (!initialData && studentId) {
      let isMounted = true;
      setLoading(true);
      setError(null);

      fetchStudent360Action(studentId).then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.error || 'Unable to load student information. Try again.');
        }
        setLoading(false);
      });

      return () => {
        isMounted = false;
      };
    }
  }, [initialData, studentId]);

  const handleOpenReviewForm = (actionItem: any) => {
    setSelectedActionItem(actionItem);
    
    // Calculate default review date (14 days out)
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setFormData({
      actionTitle: actionItem.action || 'Student Check-in & Academic Support',
      category: actionItem.category || 'academic_tutoring',
      priority: actionItem.priority || 'high',
      goal: `Improve performance and address flagged ${actionItem.category || 'academic'} concerns within 2 weeks.`,
      reviewDate: futureDate,
      notes: actionItem.rationale || 'Support intervention recommended by Early Warning Intelligence System.',
    });
    setIsReviewing(true);
  };

  const handleConfirmIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setIsSubmitting(true);
    try {
      const res = await approveSupportPlanAction({
        studentId: data.studentId,
        studentName: data.displayName,
        teacherId: '', // Server action overrides with context.userId
        signalId: `sig-${Date.now()}`,
        signalType: formData.category,
        recommendedActions: [
          {
            id: `act-${Date.now()}`,
            action: formData.actionTitle,
            category: formData.category,
            priority: formData.priority,
            description: `${formData.goal} — ${formData.notes}`,
          },
        ],
      });

      if (res.success) {
        setSuccessMessage(`Intervention started. Review scheduled for ${formData.reviewDate}`);
        setIsReviewing(false);
        setSelectedActionItem(null);

        // Refresh 360 data live
        const updated = await fetchStudent360Action(data.studentId);
        if (updated.success && updated.data) {
          setData(updated.data);
        }

        if (onInterventionCreated) onInterventionCreated();
      } else {
        setError(res.error || 'Failed to initialize intervention');
      }
    } catch (err) {
      console.error('Failed to initialize intervention:', err);
      setError('An error occurred while creating intervention.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        
        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
            <p className="font-display text-sm font-bold text-slate-700">Loading student insights...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
              ⚠️
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">{error}</h3>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-display text-xs font-bold"
            >
              Close Window
            </button>
          </div>
        )}

        {/* Loaded View */}
        {data && !loading && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-xs">
                  {data.firstName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-slate-900">{data.displayName}</h2>
                    <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                      Grade {data.grade}{data.section ? `-${data.section}` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Student Learning &amp; Wellbeing Profile</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 px-6 gap-6 text-xs font-bold text-slate-500 bg-white">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 border-b-2 transition-all ${activeTab === 'overview' ? 'border-slate-900 text-slate-900 font-black' : 'border-transparent hover:text-slate-700'}`}
              >
                Overview &amp; Help Needed
              </button>
              <button
                onClick={() => setActiveTab('academics')}
                className={`py-3 border-b-2 transition-all ${activeTab === 'academics' ? 'border-slate-900 text-slate-900 font-black' : 'border-transparent hover:text-slate-700'}`}
              >
                Marks &amp; Attendance
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-3 border-b-2 transition-all ${activeTab === 'timeline' ? 'border-slate-900 text-slate-900 font-black' : 'border-transparent hover:text-slate-700'}`}
              >
                Support Plans &amp; History ({data.interventions.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {successMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
                  <span>✓ {successMessage}</span>
                  <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:underline">Dismiss</button>
                </div>
              )}

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Step 3: Priority Viewport Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
                      <strong className="text-2xl font-black text-slate-900 mt-0.5 block">{data.attendanceMetrics.attendancePercentage}%</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{data.attendanceMetrics.absentDays} Absences / {data.attendanceMetrics.totalDays} Days</span>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Homework Completion</span>
                      <strong className="text-2xl font-black text-slate-900 mt-0.5 block">{data.homeworkMetrics.completionRate}%</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{data.homeworkMetrics.missing} Missing Assignments</span>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Average</span>
                      <strong className="text-2xl font-black text-slate-900 mt-0.5 block">{data.academicMetrics.overallAveragePercentage}%</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Recent Assessments</span>
                    </div>
                  </div>

                  {/* Signal Explanation Banner */}
                  <div className={`rounded-2xl p-5 border shadow-xs space-y-3 ${
                    data.signalAnalysis.severity === 'high'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                      : data.signalAnalysis.severity === 'medium'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-current">
                        Attention Level: {data.signalAnalysis.severity.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-extrabold">WHY THIS STUDENT NEEDS ATTENTION</h4>
                      <p className="text-xs mt-1 leading-relaxed">{data.signalAnalysis.explanation}</p>
                    </div>
                  </div>

                  {/* Supporting Evidence List */}
                  <div className="space-y-3">
                    <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400">Key Details &amp; Observations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.signalAnalysis.signals.map((sig, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="capitalize">{sig.source}: {sig.metric}</span>
                            <span className="font-mono text-amber-700 font-extrabold">{sig.value}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{sig.evidenceText}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Next Steps */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400">Recommended Actions for Teacher</h4>
                    
                    {data.signalAnalysis.recommendedActions.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3">No action required for this student right now.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.signalAnalysis.recommendedActions.map((rec, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs">
                            <div>
                              <h5 className="font-display text-xs font-bold text-slate-900">{rec.action}</h5>
                              <p className="text-[11px] text-slate-500 mt-0.5">{rec.rationale}</p>
                            </div>
                            <button
                              onClick={() => handleOpenReviewForm(rec)}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-extrabold transition-all shadow-xs shrink-0 active:scale-95 cursor-pointer"
                            >
                              Add Support Plan
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACADEMICS TAB */}
              {activeTab === 'academics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance Rate</span>
                      <strong className="text-3xl font-black text-slate-900 block mt-1">{data.attendanceMetrics.attendancePercentage}%</strong>
                      <span className="text-[10px] text-slate-500 block">{data.attendanceMetrics.absentDays} Absences / {data.attendanceMetrics.totalDays} Days</span>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Homework Completion</span>
                      <strong className="text-3xl font-black text-slate-900 block mt-1">{data.homeworkMetrics.completionRate}%</strong>
                      <span className="text-[10px] text-slate-500 block">{data.homeworkMetrics.missing} Missing Assignments</span>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Class Average</span>
                      <strong className="text-3xl font-black text-slate-900 block mt-1">{data.academicMetrics.overallAveragePercentage}%</strong>
                      <span className="text-[10px] text-slate-500 block">Across Recent Assessments</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400">Subject Breakdown</h4>
                    {data.academicMetrics.recentGrades.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">No recent assessment records logged.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.academicMetrics.recentGrades.map((g, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{g.subject}</span>
                            <span className="font-mono font-extrabold text-slate-900">{g.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TIMELINE TAB */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400">Support Plans &amp; Milestones</h4>
                  {data.interventions.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
                      <p className="text-xs font-bold text-slate-700">No active support plans created yet.</p>
                      <p className="text-[11px] text-slate-400">Support plans and help sessions started by teachers will appear here.</p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 py-2">
                      {data.interventions.map((inv) => (
                        <div key={inv.id} className="relative group">
                          <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-900 shadow-xs" />
                          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                              <span>{inv.title}</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">{inv.status}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{inv.description}</p>
                            <span className="text-[10px] font-mono text-slate-400 block pt-1">
                              Logged on {new Date(inv.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-display text-xs font-bold text-slate-700 transition-all"
              >
                Close Student 360
              </button>
            </div>
          </>
        )}

        {/* Step 5: INTERVENTION REVIEW & EDIT MODAL OVERLAY */}
        {isReviewing && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-slate-900">Review & Customize Intervention</h3>
                  <p className="text-xs text-slate-500">Configure parameters before starting support plan</p>
                </div>
                <button onClick={() => setIsReviewing(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleConfirmIntervention} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Action Title</label>
                  <input
                    type="text"
                    required
                    value={formData.actionTitle}
                    onChange={(e) => setFormData({ ...formData, actionTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    >
                      <option value="academic_tutoring">Academic Tutoring</option>
                      <option value="attendance_counseling">Attendance Check-in</option>
                      <option value="parent_conference">Parent Conference</option>
                      <option value="homework_support">Homework Support</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Review Date</label>
                    <input
                      type="date"
                      required
                      value={formData.reviewDate}
                      onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Intervention Goal</label>
                  <input
                    type="text"
                    required
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Notes & Rationale</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] font-medium text-amber-900">
                  ⚡ <strong>Notice:</strong> This will create an active student support intervention assigned to your account.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewing(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-extrabold transition-all shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Confirm & Start Intervention'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
