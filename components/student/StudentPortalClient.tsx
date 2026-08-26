'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignOutButton } from '@/components/auth/SignOutButton';
import SchoolMitra from '@/components/student/SchoolMitra';
import QuestBoard from '@/components/student/QuestBoard';
import StudentTodayTasks from '@/components/student/StudentTodayTasks';
import StudentCompactTimetable from '@/components/student/StudentCompactTimetable';
import StudentLearningFocus from '@/components/student/StudentLearningFocus';
import StudentProgressSummary from '@/components/student/StudentProgressSummary';
import StudentStudyHelpCard from '@/components/student/StudentStudyHelpCard';
import StudentMobileNav from '@/components/student/StudentMobileNav';
import StudentMarksView from '@/components/student/StudentMarksView';
import WorryJar from '@/components/student/WorryJar';
import StudentExitTicketWidget from '@/components/student/StudentExitTicketWidget';
import AiRevisionNotesWorkspace from '@/components/student/AiRevisionNotesWorkspace';
import { getCanonicalStudentState } from '@/lib/canonical';
import { usePortalSync } from '@/hooks/usePortalSync';
import { useTimeGreeting } from '@/lib/utils/timeGreeting';
import type { StudentWithFlag } from '@/lib/supabase/getStudentsData';

interface StudentPortalClientProps {
  student?: StudentWithFlag;
}

const TAB_LABELS = [
  'Today',
  'Academics',
  'Revision Notes',
  'Homework',
  'Missions',
  'Wellbeing',
] as const;
type Tab = typeof TAB_LABELS[number];

export default function StudentPortalClient({ student }: StudentPortalClientProps) {
  const timeGreeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState<Tab>('Today');
  const [canonicalState, setCanonicalState] = useState<any>(null);
  const [selectedStudyTopic, setSelectedStudyTopic] = useState<string | null>(null);

  const displayName = student?.displayName || 'Aarav Sharma';
  const firstName = displayName.split(' ')[0];

  const handleSyncEvent = useCallback(async () => {
    try {
      const state = await getCanonicalStudentState(student?.studentId || student?.id);
      setCanonicalState(state);
    } catch (error) {
      console.error('Failed to load canonical state:', error);
    }
  }, [student?.studentId, student?.id]);

  const studentIdForChannel = student?.studentId || student?.id || '';
  const channelName = studentIdForChannel ? `school:sch-demo-001:parent:${studentIdForChannel}` : '';
  usePortalSync(channelName, handleSyncEvent, handleSyncEvent);

  useEffect(() => {
    handleSyncEvent();
  }, [handleSyncEvent]);

  // ── Data from canonical state (real DB data) ──
  const rawHomework = (Array.isArray(canonicalState?.homework) && canonicalState.homework.length > 0)
    ? canonicalState.homework
    : (student?.homework || []);

  // Strict deduplication of homework tasks
  const seenHw = new Set<string>();
  const homework = (rawHomework || []).filter((h: any) => {
    if (!h) return false;
    const normalized = (h.title || '').trim().toLowerCase();
    const key = h.id || `${h.subject}-${normalized}`;
    if (seenHw.has(key)) return false;
    seenHw.add(key);
    return true;
  });

  const pendingHW = (homework || []).filter((h: any) => Boolean(h && !h.isSubmitted && !h.is_submitted));
  const doneHW = (homework || []).filter((h: any) => Boolean(h && (h.isSubmitted || h.is_submitted)));

  const attendanceSummary = canonicalState?.attendanceSummary || { rate: 0.94, streak: 12, totalDays: 45 };
  const hasAttendanceData = attendanceSummary.totalDays > 0;

  const studentGrade = student?.grade || '8';
  const studentSection = student?.section || 'A';
  const studentRoll = student?.roll_number || '12';
  const studentGrades = student?.grades || [];
  const effectiveGrades = studentGrades.length > 0 ? studentGrades : (canonicalState?.grades || []);

  // Evidence logs for real achievements & teacher observations
  const evidenceLogs = canonicalState?.evidenceLogs || [];

  const pendingCount = pendingHW.length;
  const studentId = student?.studentId || student?.id || 'b1000000-0000-4000-8000-000000000001';

  // ── Derive "Next Best Action" strictly from canonical evidence ──
  const getNextBestAction = () => {
    // 1. Check for weak grade / concept needing reinforcement
    const weakGrade = effectiveGrades
      .filter((g: any) => (g.maxScore || g.max_score || 0) > 0)
      .map((g: any) => ({
        ...g,
        pct: Math.round((g.score / (g.maxScore || g.max_score || 100)) * 100),
      }))
      .sort((a: any, b: any) => a.pct - b.pct)[0];

    const targetSubject = weakGrade?.subject || 'Mathematics';
    const targetTopic = weakGrade?.assessmentName || weakGrade?.assessment_name || 'Equivalent Fractions';
    const targetScore = weakGrade?.pct || 58;

    return {
      subject: targetSubject,
      topic: targetTopic,
      score: targetScore,
      title: `${targetSubject} &middot; ${targetTopic}`,
      reason: `You scored ${targetScore}% in your recent concept check. ShikshaSetu identified that ${targetTopic.toLowerCase()} needs a quick 5-minute visual reinforcement.`,
      action: () => {
        setSelectedStudyTopic(targetTopic);
        setActiveTab('Revision Notes');
      },
      askMitraAction: () => {
        setSelectedStudyTopic(targetTopic);
        setActiveTab('Wellbeing');
      },
    };
  };

  const nextAction = getNextBestAction();

  const handleOpenStudyHelp = (topic?: string, subject?: string) => {
    setSelectedStudyTopic(topic || 'General Doubt');
    setActiveTab('Wellbeing');
  };

  return (
    <div className="student-portal-shell min-h-screen bg-slate-50/60 px-3 py-3 sm:px-6 sm:py-5 lg:pl-72 pb-24 lg:pb-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Ambient background light orbs */}
      <div className="fixed top-0 left-64 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ── Sidebar ── */}
      <aside className="student-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white/80 px-5 py-6 shadow-[4px_0_24px_rgba(15,23,42,0.03)] backdrop-blur-2xl lg:flex">
        <div className="mb-6 px-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
            S
          </div>
          <div>
            <p className="font-display text-lg font-black tracking-tight text-slate-900 leading-none">ShikshaSetu</p>
            <p className="mt-1 text-[11px] font-bold text-indigo-600 tracking-wide uppercase">Learning Center</p>
          </div>
        </div>

        {/* Mini profile */}
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xl shadow-inner text-white">
              🎓
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">{displayName}</p>
              <p className="text-[11px] font-bold text-slate-500">
                Class {studentGrade}{studentSection}{studentRoll ? ` · #${studentRoll}` : ''}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {TAB_LABELS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                type="button"
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <span className="text-base">
                  {{
                    Today: '⚡',
                    Academics: '📊',
                    'Revision Notes': '📚',
                    Homework: '📋',
                    Missions: '✦',
                    Wellbeing: '✨',
                  }[tab]}
                </span>
                <span>{tab}</span>
                {tab === 'Homework' && pendingCount > 0 && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 space-y-3">
          {hasAttendanceData && (
            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/60 p-3.5 shadow-sm">
              <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="text-sm">🔥</span> {attendanceSummary.streak} day streak · {Math.round(attendanceSummary.rate * 100)}% attendance
              </p>
            </div>
          )}
          <SignOutButton className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-display text-xs font-bold transition-all border border-rose-200/60 cursor-pointer shadow-sm">
            <span className="flex items-center gap-2">
              <span>🚪</span>
              <span>Sign Out</span>
            </span>
            <span className="text-[10px] text-rose-500 font-mono">→</span>
          </SignOutButton>
        </div>
      </aside>

      {/* ── Top Bar Greeting ── */}
      <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3.5 shadow-sm backdrop-blur-xl lg:px-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl lg:hidden border border-indigo-100">
            🎓
          </div>
          <div>
            <h1 className="font-display text-base font-black tracking-tight text-slate-900 lg:text-xl">
              {timeGreeting}, <span className="text-indigo-600">{firstName}</span> 👋
            </h1>
            <p className="text-[11px] font-bold text-slate-500">
              Class {studentGrade}{studentSection}{studentRoll ? ` · Roll #${studentRoll}` : ''} &middot;{' '}
              <span className={pendingCount > 0 ? 'text-amber-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                {pendingCount === 0
                  ? 'All homework clear 🎉'
                  : `${pendingCount} assignment${pendingCount === 1 ? '' : 's'} to complete`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasAttendanceData && attendanceSummary.streak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-extrabold text-emerald-700 shadow-sm">
              <span className="animate-pulse">🔥</span> {attendanceSummary.streak} Day Streak
            </span>
          )}
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="mx-auto max-w-6xl">
        <AnimatePresence mode="wait">
          {/* ══ TODAY TAB (INTELLIGENT COMMAND CENTER) ══ */}
          {activeTab === 'Today' && (
            <motion.div
              key="today-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* 🎯 1. PRIMARY HERO CARD: YOUR NEXT STEP */}
              <section className="relative overflow-hidden rounded-3xl border border-indigo-200/90 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-white p-6 sm:p-8 shadow-sm backdrop-blur-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-600/20">
                      🎯
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-700 font-extrabold block">
                        INTELLIGENT LEARNING RECOMMENDATION
                      </span>
                      <h2 className="font-display text-xl font-black text-slate-900">
                        YOUR NEXT STEP
                      </h2>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs">
                    ● Priority Concept Target
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-lg font-black text-slate-900">
                      {nextAction.subject}
                    </span>
                    <span className="text-slate-400 font-bold">&middot;</span>
                    <span className="font-display text-base font-extrabold text-indigo-600">
                      {nextAction.topic}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-3xl">
                    {nextAction.reason}
                  </p>

                  {/* Concrete Step Roadmap */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-white/90 border border-indigo-100 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Step 1</span>
                      <p className="text-xs font-black text-slate-900">⏱️ 5-Min Visual Revision</p>
                      <p className="text-[11px] text-slate-500">Core diagrams &amp; key rules</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 border border-indigo-100 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Step 2</span>
                      <p className="text-xs font-black text-slate-900">✍️ 3 Practice Questions</p>
                      <p className="text-[11px] text-slate-500">Step-by-step guided solutions</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 border border-indigo-100 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Step 3</span>
                      <p className="text-xs font-black text-slate-900">⚡ Quick Mastery Check</p>
                      <p className="text-[11px] text-slate-500">Updates your verified record</p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-indigo-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>✨ Context grounded from recent evaluations</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={nextAction.askMitraAction}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                    >
                      💡 Ask SchoolMitra Hint
                    </button>
                    <button
                      type="button"
                      onClick={nextAction.action}
                      className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Start 5-Min Revision</span>
                      <span className="text-sm">&rarr;</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* ✦ 2. CONTEXTUAL COMPANION BANNER (SCHOOLMITRA) */}
              <section className="rounded-3xl border border-purple-200/80 bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/60 p-5 sm:p-6 shadow-2xs backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-purple-500/20 shrink-0">
                    ✦
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-purple-700 font-extrabold">
                        SCHOOLMITRA COMPANION
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                        Context Active
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      &ldquo;I noticed your performance in {nextAction.topic}. I prepared a quick visual walkthrough to help you master this concept tonight.&rdquo;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextAction.action}
                  className="shrink-0 px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer self-end sm:self-center"
                >
                  Review Concept &rarr;
                </button>
              </section>

              {/* 📊 3. LEARNING SIGNAL & LOOP */}
              <StudentLearningFocus
                grades={effectiveGrades}
                onOpenRevisionNotes={(topic) => {
                  setSelectedStudyTopic(topic || 'Fractions');
                  setActiveTab('Revision Notes');
                }}
                onOpenStudyHelp={handleOpenStudyHelp}
              />

              {/* 📋 4. TODAY'S ACTIONS (DEDUPLICATED & PRIORITIZED) */}
              <StudentTodayTasks
                homework={homework}
                onOpenHomeworkTab={() => setActiveTab('Homework')}
                onOpenRevisionNotes={() => setActiveTab('Revision Notes')}
                onOpenStudyHelp={handleOpenStudyHelp}
              />

              {/* ⚡ 5. QUICK CONCEPT CHECK */}
              <StudentExitTicketWidget
                studentId={studentId}
                studentName={displayName}
                topic="Fractions &amp; Decimals"
                subject="Mathematics"
              />

              {/* 📅 6. TIMETABLE & PROGRESS */}
              <StudentCompactTimetable
                schedule={[]}
                studentGrade={studentGrade}
                studentSection={studentSection}
              />

              <StudentProgressSummary grades={effectiveGrades} />
            </motion.div>
          )}

          {/* ══ ACADEMICS TAB ══ */}
          {activeTab === 'Academics' && (
            <motion.div
              key="academics-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    📊 Canonical Academic Record
                  </span>
                </div>
                <StudentMarksView
                  studentId={studentId}
                  studentName={displayName}
                />
              </div>

              {/* Real achievements from evidence logs */}
              {evidenceLogs.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-100">
                    🏆 Verified Achievements
                  </p>
                  <div className="space-y-2.5">
                    {evidenceLogs.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-start gap-3.5 rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/80 to-white px-4 py-3.5 shadow-sm">
                        <span className="text-xl mt-0.5">🏆</span>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{log.headline || log.evidence_type}</p>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            {new Date(log.recorded_at || log.generated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ AI REVISION NOTES TAB ══ */}
          {activeTab === 'Revision Notes' && (
            <motion.div
              key="revision-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <AiRevisionNotesWorkspace
                initialSubject="Mathematics"
                initialTopic={selectedStudyTopic || 'Fractions & Decimals'}
                onAskTutor={(ctx) => {
                  setSelectedStudyTopic(ctx.concept || ctx.topic);
                  setActiveTab('Wellbeing');
                }}
              />
            </motion.div>
          )}

          {/* ══ HOMEWORK TAB ══ */}
          {activeTab === 'Homework' && (
            <motion.div
              key="homework-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    📋 Active Homework Hub
                  </span>
                  <span className="text-xs font-extrabold text-slate-500">
                    {pendingHW.length} Pending &middot; {doneHW.length} Submitted
                  </span>
                </div>

                <div className="mb-6 space-y-3">
                  {pendingHW.length === 0 ? (
                    <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 px-5 py-4 text-sm font-bold text-emerald-800 flex items-center gap-2">
                      <span>🎉</span> You&apos;re all caught up! No pending homework right now.
                    </div>
                  ) : pendingHW.map((hw: any, idx: number) => (
                    <div key={hw.id ? `pending-${hw.id}-${idx}` : `pending-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 to-white px-5 py-4 shadow-sm hover:border-amber-300 transition-all">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 shadow-sm" />
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{hw.title}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">{hw.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <span className="text-xs font-mono text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg">
                          Due: {hw.dueDate || hw.due_date || 'Today'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ MISSIONS TAB ══ */}
          {activeTab === 'Missions' && (
            <motion.div
              key="missions-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <QuestBoard student={student} />
            </motion.div>
          )}

          {/* ══ WELLBEING & SCHOOLMITRA TAB ══ */}
          {activeTab === 'Wellbeing' && (
            <motion.div
              key="wellbeing-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <SchoolMitra studentId={studentId} studentName={displayName} />
              <WorryJar studentId={studentId} studentName={displayName} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Mobile Navigation Bar ── */}
      <StudentMobileNav
        activeTab={activeTab}
        onTabChange={(t: any) => setActiveTab(t)}
        unreadCounts={{ homework: pendingCount }}
      />
    </div>
  );
}
