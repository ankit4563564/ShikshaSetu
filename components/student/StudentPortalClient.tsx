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
import { getCanonicalStudentState } from '@/lib/canonical';
import { usePortalSync } from '@/hooks/usePortalSync';
import { useTimeGreeting } from '@/lib/utils/timeGreeting';
import type { StudentWithFlag } from '@/lib/supabase/getStudentsData';

// Demo universe constants
import {
  TODAYS_SCHEDULE,
  ACHIEVEMENTS,
  UPCOMING_EXAMS,
} from '@/lib/demo/schoolUniverse';

import VisualMindMapWorkspace from '@/components/mindmap/VisualMindMapWorkspace';

interface StudentPortalClientProps {
  student?: StudentWithFlag;
}

const TAB_LABELS = [
  'Today',
  'Revision Maps',
  'Homework',
  'Exams',
  'Achievements',
  'Missions',
  'Wellbeing',
] as const;
type Tab = typeof TAB_LABELS[number];

export default function StudentPortalClient({ student }: StudentPortalClientProps) {
  const timeGreeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState<Tab>('Today');
  const [activeAvatar, setActiveAvatar] = useState('🎓');
  const [activeTitle, setActiveTitle] = useState('Level 3 Explorer');
  const [canonicalState, setCanonicalState] = useState<any>(null);

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

  const studentIdForChannel = student?.studentId || student?.id || 's1000000-0000-4000-8000-000000000001';
  const channelName = `school:sch-demo-001:parent:${studentIdForChannel}`;
  usePortalSync(channelName, handleSyncEvent, handleSyncEvent);

  useEffect(() => {
    handleSyncEvent();
  }, [handleSyncEvent]);

  // Safe check using Array.isArray to avoid TypeError on .length
  const homework = (Array.isArray(canonicalState?.homework) && canonicalState.homework.length > 0)
    ? canonicalState.homework
    : (student?.homework || []);

  const pendingHW = (homework || []).filter((h: any) => Boolean(h && !h.isSubmitted && !h.is_submitted));
  const doneHW = (homework || []).filter((h: any) => Boolean(h && (h.isSubmitted || h.is_submitted)));

  // Use canonical attendance if available
  const attendanceSummary = canonicalState?.attendanceSummary || { rate: 0.97, streak: 14 };

  const studentGrade = student?.grade || '8';
  const studentSection = student?.section || 'A';
  const studentRoll = student?.roll_number || '801';
  const studentGrades = student?.grades || [];
  const effectiveGrades = studentGrades.length > 0 ? studentGrades : (canonicalState?.grades || []);

  const pendingCount = pendingHW.length;

  return (
    <div className="student-portal-shell min-h-screen bg-paper px-3 py-3 sm:px-6 sm:py-5 lg:pl-72 pb-24 lg:pb-8">

      {/* ── Sidebar ── */}
      <aside className="student-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/60 bg-white/65 px-5 py-7 shadow-[8px_0_35px_rgba(63,81,181,.06)] backdrop-blur-xl lg:flex">
        <div className="mb-6 px-2">
          <p className="font-display text-xl font-extrabold tracking-tight text-primary">ShikshaSetu</p>
          <p className="mt-0.5 text-xs font-semibold text-muted">Your learning universe</p>
        </div>

        {/* mini profile */}
        <div className="mb-6 rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeAvatar}</span>
            <div>
              <p className="text-sm font-extrabold text-primary">{displayName}</p>
              <p className="text-[11px] font-bold text-muted">{activeTitle}</p>
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
                'Revision Maps': '🗺️',
                Homework: '📋',
                Exams: '📝',
                Achievements: '🏆',
                Missions: '✦',
                Wellbeing: '◌',
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
          <div className="rounded-2xl bg-secondary/10 p-3">
            <p className="text-[11px] font-bold text-[#1f4e5f]">Grade {studentGrade}{studentSection} · Roll #{studentRoll}</p>
          </div>
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
              Class {studentGrade}{studentSection} · Roll #{studentRoll} ·{' '}
              <span className={pendingCount > 0 ? 'text-amber-700' : 'text-sage'}>
                {pendingCount === 0
                  ? 'All caught up 🎉'
                  : `${pendingCount} thing${pendingCount === 1 ? '' : 's'} to finish today`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-sage/15 px-3 py-1 text-xs font-extrabold text-sage sm:inline-block">
            🔥 {attendanceSummary.streak} day streak
          </span>
          <span className="rounded-full bg-marigold/15 px-3 py-1 text-xs font-extrabold text-marigold">
            ⭐ 420 Coins
          </span>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="mx-auto max-w-6xl space-y-5">

        {/* ══ TODAY TAB (PRIORITIZED & SIMPLIFIED) ══ */}
        {activeTab === 'Today' && (
          <div className="space-y-5">
            {/* Priority 1: What to finish today */}
            <StudentTodayTasks
              homework={homework}
              onOpenHomeworkTab={() => setActiveTab('Homework')}
              onOpenRevisionMaps={() => setActiveTab('Revision Maps')}
            />

            {/* Priority 2: What class is next */}
            <StudentCompactTimetable
              schedule={TODAYS_SCHEDULE}
              studentGrade={studentGrade}
              studentSection={studentSection}
            />

            {/* Priority 3: What to study next (real learning focus) */}
            <StudentLearningFocus
              grades={effectiveGrades}
              onOpenRevisionMaps={() => setActiveTab('Revision Maps')}
              onOpenStudyHelp={() => setActiveTab('Wellbeing')}
            />

            {/* Priority 4: Upcoming Tests & Progress side-by-side */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <StudentUpcomingTests
                exams={UPCOMING_EXAMS}
                onPrepareExam={() => setActiveTab('Revision Maps')}
              />
              <StudentProgressSummary grades={effectiveGrades} />
            </div>

            {/* Priority 5: Study Help (Clean, uncluttered AI entry point) */}
            <StudentStudyHelpCard onAskAI={() => setActiveTab('Wellbeing')} />

            {/* Secondary navigation footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 py-1 text-xs text-muted">
              <span>Looking for your badges, quests, or rewards?</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('Achievements')}
                  className="font-bold text-deep-teal hover:underline cursor-pointer"
                >
                  🏆 Badges &amp; Trophy Cabinet →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('Missions')}
                  className="font-bold text-deep-teal hover:underline cursor-pointer"
                >
                  ✦ Missions &amp; Quests →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ REVISION MIND MAPS TAB ══ */}
        {activeTab === 'Revision Maps' && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <VisualMindMapWorkspace />
          </section>
        )}

        {/* ══ HOMEWORK TAB ══ */}
        {activeTab === 'Homework' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Homework timeline</p>
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
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 whitespace-nowrap">
                    Due {hw.dueDate || hw.due_date}
                  </span>
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

        {/* ══ EXAMS TAB ══ */}
        {activeTab === 'Exams' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Exams &amp; Assessments</p>
            {effectiveGrades.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center">
                <span className="text-2xl block mb-1">📝</span>
                <p className="text-xs font-bold text-deep-teal">No exam scores released yet</p>
                <p className="text-[11px] text-muted">Assessment evaluations will appear here once published by your teachers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {effectiveGrades.map((g: any, idx: number) => {
                  const max = g.maxScore || g.max_score || 100;
                  const score = g.score || 0;
                  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
                  return (
                    <div key={g.id || `grade-${idx}`} className="flex items-center justify-between rounded-xl border border-primary/10 bg-white p-4">
                      <div>
                        <p className="text-sm font-extrabold text-deep-teal">{g.assessmentName || g.assessment_name || 'Assessment'}</p>
                        <p className="text-[11px] font-semibold text-muted">{g.subject} · {g.assessmentDate || g.assessment_date || 'Recent'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-black text-primary">{score}/{max}</p>
                        <p className="text-[10px] font-bold text-sage">{pct}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══ ACHIEVEMENTS TAB (ENRICHED WITH BADGES + PEER RECOGNITION) ══ */}
        {activeTab === 'Achievements' && (
          <div className="space-y-5">
            {/* Badges & Trophy Cabinet */}
            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Badges &amp; Trophy Cabinet</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {ACHIEVEMENTS.map(ach => (
                  <div key={ach.id} className={`rounded-xl border p-4 text-center ${ach.unlocked ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                    <span className="text-4xl block mb-2">{ach.icon}</span>
                    <p className="text-sm font-extrabold text-deep-teal">{ach.title}</p>
                    <p className="mt-1 text-[11px] font-semibold text-muted">{ach.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Peer Recognition & Growth (Moved out of main dashboard into Achievements) */}
            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">Peer Recognition &amp; Social Growth</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="p-3.5 rounded-2xl bg-white border border-sage/20 shadow-2xs space-y-1">
                  <span className="text-2xl block">🌟</span>
                  <p className="text-xs font-bold text-ink">Star Performer</p>
                  <p className="text-[10px] font-medium text-muted">Science quiz high score</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-sage/20 shadow-2xs space-y-1">
                  <span className="text-2xl block">🤝</span>
                  <p className="text-xs font-bold text-ink">Helped Classmate</p>
                  <p className="text-[10px] font-medium text-muted">Peer kindness</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-sage/20 shadow-2xs space-y-1">
                  <span className="text-2xl block">🎯</span>
                  <p className="text-xs font-bold text-ink">Public Speaking</p>
                  <p className="text-[10px] font-medium text-muted">Current growth goal</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ══ MISSIONS TAB (QUESTS, SHOP & LEADERBOARD) ══ */}
        {activeTab === 'Missions' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Learning Quests &amp; Reward Shop</p>
            <QuestBoard
              student={student}
              setActiveAvatar={setActiveAvatar}
              setActiveTitle={setActiveTitle}
              activeAvatar={activeAvatar}
              activeTitle={activeTitle}
            />
          </section>
        )}

        {/* ══ WELLBEING & STUDY HELP TAB ══ */}
        {activeTab === 'Wellbeing' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">School Mitra Socratic Coach &amp; Wellbeing</p>
            <SchoolMitra studentName={displayName} studentId={studentIdForChannel} />
          </section>
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
