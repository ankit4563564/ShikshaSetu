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
import { TeacherCopilotStrip } from '@/components/copilot/TeacherCopilotStrip';
import { ParentCopilotStrip } from '@/components/copilot/ParentCopilotStrip';
import { StudentCopilotStrip } from '@/components/copilot/StudentCopilotStrip';
import { PrincipalCopilotStrip } from '@/components/copilot/PrincipalCopilotStrip';

// ─── Timeline Event Interface ────────────────────────────────────────────────

interface NarrativeEvent {
  id: string;
  time: string;
  actor: string;
  actorColor: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  badgeStyle: string;
}

// ─── Baseline Story Events for Aarav's Day ────────────────────────────────────

const BASELINE_STORY_EVENTS: NarrativeEvent[] = [
  {
    id: 'evt-1',
    time: '08:05 AM',
    actor: 'Campus Gate',
    actorColor: 'text-emerald-400',
    title: 'Aarav Arrived at School',
    description: 'RFID scan confirmed at Gate #2. Morning attendance automatically updated for Class 8A.',
    icon: '🏫',
    badge: 'Attendance',
    badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  {
    id: 'evt-2',
    time: '08:10 AM',
    actor: 'Route #04 Bus',
    actorColor: 'text-amber-400',
    title: 'School Bus On Time',
    description: 'Bus #04 safely arrived on campus. Parent app notified of successful arrival.',
    icon: '🚌',
    badge: 'Transit',
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  {
    id: 'evt-3',
    time: '09:30 AM',
    actor: 'School Memory',
    actorColor: 'text-purple-400',
    title: 'Pattern Flagged',
    description: 'Copilot detected 3 consecutive missed math assignments, matching 28 past student recovery cases.',
    icon: '🧠',
    badge: 'School Memory',
    badgeStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  {
    id: 'evt-4',
    time: '11:00 AM',
    actor: 'Copilot Engine',
    actorColor: 'text-teal-400',
    title: 'Support Package Drafted',
    description: 'Created targeted practice sheet + WhatsApp parent update for Mrs. Rao\'s approval (92% confidence).',
    icon: '✨',
    badge: 'Copilot Draft',
    badgeStyle: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  },
];

const POST_APPROVAL_STORY_EVENTS: NarrativeEvent[] = [
  {
    id: 'evt-5',
    time: 'Just Now',
    actor: 'Teacher (Mrs. Rao)',
    actorColor: 'text-emerald-400',
    title: 'Support Plan Approved',
    description: 'Mrs. Kavita Rao reviewed and approved the personalized intervention in 1 click.',
    icon: '✓',
    badge: 'Approved',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'evt-6',
    time: 'Just Now',
    actor: 'Parent App',
    actorColor: 'text-sky-400',
    title: 'WhatsApp Update Delivered',
    description: 'Reassuring message sent to Priya: "Aarav missed 3 homework sets. Practice sheet assigned."',
    icon: '📲',
    badge: 'Parent Notified',
    badgeStyle: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  {
    id: 'evt-7',
    time: 'Just Now',
    actor: 'Student Portal',
    actorColor: 'text-amber-400',
    title: 'Worksheet B Assigned',
    description: 'Algebra Practice Sheet B added to Aarav\'s daily goal roadmap.',
    icon: '📝',
    badge: 'Student Assigned',
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    id: 'evt-8',
    time: 'Just Now',
    actor: 'Principal Desk',
    actorColor: 'text-purple-400',
    title: 'Active Case Logged',
    description: 'Intervention case #8 recorded in executive campus operations overview.',
    icon: '📋',
    badge: 'Principal Logged',
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
];

// ─── School Memory Data ──────────────────────────────────────────────────────

const SCHOOL_MEMORY_TIMELINE = [
  { month: 'September', events: ['Algebra homework declined 3 days', 'Grade dropped from A to B+'], type: 'warning' },
  { month: 'October', events: ['Teacher check-in triggered', 'Worksheet assigned', 'Homework recovered fully'], type: 'recovery' },
  { month: 'November', events: ['Exam week — attendance dipped by 2 days', 'SchoolGPT flagged early'], type: 'warning' },
  { month: 'December', events: ['Parent PTM meeting scheduled', 'Attendance fully recovered', 'End-of-term A grade'], type: 'recovery' },
  { month: 'Today', events: ['Pattern matches previous intervention', '28 similar past cases found', 'Confidence: 92%'], type: 'today' },
];

export function ConnectedExperienceCenter() {
  const [state, setState] = useState<CopilotState>(getCopilotState());
  const [currentTime, setCurrentTime] = useState<string>('');

  // Interactive states
  const [parentAcknowledged, setParentAcknowledged] = useState<boolean>(false);
  const [studentHomeworkDone, setStudentHomeworkDone] = useState<boolean>(false);
  const [counselorAssigned, setCounselorAssigned] = useState<boolean>(false);
  const [caseClosed, setCaseClosed] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'schoolMemory' | 'impactSummary' | null>(null);

  // Portal card glow highlights on state change
  const [highlightedRoles, setHighlightedRoles] = useState<string[]>([]);
  const [storyEvents, setStoryEvents] = useState<NarrativeEvent[]>(BASELINE_STORY_EVENTS);
  const [memoryTimelineStep, setMemoryTimelineStep] = useState(0);

  const aaravAction = useMemo(() => state.items.find((i) => i.id === 'act_001'), [state.items]);
  const isApproved = aaravAction?.status === 'approved';

  // Live clock
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveModal(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Animate propagation across real portal views when action occurs
  const prevApproved = useRef(false);
  useEffect(() => {
    if (isApproved && !prevApproved.current) {
      prevApproved.current = true;
      const sequence = ['teacher', 'parent', 'student', 'principal'];
      sequence.forEach((role, idx) => {
        setTimeout(() => {
          setHighlightedRoles((prev) => [...prev, role]);
          setTimeout(() => {
            setHighlightedRoles((prev) => prev.filter((r) => r !== role));
          }, 900);
        }, idx * 220);
      });

      POST_APPROVAL_STORY_EVENTS.forEach((evt, idx) => {
        setTimeout(() => {
          setStoryEvents((prev) => [evt, ...prev]);
        }, idx * 300 + 200);
      });
    }
    if (!isApproved && prevApproved.current) {
      prevApproved.current = false;
      setStoryEvents(BASELINE_STORY_EVENTS);
      setHighlightedRoles([]);
    }
  }, [isApproved]);

  useEffect(() => {
    if (activeModal === 'schoolMemory') {
      setMemoryTimelineStep(0);
      SCHOOL_MEMORY_TIMELINE.forEach((_, idx) => {
        setTimeout(() => setMemoryTimelineStep(idx + 1), idx * 400 + 200);
      });
    }
  }, [activeModal]);

  const handleReset = useCallback(() => {
    resetCopilotState();
    setParentAcknowledged(false);
    setStudentHomeworkDone(false);
    setCounselorAssigned(false);
    setCaseClosed(false);
    setActiveModal(null);
    setStoryEvents(BASELINE_STORY_EVENTS);
    setHighlightedRoles([]);
    prevApproved.current = false;
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body antialiased p-4 sm:p-6 lg:p-10 space-y-8 relative overflow-hidden">
      
      {/* ── Soft Ambient Glow Orbs (Subtle Vercel/Linear style backdrop) ── */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── TOP HEADER (Minimalist Apple/Linear Product Demo Header) ── */}
      <header className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-[#121824]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              Connected Platform Demo
            </span>
            <span className="text-xs text-slate-400 font-mono">{currentTime}</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            How ShikshaSetu coordinates support for Aarav in real time
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            One missed assignment detected → Copilot drafts support → Teacher approves → Parent, Student, and Principal instantly synced.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => approveCopilotAction('act_001')}
            disabled={isApproved}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              isApproved
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]'
            }`}
          >
            {isApproved ? '✓ Support Plan Active' : '⚡ Approve Support Plan (Mrs. Rao)'}
          </motion.button>
          <button
            type="button"
            onClick={() => setActiveModal('schoolMemory')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 transition-all flex items-center gap-1.5"
          >
            🏛️ School Memory
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all"
          >
            ↺ Reset
          </button>
        </div>
      </header>

      {/* ── MAIN PRODUCT DEMO STAGE (4 Real Portals Side-by-Side + Live Story Spine) ── */}
      <main className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ── LEFT: 4 REAL PORTALS SIDE-BY-SIDE (2×2 GRID) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. TEACHER PORTAL */}
          <motion.div
            animate={highlightedRoles.includes('teacher') ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl bg-[#121824]/80 backdrop-blur-xl border p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 ${
              highlightedRoles.includes('teacher') ? 'border-teal-500 shadow-[0_0_25px_rgba(20,184,166,0.25)]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-bold text-white font-display ml-1">Teacher Workstation</span>
                <span className="text-[10px] text-slate-400">Class 8A · Mrs. Kavita Rao</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Active Desk
              </span>
            </div>

            {/* Embedded Real Teacher Component (skipThinking for crisp immediate view) */}
            <TeacherCopilotStrip skipThinking={true} />

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
              {!isApproved ? (
                <button
                  type="button"
                  onClick={() => approveCopilotAction('act_001')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all"
                >
                  ✓ Approve Support Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => undoCopilotAction('act_001')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                >
                  ↩ Undo Approval
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveModal('schoolMemory')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 transition-all"
              >
                🏛️ School Memory
              </button>
            </div>
          </motion.div>

          {/* 2. PARENT PORTAL */}
          <motion.div
            animate={highlightedRoles.includes('parent') ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl bg-[#121824]/80 backdrop-blur-xl border p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 ${
              highlightedRoles.includes('parent') ? 'border-sky-500 shadow-[0_0_25px_rgba(56,189,248,0.25)]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-bold text-white font-display ml-1">Parent App</span>
                <span className="text-[10px] text-slate-400">Priya Sharma (Mother)</span>
              </div>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                Home Connection
              </span>
            </div>

            {/* Embedded Real Parent Component */}
            <ParentCopilotStrip />

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setParentAcknowledged(!parentAcknowledged)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  parentAcknowledged
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
                }`}
              >
                {parentAcknowledged ? '✓ Acknowledged by Parent' : 'Acknowledge Update'}
              </button>
            </div>
          </motion.div>

          {/* 3. STUDENT PORTAL */}
          <motion.div
            animate={highlightedRoles.includes('student') ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl bg-[#121824]/80 backdrop-blur-xl border p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 ${
              highlightedRoles.includes('student') ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-bold text-white font-display ml-1">Student Roadmap</span>
                <span className="text-[10px] text-slate-400">Aarav Sharma · Class 8A</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Personalized
              </span>
            </div>

            {/* Embedded Real Student Component */}
            <StudentCopilotStrip />

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStudentHomeworkDone(!studentHomeworkDone)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  studentHomeworkDone
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/30'
                }`}
              >
                {studentHomeworkDone ? '✓ Worksheet Completed' : 'Mark Task Complete'}
              </button>
            </div>
          </motion.div>

          {/* 4. PRINCIPAL PORTAL */}
          <motion.div
            animate={highlightedRoles.includes('principal') ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl bg-[#121824]/80 backdrop-blur-xl border p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 ${
              highlightedRoles.includes('principal') ? 'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.25)]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-bold text-white font-display ml-1">Principal Operations</span>
                <span className="text-[10px] text-slate-400">Principal Sunanda</span>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Executive Desk
              </span>
            </div>

            {/* Embedded Real Principal Component */}
            <PrincipalCopilotStrip />

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCounselorAssigned(!counselorAssigned)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  counselorAssigned
                    ? 'bg-purple-950/80 border-purple-700 text-purple-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
                }`}
              >
                {counselorAssigned ? '✓ Counselor Assigned' : 'Assign Counselor'}
              </button>
              <button
                type="button"
                onClick={() => setCaseClosed(!caseClosed)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  caseClosed
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
                }`}
              >
                {caseClosed ? '✓ Case Closed' : 'Close Case'}
              </button>
            </div>
          </motion.div>

        </div>

        {/* ── RIGHT: NARRATIVE SPINE ("AARAV'S DAY TIMELINE") ── */}
        <div className="rounded-3xl bg-[#121824]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-base font-extrabold text-white tracking-tight">Aarav's Day Timeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live narrative story feed across campus</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ● Live Stream
            </span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[640px] pr-1">
            <AnimatePresence initial={false}>
              {storyEvents.map((evt) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-sm">{evt.icon}</span>
                      <span className={evt.actorColor}>{evt.actor}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{evt.time}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white">{evt.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{evt.description}</p>
                  <div className="pt-1">
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${evt.badgeStyle}`}>
                      {evt.badge}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* ── SCHOOL MEMORY HISTORICAL MODAL ── */}
      <AnimatePresence>
        {activeModal === 'schoolMemory' && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="relative w-full max-w-xl bg-[#121824] border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                    🏛️ School Memory Database
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-white mt-0.5">
                    Historical Intervention Timeline · Aarav Sharma
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {SCHOOL_MEMORY_TIMELINE.map((item, idx) => (
                  <AnimatePresence key={item.month}>
                    {idx < memoryTimelineStep && (
                      <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-300 font-mono">{item.month}</span>
                          <span className="text-[10px] font-mono text-slate-400">Match Confidence: 94%</span>
                        </div>
                        {item.events.map((ev, ei) => (
                          <p key={ei} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className="text-purple-400 font-bold">•</span> {ev}
                          </p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">28 historical cases matched campus-wide</span>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold"
                >
                  Close Timeline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
