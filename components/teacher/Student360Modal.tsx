'use client';

import { useState } from 'react';
import type { Student360Data } from '@/lib/student360/getStudent360';
import { approveSupportPlanAction } from '@/app/actions/interventionActions';

interface Student360ModalProps {
  readonly data: Student360Data;
  readonly onClose: () => void;
  readonly onInterventionCreated?: () => void;
}

export default function Student360Modal({ data, onClose, onInterventionCreated }: Student360ModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'timeline'>('overview');
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStartIntervention = async (actionItem: any) => {
    setIsSubmitting(true);
    try {
      const res = await approveSupportPlanAction({
        studentId: data.studentId,
        studentName: data.displayName,
        teacherId: 'current-teacher',
        signalId: `sig-${Date.now()}`,
        signalType: actionItem.category || 'academic_tutoring',
        recommendedActions: [
          {
            id: `act-${Date.now()}`,
            action: actionItem.action,
            category: actionItem.category || 'academic_tutoring',
            priority: actionItem.priority || 'standard',
            description: actionItem.rationale,
          },
        ],
      });

      if (res.success) {
        setSuccessMessage(`Intervention initialized: ${actionItem.action}`);
        setSelectedAction(null);
        if (onInterventionCreated) onInterventionCreated();
      }
    } catch (err) {
      console.error('Failed to initialize intervention:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        
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
              <p className="text-xs text-slate-500 mt-0.5">Student 360 & Early Warning Intelligence View</p>
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
            className={`py-3 border-b-2 transition-all ${activeTab === 'overview' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-700'}`}
          >
            🎯 Early Warning & Summary
          </button>
          <button
            onClick={() => setActiveTab('academics')}
            className={`py-3 border-b-2 transition-all ${activeTab === 'academics' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-700'}`}
          >
            📊 Academic & Attendance Signals
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-all ${activeTab === 'timeline' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-700'}`}
          >
            ⏱️ Intervention History & Notes
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between">
              <span>✓ {successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:underline">Dismiss</button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
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
                    Signal Severity: {data.signalAnalysis.severity.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs font-bold opacity-80">
                    Confidence: {Math.round(data.signalAnalysis.confidenceScore * 100)}%
                  </span>
                </div>
                <div>
                  <h4 className="font-display text-sm font-extrabold">Why is this student flagged?</h4>
                  <p className="text-xs mt-1 leading-relaxed">{data.signalAnalysis.explanation}</p>
                </div>
              </div>

              {/* Supporting Signals List */}
              <div className="space-y-3">
                <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400">Supporting Signal Evidence</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.signalAnalysis.signals.map((sig, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="capitalize">{sig.source}: {sig.metric}</span>
                        <span className="font-mono text-amber-700">{sig.value}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{sig.evidenceText}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Intervention Next Steps */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400">Recommended Next Steps (Human-in-the-Loop Approval Required)</h4>
                <div className="space-y-2">
                  {data.signalAnalysis.recommendedActions.map((rec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs">
                      <div>
                        <h5 className="font-display text-xs font-bold text-slate-900">{rec.action}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">{rec.rationale}</p>
                      </div>
                      <button
                        onClick={() => handleStartIntervention(rec)}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-extrabold transition-all shadow-xs shrink-0 active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Start Intervention'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academics' && (
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Average</span>
                <strong className="text-3xl font-black text-slate-900 block mt-1">{data.academicMetrics.overallAveragePercentage}%</strong>
                <span className="text-[10px] text-slate-500 block">Across Recent Assessments</span>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400">Intervention History & Milestones</h4>
              {data.interventions.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active or historical interventions logged for this student.</p>
              ) : (
                <div className="space-y-3">
                  {data.interventions.map((inv) => (
                    <div key={inv.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{inv.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">{inv.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{inv.description}</p>
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
      </div>
    </div>
  );
}
