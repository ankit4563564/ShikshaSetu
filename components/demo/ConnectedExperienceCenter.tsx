'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCopilotState,
  subscribeCopilotState,
  approveCopilotAction,
  undoCopilotAction,
  resetCopilotState,
  CopilotState,
} from '@/lib/copilot/copilotEngine';
import { CANONICAL_TEACHER_ID, CANONICAL_STUDENT_ID } from '@/lib/canonical';
import { getStudentEcosystemEvents } from '@/app/actions/ecosystemActions';
import { completeTaskAction } from '@/app/actions/interventionActions';

// ─── Simplified Event Interface ──────────────────────────────────────

interface LiveEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
}

// ─── Lifecycle Stage ──────────────────────────────────────

interface LifecycleStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export function ConnectedExperienceCenter() {
  const [state, setState] = useState<CopilotState>(getCopilotState());
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

  const aaravAction = useMemo(() => state.items[0] || null, [state.items]);
  const isApproved = aaravAction?.status === 'approved';
  const isCompleted = aaravAction?.status === 'completed';

  // Lifecycle stages
  const lifecycle: LifecycleStage[] = useMemo(() => [
    { id: 'signal', label: 'Signal Detected', status: 'completed' },
    { id: 'teacher', label: 'Teacher Approved', status: isApproved ? 'completed' : isApproving ? 'active' : 'active' },
    { id: 'parent', label: 'Parent Informed', status: isApproved ? 'completed' : 'pending' },
    { id: 'student', label: 'Practice Assigned', status: isApproved ? 'active' : 'pending' },
    { id: 'outcome', label: 'Outcome Tracked', status: isCompleted ? 'completed' : 'pending' },
  ], [isApproved, isApproving, isCompleted]);

  // Load real ecosystem events
  useEffect(() => {
    async function loadEvents() {
      try {
        const events = await getStudentEcosystemEvents(CANONICAL_STUDENT_ID, 10);
        const simplified: LiveEvent[] = events.map(evt => ({
          id: evt.id,
          time: new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: evt.actor_role || 'System',
          action: evt.title,
        })).reverse();
        setLiveEvents(simplified);
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    }
    loadEvents();
  }, [isApproved, isCompleted]);

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const handleApprove = async () => {
    setIsApproving(true);
    await approveCopilotAction('act_001', CANONICAL_TEACHER_ID);
    setTimeout(() => setIsApproving(false), 500);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    await completeTaskAction({ taskId: 'task_001', studentId: CANONICAL_STUDENT_ID });
    setTimeout(() => setIsCompleting(false), 500);
  };

  const handleReset = () => {
    resetCopilotState();
    setLiveEvents([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Case Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">LIVE STUDENT SUPPORT</h1>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-lg">Aarav Sharma</span>
              <span className="text-slate-600">·</span>
              <span className="text-base">Grade 8A</span>
              <span className="text-slate-600">·</span>
              <span className="text-base">Homework support case</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset Demo
          </button>
        </div>

        {/* Lifecycle */}
        <div className="flex items-center gap-2 py-4">
          {lifecycle.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                stage.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300' :
                stage.status === 'active' ? 'bg-teal-500/10 text-teal-300' :
                'bg-slate-800/50 text-slate-500'
              }`}>
                {stage.status === 'completed' && <span className="text-sm">✓</span>}
                {stage.status === 'active' && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
                <span className="text-sm font-medium">{stage.label}</span>
              </div>
              {idx < lifecycle.length - 1 && (
                <span className="text-slate-600">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Context */}
        {!isCompleted && (
          <p className="text-base text-slate-300">
            {isApproved 
              ? 'Mrs. Kavita Rao approved a support plan after 3 consecutive missed assignments.'
              : 'Aarav may need additional support after 3 consecutive missed assignments.'}
          </p>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Main Story */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Teacher Card */}
            {!isApproved ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white">Teacher Review</h2>
                <p className="text-slate-300">Aarav may need additional support</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Evidence:</p>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• 3 consecutive homework misses</li>
                    <li>• Attendance declined this week</li>
                    <li>• Reduced classroom participation</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Prepared support:</p>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>✓ Parent update drafted</li>
                    <li>✓ Algebra recovery practice prepared</li>
                    <li>✓ 10-minute check-in suggested</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : 'Approve Support Plan'}
                  </motion.button>
                  <button
                    onClick={() => setShowMemory(true)}
                    className="px-4 py-3 text-slate-400 hover:text-slate-200 text-sm transition-colors"
                  >
                    Why was this suggested?
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h2 className="text-lg font-semibold text-emerald-300">Support plan approved</h2>
                    <p className="text-sm text-slate-400">Mrs. Kavita Rao • Approved just now</p>
                  </div>
                </div>
              </div>
            )}

            {/* Post-approval cards */}
            {isApproved && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Parent */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm font-medium text-slate-400">Parent Informed</span>
                  </div>
                  <p className="text-sm text-slate-300">New update from Mrs. Rao</p>
                  <p className="text-xs text-slate-500">Support message delivered</p>
                </div>

                {/* Student */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm font-medium text-slate-400">Student Supported</span>
                  </div>
                  <p className="text-sm text-slate-300">Algebra Practice Sheet B</p>
                  <p className="text-xs text-slate-500">Assigned to today's roadmap</p>
                  {!isCompleted && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleComplete}
                      disabled={isCompleting}
                      className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isCompleting ? 'Completing...' : 'Mark Task Complete'}
                    </motion.button>
                  )}
                </div>

                {/* Principal */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm font-medium text-slate-400">School Updated</span>
                  </div>
                  <p className="text-sm text-slate-300">Intervention #88</p>
                  <p className="text-xs text-slate-500">Active support case logged</p>
                </div>
              </div>
            )}

            {/* Connected Impact */}
            {isApproved && (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Connected Impact</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Teacher Decision</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-emerald-400">Parent Informed</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-amber-400">Student Assigned</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-purple-400">School Updated</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Activity */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Live Activity</p>
            <div className="space-y-3">
              {liveEvents.length === 0 ? (
                <p className="text-sm text-slate-500">Waiting for events...</p>
              ) : (
                liveEvents.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-3 pb-3 border-b border-slate-800/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                      {evt.actor[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-300 truncate">{evt.actor}</p>
                      <p className="text-xs text-slate-500 truncate">{evt.action}</p>
                      <p className="text-[11px] text-slate-600">{evt.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Modal */}
      <AnimatePresence>
        {showMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemory(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Previous Support History</h2>
              <p className="text-sm text-slate-400 mb-4">
                Based on 28 similar cases, parent communication combined with targeted practice has a 94% success rate.
              </p>
              <button
                onClick={() => setShowMemory(false)}
                className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
