'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
      };
    }

    // Priority 2: Any pending homework
    if (pendingHW.length > 0) {
      return {
        icon: '📋',
        label: `Complete ${pendingHW[0].title}`,
        action: () => setActiveTab('Homework'),
        urgency: 'medium' as const,
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
        icon: '📖',
        label: `Revise ${weakGrade.subject} — your recent score was ${weakGrade.pct}%`,
        action: () => setActiveTab('Revision Notes'),
        urgency: 'low' as const,
      };
    }

    // Priority 4: All caught up
    return {
      icon: '🎉',
      label: 'All caught up! Read revision notes or ask a doubt.',
      action: () => setActiveTab('Revision Notes'),
      urgency: 'none' as const,
    };
  };

  const nextAction = getNextBestAction();

  return (
    <div className="student-portal-shell min-h-screen bg-paper px-3 py-3 sm:px-6 sm:py-5 lg:pl-72 pb-24 lg:pb-8">

      {/* ── Sidebar ── */}
      <aside className="student-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/60 bg-white/65 px-5 py-7 shadow-[8px_0_35px_rgba(63,81,181,.06)] backdrop-blur-xl lg:flex">
        <div className="mb-6 px-2">
          <p className="font-display text-xl font-extrabold tracking-tight text-primary">ShikshaSetu</p>
          <p className="mt-0.5 text-xs font-semibold text-muted">Your learning companion</p>
        </div>

        {/* Mini profile — no fake levels */}
        <div className="mb-6 rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <div>
              <p className="text-sm font-extrabold text-primary">{displayName}</p>
              <p className="text-[11px] font-bold text-muted">
                Class {studentGrade}{studentSection}{studentRoll ? ` · Roll #${studentRoll}` : ''}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {TAB_LABELS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {{
                Today: '⌂',
                Academics: '📊',
                'Revision Notes': '📚',
                Homework: '📋',
                Missions: '✦',
                Wellbeing: '✨',
              }[tab]}
              <span>{tab}</span>
              {tab === 'Homework' && pendingCount > 0 && (
                <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.2 text-[10px] font-extrabold text-amber-800">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 space-y-3">
          {hasAttendanceData && (
            <div className="rounded-2xl bg-sage/10 border border-sage/20 p-3">
              <p className="text-[11px] font-bold text-sage">
                🔥 {attendanceSummary.streak} day streak · {Math.round(attendanceSummary.rate * 100)}% attendance
              </p>
            </div>
          )}
          <SignOutButton className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-display text-xs font-bold transition-all border border-rose-200/60 cursor-pointer">
            <span className="flex items-center gap-2">
              <span>🚪</span>
              <span>Sign Out</span>
            </span>
            <span className="text-[10px] text-rose-500 font-mono">→</span>
          </SignOutButton>
        </div>
      </aside>

      {/* ── Top bar ── */}
      <header className="mx-auto mb-5 flex max-w-6xl items-center justify-between rounded-2xl border border-white/75 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-base lg:hidden">
            🎓
          </div>
          <div>
            <h1 className="font-display text-base font-black tracking-tight text-deep-teal lg:text-lg">
              {timeGreeting}, {firstName}
            </h1>
            <p className="text-[11px] font-bold text-muted">
              Class {studentGrade}{studentSection}{studentRoll ? ` · Roll #${studentRoll}` : ''} ·{' '}
              <span className={pendingCount > 0 ? 'text-amber-700' : 'text-sage'}>
                {pendingCount === 0
                  ? 'All caught up 🎉'
                  : `${pendingCount} thing${pendingCount === 1 ? '' : 's'} to finish`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasAttendanceData && attendanceSummary.streak > 0 && (
            <span className="hidden rounded-full bg-sage/15 px-3 py-1 text-xs font-extrabold text-sage sm:inline-block">
              🔥 {attendanceSummary.streak} day streak
            </span>
          )}
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="mx-auto max-w-6xl space-y-5">

        {/* ══ TODAY TAB ══ */}
        {activeTab === 'Today' && (
          <div className="space-y-5">
            {/* 🎯 Next Best Action — the most important element */}
            <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 via-primary/3 to-white p-5 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary/60 mb-2">
                🎯 Your Next Best Action
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{nextAction.icon}</span>
                  <p className="text-sm font-bold text-deep-teal">{nextAction.label}</p>
                </div>
                {nextAction.urgency !== 'none' && (
                  <button
                    type="button"
                    onClick={nextAction.action}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-deep-teal px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-deep-teal/90 active:scale-95 cursor-pointer"
                  >
                    Start →
                  </button>
                )}
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

            {/* Timetable — uses demo data with clear label */}
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
          </div>
        )}

        {/* ══ ACADEMICS TAB — Real marks with AI explanation ══ */}
        {activeTab === 'Academics' && (
          <section className="space-y-5 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Your Academic Performance</p>
              <StudentMarksView
                studentId={studentId}
                studentName={displayName}
              />
            </div>

            {/* Real achievements from evidence logs */}
            {evidenceLogs.length > 0 && (
              <div className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                  Recent Achievements
                </p>
                <div className="space-y-2">
                  {evidenceLogs.slice(0, 5).map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 rounded-xl border border-sage/15 bg-sage/5 px-4 py-3">
                      <span className="text-lg mt-0.5">🏆</span>
                      <div>
                        <p className="text-xs font-bold text-deep-teal">{log.headline || log.evidence_type}</p>
                        <p className="text-[11px] text-muted">
                          {new Date(log.recorded_at || log.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {evidenceLogs.length === 0 && effectiveGrades.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                <span className="text-3xl block mb-2">📊</span>
                <p className="text-sm font-bold text-deep-teal">No academic data yet</p>
                <p className="text-xs text-muted mt-1">Your exam scores, achievements, and performance insights will appear here once your teachers publish evaluations.</p>
              </div>
            )}
          </section>
        )}

        {/* ══ AI REVISION NOTES TAB ══ */}
        {activeTab === 'Revision Notes' && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <AiRevisionNotesWorkspace onAskTutor={() => setActiveTab('Wellbeing')} />
          </section>
        )}

        {/* ══ HOMEWORK TAB ══ */}
        {activeTab === 'Homework' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Homework</p>
            {/* Pending */}
            <p className="mb-2 text-xs font-extrabold text-amber-600 uppercase tracking-wider">Pending · {pendingHW.length}</p>
            <div className="mb-5 space-y-2">
              {pendingHW.length === 0 ? (
                <p className="rounded-xl bg-sage/10 px-4 py-3 text-sm font-semibold text-sage">🎉 All caught up! No pending assignments.</p>
              ) : pendingHW.map((hw: any, idx: number) => (
                <div key={hw.id ? `pending-${hw.id}-${idx}` : `pending-${idx}`} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-deep-teal">{hw.title}</p>
                    <p className="text-[11px] text-muted">{hw.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 whitespace-nowrap">
                      Due {hw.dueDate || hw.due_date}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('Wellbeing')}
                      className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                      title="Get AI help with this homework"
                    >
                      Help
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Submitted */}
            <p className="mb-2 text-xs font-extrabold text-sage uppercase tracking-wider">Submitted · {doneHW.length}</p>
            <div className="space-y-2">
              {doneHW.map((hw: any, idx: number) => (
                <div key={hw.id ? `done-${hw.id}-${idx}` : `done-${idx}`} className="flex items-start gap-3 rounded-xl bg-sage/5 px-4 py-3 opacity-80">
                  <span className="mt-1 text-sage text-sm">✓</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-deep-teal">{hw.title}</p>
                    <p className="text-[11px] text-muted">{hw.subject} · Submitted {hw.submittedAt || hw.submitted_at || 'Recently'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ MISSIONS TAB (Quests & Rewards) ══ */}
        {activeTab === 'Missions' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Learning Quests & Rewards</p>
            <QuestBoard
              student={student}
              setActiveAvatar={() => {}}
              setActiveTitle={() => {}}
              activeAvatar="🎓"
              activeTitle=""
            />
          </section>
        )}

        {/* ══ WELLBEING & AI STUDY HELP TAB ══ */}
        {activeTab === 'Wellbeing' && (
          <div className="space-y-5">
            <SchoolMitra studentName={displayName} studentId={studentId} />

            {/* WorryJar — optional, clearly explained */}
            <div className="border-t border-deep-teal/10 pt-5">
              <WorryJar studentId={studentId} studentName={displayName} />
            </div>
          </div>
        )}

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
