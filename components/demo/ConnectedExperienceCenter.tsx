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

// ─── Timeline Narrative Event Interface ──────────────────────────────────────

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
  isNew?: boolean;
}

// ─── Baseline Story Events for Aarav's Day ────────────────────────────────────

const BASELINE_STORY_EVENTS: NarrativeEvent[] = [
  {
    id: 'evt-1',
    time: '08:05 AM',
    actor: 'Campus Gate',
    actorColor: 'text-emerald-400',
    title: 'Aarav Arrived at School',
    description: 'RFID scan confirmed at Gate #2. Morning attendance recorded for Class 8A.',
    icon: '🏫',
    badge: 'Attendance',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300',
  },
  {
    id: 'evt-2',
    time: '08:10 AM',
    actor: 'Route #04 Bus',
    actorColor: 'text-amber-400',
    title: 'School Bus On Time',
    description: 'Bus #04 safely arrived on campus. Parent app notified of arrival.',
    icon: '🚌',
    badge: 'Transit',
    badgeStyle: 'bg-amber-500/15 text-amber-300',
  },
  {
    id: 'evt-3',
    time: '09:30 AM',
    actor: 'School Memory',
    actorColor: 'text-purple-400',
    title: 'Learning Pattern Flagged',
    description: 'Copilot detected 3 consecutive missed math assignments, matching 28 past student recovery cases.',
    icon: '🧠',
    badge: 'School Memory',
    badgeStyle: 'bg-purple-500/15 text-purple-300',
  },
  {
    id: 'evt-4',
    time: '11:00 AM',
    actor: 'Copilot Engine',
    actorColor: 'text-teal-400',
    title: 'Prepared Support Plan',
    description: 'Targeted practice sheet + WhatsApp parent update drafted for Mrs. Rao\'s review (92% confidence).',
    icon: '✨',
    badge: 'Copilot Draft',
    badgeStyle: 'bg-teal-500/15 text-teal-300',
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
    badgeStyle: 'bg-emerald-500/20 text-emerald-300',
    isNew: true,
  },
  {
    id: 'evt-6',
    time: 'Just Now',
    actor: 'Parent App',
    actorColor: 'text-sky-400',
    title: 'WhatsApp Update Delivered',
    description: 'Reassuring update sent to Priya: "Aarav missed 3 homework sets. Practice sheet assigned."',
    icon: '📲',
    badge: 'Parent Notified',
    badgeStyle: 'bg-sky-500/20 text-sky-300',
    isNew: true,
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
    badgeStyle: 'bg-amber-500/20 text-amber-300',
    isNew: true,
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
    badgeStyle: 'bg-purple-500/20 text-purple-300',
    isNew: true,
  },
];

// ─── School Memory Flagship Data ─────────────────────────────────────────────

const SCHOOL_MEMORY_TIMELINE = [
  { month: 'September', type: 'warning' as const, title: 'Early Math Disengagement', detail: 'Algebra homework declined 3 days. Math grade dipped from A to B+.' },
  { month: 'October', type: 'recovery' as const, title: 'Teacher Intervention Success', detail: '10-minute check-in + targeted practice sheet assigned. Homework recovered 100%.' },
  { month: 'November', type: 'warning' as const, title: 'Mid-term Attendance Fluctuation', detail: 'Exam week stress caused 2-day attendance drop. Flagged early by Copilot.' },
  { month: 'December', type: 'recovery' as const, title: 'Parent Alignment & Full Recovery', detail: 'PTM meeting scheduled. End-of-term A grade restored.' },
  { month: 'Today (January)', type: 'today' as const, title: '92% Matched Intervention Confidence', detail: 'Current pattern matches 28 historical student recovery cases with 94% success rate.' },
];

export function ConnectedExperienceCenter() {
  const [state, setState] = useState<CopilotState>(getCopilotState());
  const [currentTime, setCurrentTime] = useState<string>('');

  // Interactive states
  const [parentAcknowledged, setParentAcknowledged] = useState<boolean>(false);
  const [studentHomeworkDone, setStudentHomeworkDone] = useState<boolean>(false);
  const [counselorAssigned, setCounselorAssigned] = useState<boolean>(false);
  const [caseClosed, setCaseClosed] = useState<boolean>(false);
  const [showMemoryDrawer, setShowMemoryDrawer] = useState<boolean>(false);

  // Card wave highlights when action occurs
  const [activeHighlightRole, setActiveHighlightRole] = useState<string | null>(null);
  const [storyEvents, setStoryEvents] = useState<NarrativeEvent[]>(BASELINE_STORY_EVENTS);
  const [memoryStep, setMemoryStep] = useState(0);

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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowMemoryDrawer(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Card-to-card motion wave when Teacher approves support plan
  const prevApproved = useRef(false);
  useEffect(() => {
    if (isApproved && !prevApproved.current) {
      prevApproved.current = true;
      const sequence = ['teacher', 'parent', 'student', 'principal'];
      sequence.forEach((role, idx) => {
        setTimeout(() => {
          setActiveHighlightRole(role);
          if (idx === sequence.length - 1) {
            setTimeout(() => setActiveHighlightRole(null), 800);
          }
        }, idx * 280);
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
      setActiveHighlightRole(null);
    }
  }, [isApproved]);

  // Memory timeline progressive reveal
  useEffect(() => {
    if (showMemoryDrawer) {
      setMemoryStep(0);
      SCHOOL_MEMORY_TIMELINE.forEach((_, idx) => {
        setTimeout(() => setMemoryStep(idx + 1), idx * 380 + 200);
      });
    }
  }, [showMemoryDrawer]);

  const handleReset = useCallback(() => {
    resetCopilotState();
    setParentAcknowledged(false);
    setStudentHomeworkDone(false);
    setCounselorAssigned(false);
    setCaseClosed(false);
    setShowMemoryDrawer(false);
    setStoryEvents(BASELINE_STORY_EVENTS);
    setActiveHighlightRole(null);
    prevApproved.current = false;
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body antialiased p-4 sm:p-6 lg:p-8 space-y-8 relative overflow-hidden">
      
      {/* ── Soft Ambient Glow Orbs (Apple/Linear style canvas blur) ── */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── TOP HEADER (Minimalist SaaS Demo Header) ── */}
      <header className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-7 rounded-3xl bg-[#121824]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              Live School Support Demo
            </span>
            <span className="text-xs text-slate-400 font-mono">{currentTime}</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            How ShikshaSetu coordinates support for Aarav in real time
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl">
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
            {isApproved ? '✓ Support Active' : '⚡ Approve Support Plan (Mrs. Rao)'}
          </motion.button>
          <button
            type="button"
            onClick={() => setShowMemoryDrawer(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 transition-all flex items-center gap-1.5"
          >
            🏛️ School Memory
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all"
          >
            ↺ Reset Demo
          </button>
        </div>
      </header>

      {/* ── MAIN PRODUCT DEMO STAGE (4 Real Portals + Hero Timeline Narrative Spine) ── */}
      <main className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

        {/* ── LEFT: 4 REAL PORTAL WINDOWS SIDE-BY-SIDE (2×2 GRID) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. TEACHER WORKSTATION */}
          <motion.div
            animate={activeHighlightRole === 'teacher' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl bg-[#121824]/90 backdrop-blur-2xl border p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 ${
              activeHighlightRole === 'teacher' ? 'border-teal-500 shadow-[0_0_25px_rgba(20,184,166,0.25)]' : 'border-white/[0.08] hover:border-white/15'
            }`}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
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

            {/* Embedded Teacher Component (skipThinking for immediate complete render) */}
            <TeacherCopilotStrip skipThinking={true} onOpenMemory={() => setShowMemoryDrawer(true)} />

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
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
                onClick={() => setShowMemoryDrawer(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 transition-all"
              >
                🏛️ School Memory
              </button>
            </div>
          </motion.div>

          {/* 2. PARENT APP */}
          <motion.div
            animate={activeHighlightRole === 'parent' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl bg-[#121824]/90 backdrop-blur-2xl border p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 ${
              activeHighlightRole === 'parent' ? 'border-sky-500 shadow-[0_0_25px_rgba(56,189,248,0.25)]' : 'border-white/[0.08] hover:border-white/15'
            }`}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
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

            {/* Embedded Parent Component */}
            <ParentCopilotStrip />

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
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

          {/* 3. STUDENT ROADMAP */}
          <motion.div
            animate={activeHighlightRole === 'student' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl bg-[#121824]/90 backdrop-blur-2xl border p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 ${
              activeHighlightRole === 'student' ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]' : 'border-white/[0.08] hover:border-white/15'
            }`}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
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

            {/* Embedded Student Component */}
            <StudentCopilotStrip />

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
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

          {/* 4. PRINCIPAL OPERATIONS */}
          <motion.div
            animate={activeHighlightRole === 'principal' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl bg-[#121824]/90 backdrop-blur-2xl border p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 ${
              activeHighlightRole === 'principal' ? 'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.25)]' : 'border-white/[0.08] hover:border-white/15'
            }`}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
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

            {/* Embedded Principal Component */}
            <PrincipalCopilotStrip />

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
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

        {/* ── RIGHT: HERO NARRATIVE SPINE ("AARAV'S DAY TIMELINE") ── */}
        <div className="rounded-3xl bg-[#121824]/90 backdrop-blur-2xl border border-white/[0.08] p-6 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h3 className="font-display text-base font-extrabold text-white tracking-tight">Aarav's Day Timeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live narrative story feed across campus</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ● Live Stream
            </span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[660px] pr-1">
            <AnimatePresence initial={false}>
              {storyEvents.map((evt, idx) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: -16, scale: 0.96 }}
                  animate={{ opacity: idx > 3 ? 1 : 0.75, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`p-4 rounded-2xl bg-slate-900/60 space-y-1.5 transition-all ${
                    evt.isNew ? 'ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-base">{evt.icon}</span>
                      <span className={evt.actorColor}>{evt.actor}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{evt.time}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white font-display">{evt.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{evt.description}</p>
                  <div className="pt-1">
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full ${evt.badgeStyle}`}>
                      {evt.badge}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* ── FLAGSHIP SCHOOL MEMORY SIDE SHEET (ChatGPT meets Linear) ── */}
      <AnimatePresence>
        {showMemoryDrawer && (
          <div className="fixed inset-0 z-[80] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemoryDrawer(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Side Sheet Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#0F1420] border-l border-white/[0.08] shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-white/[0.08] bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                      🏛️ Flagship Intelligence
                    </span>
                    <h2 className="font-display text-xl font-extrabold text-white tracking-tight mt-0.5">
                      School Memory Timeline
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Aarav Sharma · Class 8A · Academic Year</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMemoryDrawer(false)}
                    className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Match Metrics Summary */}
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-900/80 text-center">
                    <span className="text-sm font-extrabold text-emerald-300 font-display block">92%</span>
                    <span className="text-[9px] font-mono text-slate-400">Confidence</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 text-center">
                    <span className="text-sm font-extrabold text-purple-300 font-display block">28 Cases</span>
                    <span className="text-[9px] font-mono text-slate-400">Matched</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 text-center">
                    <span className="text-sm font-extrabold text-teal-300 font-display block">94%</span>
                    <span className="text-[9px] font-mono text-slate-400">Success Rate</span>
                  </div>
                </div>
              </div>

              {/* Progressive Timeline Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Historical Student Journey
                  </span>
                  <span className="text-[10px] font-mono text-purple-300 font-bold">5 Months History</span>
                </div>

                <div className="relative space-y-4 pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {SCHOOL_MEMORY_TIMELINE.map((entry, idx) => (
                    <AnimatePresence key={entry.month}>
                      {idx < memoryStep && (
                        <motion.div
                          initial={{ opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="relative p-4 rounded-2xl bg-slate-900/60 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-300 font-display">{entry.month}</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                              entry.type === 'warning' ? 'bg-amber-500/15 text-amber-300' : entry.type === 'recovery' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-purple-500/15 text-purple-300'
                            }`}>
                              {entry.type === 'warning' ? 'Early Risk Flag' : entry.type === 'recovery' ? 'Recovered' : 'Active Match'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white">{entry.title}</h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{entry.detail}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </div>

              {/* Side Sheet Footer */}
              <div className="p-6 border-t border-white/[0.08] bg-slate-900/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Copilot historical reasoning active</span>
                <button
                  type="button"
                  onClick={() => setShowMemoryDrawer(false)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-sm"
                >
                  Close Flagship Memory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
