'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import SchoolMitra from '@/components/student/SchoolMitra';
import QuestBoard from '@/components/student/QuestBoard';
import { StudentCopilotStrip } from '@/components/copilot/StudentCopilotStrip';
import { getCanonicalStudentState } from '@/lib/canonical';
import { usePortalSync } from '@/hooks/usePortalSync';
import { useTimeGreeting } from '@/lib/utils/timeGreeting';
// Fallback to demo universe for data not yet in canonical
import {
  TODAYS_SCHEDULE,
  ACHIEVEMENTS,
  UPCOMING_EXAMS,
  AI_STUDY_TIPS,
} from '@/lib/demo/schoolUniverse';

interface StudentPortalClientProps {
  student?: StudentWithFlag;
}

const TAB_LABELS = ['Today', 'Homework', 'Exams', 'Achievements', 'Missions', 'Wellbeing'] as const;
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
  const attendanceSummary = canonicalState?.attendanceSummary || { rate: 0.97, streak: 12 };

  const studyTipText = typeof AI_STUDY_TIPS[0] === 'string' 
    ? AI_STUDY_TIPS[0] 
    : (AI_STUDY_TIPS[0] as any)?.tip || '';

  const studentGrade = student?.grade || '8';
  const studentSection = student?.section || 'A';
  const studentRoll = student?.roll_number || '14';
  const studentGrades = student?.grades || [];

  return (
    <div className="student-portal-shell min-h-screen bg-paper px-3 py-3 sm:px-6 sm:py-5 lg:pl-72">

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
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {{ Today:'⌂', Homework:'📋', Exams:'📝', Achievements:'🏆', Missions:'✦', Wellbeing:'◌' }[tab]}
              <span>{tab}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 space-y-3">
          <div className="rounded-2xl bg-secondary/10 p-3">
            <p className="text-[11px] font-bold text-[#1f4e5f]">Grade {studentGrade}{studentSection} · Roll #{studentRoll}</p>
          </div>
          <SignOutButton className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-display text-xs font-bold transition-all border border-rose-200/60">
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
            <p className="text-[11px] font-semibold text-muted">
              Class {studentGrade}{studentSection} · Roll #{studentRoll}
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
        {/* Ambient Copilot strip */}
        <StudentCopilotStrip />

        {/* ══ TODAY TAB ══ */}
        {activeTab === 'Today' && (
          <>
            {/* Today schedule */}
            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Today&apos;s Schedule</p>
                  <h2 className="font-display text-base font-black text-deep-teal">Class {studentGrade}{studentSection} timetable</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  {TODAYS_SCHEDULE.length} classes today
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TODAYS_SCHEDULE.map((cls, i) => (
                  <div
                    key={cls.period}
                    className={`rounded-xl border p-4 transition ${
                      i === 1 ? 'border-primary/30 bg-primary/5 shadow-xs' : 'border-slate-100 bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider text-muted">
                      <span>{cls.time}</span>
                      {i === 1 && <span className="rounded-full bg-primary px-2 py-0.5 text-white">NEXT</span>}
                    </div>
                    <p className="mt-2 text-sm font-extrabold text-deep-teal">{cls.subject}</p>
                    <p className="text-[11px] font-semibold text-muted">{cls.teacher}</p>
                    <p className="mt-1 text-[10px] font-bold text-sage">{cls.room}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Study tip banner */}
            <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">✨</span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">AI Learning Nudge</p>
                  <h3 className="font-display text-sm font-black text-deep-teal">Quick tip for today&apos;s Science lab</h3>
                  <p className="mt-1 text-xs font-semibold text-muted leading-relaxed">
                    {studyTipText}
                  </p>
                </div>
              </div>
            </section>

            {/* School Mitra & Quest Board side by side */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <SchoolMitra studentName={displayName} />
              <QuestBoard student={student} />
            </div>

            {/* Peer recognition cards */}
            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">Peer Recognition &amp; Growth</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs space-y-1">
                  <span className="text-lg block">🌟</span>
                  <p className="text-xs font-bold text-ink">Star Performer</p>
                  <small className="text-[9px] font-medium text-muted/60">Science quiz high score</small>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs space-y-1">
                  <span className="text-lg block">🤝</span>
                  <p className="text-xs font-bold text-ink">Helped Classmate</p>
                  <small className="text-[9px] font-medium text-muted/60">Peer kindness</small>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs space-y-1">
                  <span className="text-lg block">🎯</span>
                  <p className="text-xs font-bold text-ink">Public Speaking</p>
                  <small className="text-[9px] font-medium text-muted/60">Current goal</small>
                </div>
              </div>
            </section>

            {/* Upcoming exams strip */}
            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">Upcoming tests</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {UPCOMING_EXAMS.map(exam => (
                  <div key={exam.id} className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm font-extrabold text-primary">{exam.subject}</p>
                    <p className="mt-1 text-[11px] font-bold text-deep-teal">{exam.date}</p>
                    <p className="text-[10px] text-muted">{exam.type}</p>
                    <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{exam.daysLeft} days left</span>
                  </div>
                ))}
              </div>
            </section>
          </>
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
            <div className="space-y-3">
              {studentGrades.map((g, idx) => (
                <div key={g.id || `grade-${idx}`} className="flex items-center justify-between rounded-xl border border-primary/10 bg-white p-4">
                  <div>
                    <p className="text-sm font-extrabold text-deep-teal">{g.assessmentName}</p>
                    <p className="text-[11px] font-semibold text-muted">{g.subject} · {g.assessmentDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-black text-primary">{g.score}/{g.maxScore}</p>
                    <p className="text-[10px] font-bold text-sage">{Math.round((g.score / g.maxScore) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ ACHIEVEMENTS TAB ══ */}
        {activeTab === 'Achievements' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Badges &amp; Trophy Cabinet</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {ACHIEVEMENTS.map(ach => (
                <div key={ach.id} className={`rounded-xl border p-4 text-center ${ach.unlocked ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                  <span className="text-4xl block mb-2">{ach.icon}</span>
                  <p className="text-sm font-extrabold text-deep-teal">{ach.title}</p>
                  <p className="mt-1 text-[11px] font-semibold text-muted">{ach.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ MISSIONS TAB ══ */}
        {activeTab === 'Missions' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Weekly Learning Quests</p>
            <QuestBoard student={student} />
          </section>
        )}

        {/* ══ WELLBEING TAB ══ */}
        {activeTab === 'Wellbeing' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">Daily Check-in &amp; Wellness</p>
            <SchoolMitra studentName={displayName} />
          </section>
        )}

      </main>
    </div>
  );
}
