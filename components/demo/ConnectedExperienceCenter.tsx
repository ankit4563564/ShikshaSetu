'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCopilotState,
  subscribeCopilotState,
  approveCopilotAction,
  undoCopilotAction,
  resetCopilotState,
  CopilotState,
} from '@/lib/copilot/copilotEngine';
import { getAIImpactMetrics } from '@/lib/copilot/impactEngine';
import { TeacherCopilotStrip } from '@/components/copilot/TeacherCopilotStrip';
import { ParentCopilotStrip } from '@/components/copilot/ParentCopilotStrip';
import { StudentCopilotStrip } from '@/components/copilot/StudentCopilotStrip';
import { PrincipalCopilotStrip } from '@/components/copilot/PrincipalCopilotStrip';
import { InterventionTimeline } from '@/components/copilot/InterventionTimeline';

export function ConnectedExperienceCenter() {
  const [state, setState] = useState<CopilotState>(getCopilotState());
  const [currentTime, setCurrentTime] = useState<string>('');

  // Interactive local states synced with shared engine pings
  const [parentAcknowledged, setParentAcknowledged] = useState<boolean>(false);
  const [parentMeetingRequested, setParentMeetingRequested] = useState<boolean>(false);
  const [studentHomeworkDone, setStudentHomeworkDone] = useState<boolean>(false);
  const [counselorAssigned, setCounselorAssigned] = useState<boolean>(false);
  const [caseClosed, setCaseClosed] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'message' | 'homework' | 'goal' | 'evidence' | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    const unsubscribe = subscribeCopilotState((newState) => {
      setState(newState);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const aaravAction = useMemo(() => state.items.find((i) => i.id === 'act_001'), [state.items]);
  const isApproved = aaravAction?.status === 'approved';

  const handleReset = useCallback(() => {
    resetCopilotState();
    setParentAcknowledged(false);
    setParentMeetingRequested(false);
    setStudentHomeworkDone(false);
    setCounselorAssigned(false);
    setCaseClosed(false);
    setActiveModal(null);
  }, []);

  const impactMetrics = useMemo(() => getAIImpactMetrics(), []);

  // Connection Feed relationship stream
  const connectionEvents = useMemo(
    () => [
      {
        id: 'e1',
        from: 'Teacher (Mrs. Rao)',
        to: 'Parent (Priya)',
        title: 'WhatsApp Support Message',
        status: parentAcknowledged ? 'Acknowledged' : isApproved ? 'Delivered' : 'Pending Review',
        timestamp: isApproved ? 'Just Now' : 'Awaiting Approval',
        isLive: isApproved,
        reason: 'Triggered by 3 consecutive missed homework pings',
      },
      {
        id: 'e2',
        from: 'Teacher (Mrs. Rao)',
        to: 'Student (Aarav)',
        title: 'Algebra Worksheet B Assigned',
        status: studentHomeworkDone ? 'Completed' : isApproved ? 'In Task Roadmap' : 'Drafted',
        timestamp: isApproved ? 'Just Now' : 'Scheduled',
        isLive: isApproved,
        reason: 'Auto-assigned to address fraction word-problem weakness',
      },
      {
        id: 'e3',
        from: 'Teacher (Mrs. Rao)',
        to: 'Principal (Sunanda)',
        title: 'Support Intervention Logged',
        status: caseClosed ? 'Case Closed & Resolved' : counselorAssigned ? 'Counselor Assigned' : isApproved ? 'Active Support Case' : 'Pending',
        timestamp: isApproved ? 'Just Now' : 'Pending',
        isLive: isApproved,
        reason: 'Logged in campus operations telemetry',
      },
      {
        id: 'e4',
        from: 'Transport Telemetry',
        to: 'Parent (Priya)',
        title: 'Bus #04 Route Status',
        status: '8 Mins ETA',
        timestamp: '08:10 AM',
        isLive: false,
        reason: 'Live GPS weather traffic update',
      },
      {
        id: 'e5',
        from: 'Gate RFID #2',
        to: 'Parent (Priya)',
        title: 'Student Gate Entry Scan',
        status: 'Received (08:14 AM)',
        timestamp: '08:14 AM',
        isLive: false,
        reason: 'Automated RFID scan at campus gate',
      },
    ],
    [isApproved, parentAcknowledged, studentHomeworkDone, counselorAssigned, caseClosed]
  );

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-body antialiased p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* ── TOP BAR HEADER ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#0F1420] border border-slate-800 backdrop-blur-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-white tracking-tight">
              ShikshaSetu Operations Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold">
              LIVE SYNC
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time multi-stakeholder orchestration &bull; Every event connected across campus
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            {currentTime || '08:15:00 AM'}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all outline-none"
          >
            Reset Experience
          </button>
        </div>
      </header>

      {/* ── 2x2 RESPONSIVE LAYOUT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: TEACHER WORKSTATION (PRIMARY FOCUS) */}
        <div className="rounded-3xl border border-[#0F766E]/50 bg-[#0F1420] p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                1. Teacher Workstation
              </span>
              <h2 className="text-xs text-slate-400 mt-0.5">
                What needs my attention today?
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
              Primary Focus
            </span>
          </div>

          <TeacherCopilotStrip />

          {/* Teacher Action Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            {!isApproved ? (
              <button
                type="button"
                onClick={() => approveCopilotAction('act_001')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0F766E] hover:bg-[#0d665f] text-white shadow-xs transition-all outline-none"
              >
                ✓ Approve Support Plan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => undoCopilotAction('act_001')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all outline-none"
              >
                ↩ Undo Approval
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveModal('homework')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all outline-none"
            >
              View Assigned Homework
            </button>
          </div>
        </div>

        {/* PANEL 2: PARENT TELEMETRY */}
        <div className="rounded-3xl border border-slate-800 bg-[#0F1420] p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                2. Parent Family Telemetry
              </span>
              <h2 className="text-xs text-slate-400 mt-0.5">
                What changed for my child today?
              </h2>
            </div>
            {isApproved && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800">
                Reason: Teacher Approved Package
              </span>
            )}
          </div>

          <ParentCopilotStrip />

          {/* Parent Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveModal('message')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all outline-none"
            >
              Open Message
            </button>

            <button
              type="button"
              onClick={() => setParentAcknowledged(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border outline-none ${
                parentAcknowledged
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {parentAcknowledged ? '✓ Acknowledged' : 'Acknowledge Note'}
            </button>

            <button
              type="button"
              onClick={() => setParentMeetingRequested(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border outline-none ${
                parentMeetingRequested
                  ? 'bg-blue-950/80 border-blue-700 text-blue-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {parentMeetingRequested ? 'Meeting Requested' : 'Request PTM Meeting'}
            </button>
          </div>
        </div>

        {/* PANEL 3: STUDENT ROADMAP */}
        <div className="rounded-3xl border border-slate-800 bg-[#0F1420] p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                3. Student Action Roadmap
              </span>
              <h2 className="text-xs text-slate-400 mt-0.5">
                What should I do next today?
              </h2>
            </div>
            {isApproved && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800">
                Reason: Worksheet B Auto-Assigned
              </span>
            )}
          </div>

          <StudentCopilotStrip />

          {/* Student Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveModal('homework')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all outline-none"
            >
              Open Homework Sheet
            </button>

            <button
              type="button"
              onClick={() => setStudentHomeworkDone(!studentHomeworkDone)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border outline-none ${
                studentHomeworkDone
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-[#0F766E] hover:bg-[#0d665f] text-white border-[#22C55E]/40'
              }`}
            >
              {studentHomeworkDone ? '✓ Homework Completed' : 'Mark Task Complete'}
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('goal')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all outline-none"
            >
              View Streak Goal
            </button>
          </div>
        </div>

        {/* PANEL 4: PRINCIPAL WORKSPACE */}
        <div className="rounded-3xl border border-slate-800 bg-[#0F1420] p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                4. Principal Operations Control
              </span>
              <h2 className="text-xs text-slate-400 mt-0.5">
                What requires executive intervention?
              </h2>
            </div>
            {isApproved && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800">
                Reason: Active Case Logged
              </span>
            )}
          </div>

          <PrincipalCopilotStrip />

          {/* Principal Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveModal('evidence')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all outline-none"
            >
              Review Memory Evidence
            </button>

            <button
              type="button"
              onClick={() => setCounselorAssigned(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border outline-none ${
                counselorAssigned
                  ? 'bg-purple-950/80 border-purple-700 text-purple-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {counselorAssigned ? '✓ Counselor Assigned' : 'Assign Counselor'}
            </button>

            <button
              type="button"
              onClick={() => setCaseClosed(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border outline-none ${
                caseClosed
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {caseClosed ? 'Case Resolved' : 'Resolve & Close Case'}
            </button>
          </div>
        </div>

      </div>

      {/* ── LOWER ANALYTICS & CONNECTION STREAM ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* CONNECTION FEED (Relationship Stream) */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-800 bg-[#0F1420] p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                Connection Feed (Relationship Stream)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Demonstrates inter-role communication pings
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">5 Active</span>
          </div>

          <div className="space-y-2.5">
            {connectionEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  evt.isLive
                    ? 'bg-[#0F766E]/20 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">
                    {evt.from} &rarr; {evt.to}
                  </span>
                  <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="font-medium text-slate-300">{evt.title}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      evt.isLive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/60">
                  Reason: {evt.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI IMPACT & INTERVENTION TIMELINE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CONTEXTUAL AI IMPACT WIDGET */}
          <div className="bg-[#0F1420] border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Today&apos;s AI Operational Impact &amp; Context
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Calculated metrics with explainable reasons
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                {impactMetrics.teacherApprovalRate}% Approval Rate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">Teacher Time Saved</span>
                <span className="text-lg font-bold text-emerald-400 font-display">{impactMetrics.teacherHoursSaved}</span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Because 28 parent messages were automatically drafted.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">Communications Drafted</span>
                <span className="text-lg font-bold text-white font-display">{impactMetrics.communicationsDrafted}</span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Automated WhatsApp &amp; Push notifications dispatched.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">Students Supported</span>
                <span className="text-lg font-bold text-blue-400 font-display">{impactMetrics.studentsSupported}</span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Through 4 proactive early interventions.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">Active Cases</span>
                <span className="text-lg font-bold text-purple-400 font-display">{isApproved ? '8 Active' : '7 Active'}</span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Tracked in School Memory database.
                </p>
              </div>
            </div>
          </div>

          {/* INTERVENTION LIFECYCLE TIMELINE */}
          <InterventionTimeline intervention={state.activeIntervention} />
        </div>
      </div>

      {/* ── INTERACTIVE MODAL OVERLAYS ── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 max-w-lg w-full bg-[#0F1420] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
              role="dialog"
              aria-modal="true"
            >
              {activeModal === 'message' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-white">Parent WhatsApp Message Briefing</h3>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-slate-300 leading-relaxed">
                    &ldquo;Hi Priya, Aarav missed homework for 3 consecutive days. Mrs. Kavita Rao prepared an extra practice sheet and scheduled a 10-minute check-in for tomorrow.&rdquo;
                  </div>
                  <p className="text-[11px] text-slate-400">Status: {isApproved ? 'Delivered to Priya Sharma' : 'Awaiting Teacher Approval'}</p>
                </div>
              )}

              {activeModal === 'homework' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-white">Algebra Practice Worksheet B</h3>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="font-bold text-emerald-400">Target Concept: Fraction Word Problems</p>
                    <p className="text-slate-300">5 procedural questions reviewing algebra fractions before Friday&apos;s assessment.</p>
                  </div>
                  <p className="text-[11px] text-slate-400">Assigned by: Mrs. Kavita Rao &bull; Est. 15 mins</p>
                </div>
              )}

              {activeModal === 'goal' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-white">Aarav&apos;s 14-Day Streak Goal</h3>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="font-bold text-amber-400">Current Streak: 14 Days Active</p>
                    <p className="text-slate-300">Maintain 100% homework submission to earn the Academic Growth Badge!</p>
                  </div>
                </div>
              )}

              {activeModal === 'evidence' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-white">School Memory Evidence (28 Cases)</h3>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="font-bold text-purple-400">84% Recovery Rate</p>
                    <p className="text-slate-300">Combining a 1-on-1 teacher check-in with a parent WhatsApp note resolved 84% of similar cases within 5 days.</p>
                  </div>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all outline-none"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
