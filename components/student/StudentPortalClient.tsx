'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignOutButton } from '@/components/auth/SignOutButton';
import SchoolMitra from '@/components/student/SchoolMitra';
import QuestBoard from '@/components/student/QuestBoard';
import StudentTodayTasks from '@/components/student/StudentTodayTasks';
import StudentCompactTimetable from '@/components/student/StudentCompactTimetable';
import StudentLearningFocus from '@/components/student/StudentLearningFocus';
import StudentUpcomingTests from '@/components/student/StudentUpcomingTests';
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

  const displayName = student?.displayName || 'Student';
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
  const homework = (Array.isArray(canonicalState?.homework) && canonicalState.homework.length > 0)
    ? canonicalState.homework
    : (student?.homework || []);

  const pendingHW = (homework || []).filter((h: any) => Boolean(h && !h.isSubmitted && !h.is_submitted));
  const doneHW = (homework || []).filter((h: any) => Boolean(h && (h.isSubmitted || h.is_submitted)));

  const attendanceSummary = canonicalState?.attendanceSummary || { rate: 0, streak: 0, totalDays: 0 };
  const hasAttendanceData = attendanceSummary.totalDays > 0;

  const studentGrade = student?.grade || '8';
  const studentSection = student?.section || 'A';
  const studentRoll = student?.roll_number || '';
  const studentGrades = student?.grades || [];
  const effectiveGrades = studentGrades.length > 0 ? studentGrades : (canonicalState?.grades || []);

  // Evidence logs for real achievements
  const evidenceLogs = canonicalState?.evidenceLogs || [];

  const pendingCount = pendingHW.length;
  const studentId = student?.studentId || student?.id || '';

  // ── Derive "Next Best Action" from real data ──
  const getNextBestAction = () => {
    // Priority 1: Overdue homework
    const overdueHW = pendingHW.find((h: any) => {
      const rawDue = (h.dueDate || h.due_date || '').toLowerCase();
      return rawDue.includes('today') || rawDue.includes('urgent');
    });
    if (overdueHW) {
      return {
        icon: '📋',
        label: `Submit ${overdueHW.subject} homework — due today`,
        action: () => setActiveTab('Homework'),
        urgency: 'high' as const,
        ctaText: 'Submit Homework →',
      };
    }

    // Priority 2: Any pending homework
    if (pendingHW.length > 0) {
      return {
        icon: '📝',
        label: `Complete ${pendingHW[0].title}`,
        action: () => setActiveTab('Homework'),
        urgency: 'medium' as const,
        ctaText: 'View Task →',
      };
    }

    // Priority 3: Weak subject to revise
    const weakGrade = effectiveGrades
      .filter((g: any) => (g.maxScore || g.max_score || 0) > 0)
      .map((g: any) => ({
        ...g,
        pct: Math.round((g.score / (g.maxScore || g.max_score || 100)) * 100),
      }))
      .sort((a: any, b: any) => a.pct - b.pct)[0];

    if (weakGrade && weakGrade.pct < 80) {
      return {
        icon: '💡',
        label: `Revise ${weakGrade.subject} — your recent assessment was ${weakGrade.pct}%`,
        action: () => setActiveTab('Revision Notes'),
        urgency: 'low' as const,
        ctaText: 'Start Revision →',
      };
    }

    // Priority 4: All caught up
    return {
      icon: '🎉',
      label: 'All caught up for today! Sharpen your knowledge with AI Revision Notes.',
      action: () => setActiveTab('Revision Notes'),
      urgency: 'none' as const,
      ctaText: 'Explore Notes →',
    };
  };

  const nextAction = getNextBestAction();

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
            <p className="mt-1 text-[11px] font-bold text-indigo-600 tracking-wide uppercase">Student Hub</p>
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

      {/* ── Top bar ── */}
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
              Class {studentGrade}{studentSection}{studentRoll ? ` · Roll #${studentRoll}` : ''} ·{' '}
              <span className={pendingCount > 0 ? 'text-amber-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                {pendingCount === 0
                  ? 'All caught up 🎉'
                  : `${pendingCount} task${pendingCount === 1 ? '' : 's'} pending`}
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

      {/* ── Main content area ── */}
      <main className="mx-auto max-w-6xl">
        <AnimatePresence mode="wait">
          {/* ══ TODAY TAB ══ */}
          {activeTab === 'Today' && (
            <motion.div
              key="today-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* 🎯 Next Best Action — visually dominant hero card */}
              <section className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-white p-6 shadow-sm backdrop-blur-xl group">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700">
                      <span>🎯</span>
                      <span>Next Best Action</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl">{nextAction.icon}</span>
                      <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                        {nextAction.label}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, translateY: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={nextAction.action}
                    className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-xs font-black text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
                  >
                    <span>{nextAction.ctaText}</span>
                  </motion.button>
                </div>
              </section>

              {/* ⚡ Live Quick Check / Exit Ticket from Teacher */}
              <StudentExitTicketWidget
                studentId={studentId}
                studentName={displayName}
                topic="Fractions & Decimals"
                subject="Mathematics"
              />

              {/* Today's homework tasks */}
              <StudentTodayTasks
                homework={homework}
                onOpenHomeworkTab={() => setActiveTab('Homework')}
                onOpenRevisionNotes={() => setActiveTab('Revision Notes')}
                onOpenStudyHelp={() => setActiveTab('Wellbeing')}
              />

              {/* Timetable */}
              <StudentCompactTimetable
                schedule={[]}
                studentGrade={studentGrade}
                studentSection={studentSection}
              />

              {/* Learning Focus — actionable weak areas */}
              <StudentLearningFocus
                grades={effectiveGrades}
                onOpenRevisionNotes={() => setActiveTab('Revision Notes')}
                onOpenStudyHelp={() => setActiveTab('Wellbeing')}
              />

              {/* Progress summary */}
              <StudentProgressSummary grades={effectiveGrades} />

              {/* Study help entry point */}
              <StudentStudyHelpCard onAskAI={() => setActiveTab('Wellbeing')} />
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
                    📊 Academic Record
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

              {evidenceLogs.length === 0 && effectiveGrades.length === 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-10 text-center shadow-sm">
                  <span className="text-4xl block mb-3">📊</span>
                  <p className="text-base font-extrabold text-slate-900">No academic reports yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Your verified assessment results and milestones will appear here as soon as teachers publish evaluations.</p>
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
              <AiRevisionNotesWorkspace onAskTutor={() => setActiveTab('Wellbeing')} />
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
                    {pendingHW.length} Pending · {doneHW.length} Submitted
                  </span>
                </div>

                {/* Pending */}
                <p className="mb-3 text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⏳</span> Action Required ({pendingHW.length})
                </p>
                <div className="mb-6 space-y-3">
                  {pendingHW.length === 0 ? (
                    <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 px-5 py-4 text-sm font-bold text-emerald-800 flex items-center gap-2">
                      <span>🎉</span> You're all caught up! No pending homework right now.
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
                        <span className="rounded-full bg-amber-100/80 border border-amber-200 px-3 py-1 text-[11px] font-extrabold text-amber-800 whitespace-nowrap">
                          Due {hw.dueDate || hw.due_date}
                        </span>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab('Wellbeing')}
                          className="rounded-xl bg-indigo-50 border border-indigo-200/80 px-3 py-1 text-xs font-extrabold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                        >
                          Ask AI Mitra
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submitted */}
                {doneHW.length > 0 && (
                  <>
                    <p className="mb-3 text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✓</span> Completed & Submitted ({doneHW.length})
                    </p>
                    <div className="space-y-2.5">
                      {doneHW.map((hw: any, idx: number) => (
                        <div key={hw.id ? `done-${hw.id}-${idx}` : `done-${idx}`} className="flex items-start gap-3 rounded-2xl bg-slate-50/90 border border-slate-200/60 px-4 py-3 opacity-80">
                          <span className="mt-0.5 text-emerald-600 font-black">✓</span>
                          <div className="flex-1">
                            <p className="text-xs font-extrabold text-slate-800">{hw.title}</p>
                            <p className="text-[11px] text-slate-500">{hw.subject} · Submitted {hw.submittedAt || hw.submitted_at || 'Recently'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block border border-indigo-100">
                  ✦ Quests & Milestones
                </p>
                <QuestBoard
                  student={student}
                  setActiveAvatar={() => {}}
                  setActiveTitle={() => {}}
                  activeAvatar="🎓"
                  activeTitle=""
                />
              </div>
            </motion.div>
          )}

          {/* ══ WELLBEING & AI STUDY HELP TAB ══ */}
          {activeTab === 'Wellbeing' && (
            <motion.div
              key="wellbeing-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <SchoolMitra studentName={displayName} studentId={studentId} />

              {/* WorryJar */}
              <div className="border-t border-slate-200/80 pt-6">
                <WorryJar studentId={studentId} studentName={displayName} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Mobile Navigation Bar ── */}
      <StudentMobileNav
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as Tab)}
        unreadCounts={{
          homework: pendingCount,
        }}
      />
    </div>
  );
}
