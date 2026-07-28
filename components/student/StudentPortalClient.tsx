'use client';

import { useState } from 'react';
import SchoolMitra from '@/components/student/SchoolMitra';
import QuestBoard from '@/components/student/QuestBoard';
import { StudentCopilotStrip } from '@/components/copilot/StudentCopilotStrip';
import type { StudentWithFlag } from '@/lib/supabase/getStudentsData';
import {
  TODAYS_SCHEDULE,
  HOMEWORK,
  ACHIEVEMENTS,
  UPCOMING_EXAMS,
  AI_STUDY_TIPS,
  ATTENDANCE_SUMMARY,
} from '@/lib/demo/schoolUniverse';

interface StudentPortalClientProps {
  student: StudentWithFlag;
}

const TAB_LABELS = ['Today', 'Homework', 'Exams', 'Achievements', 'Missions', 'Wellbeing'] as const;
type Tab = typeof TAB_LABELS[number];

export default function StudentPortalClient({ student }: StudentPortalClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Today');
  const [activeAvatar, setActiveAvatar] = useState('🎓');
  const [activeTitle, setActiveTitle] = useState('Level 3 Explorer');

  const firstName = student.displayName.split(' ')[0];
  const pendingHW = HOMEWORK.filter(h => !h.submitted);
  const doneHW    = HOMEWORK.filter(h =>  h.submitted);

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
              <p className="text-sm font-extrabold text-primary">{student.displayName}</p>
              <p className="text-[11px] font-bold text-muted">{activeTitle}</p>
            </div>
          </div>
          {/* ✅ C6 FIX: Removed streak/coins - shown in hero banner only */}
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

        <div className="mt-auto rounded-2xl bg-secondary/10 p-4">
          <p className="text-xs font-extrabold text-secondary">Maths test in 6 days</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">Ch.5–7 · Start revising today for best results.</p>
        </div>
      </aside>

      {/* ── Top bar ── */}
      <header className="mx-auto mb-5 flex max-w-6xl items-center justify-between rounded-2xl border border-white/75 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl lg:px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg text-primary lg:hidden">✦</span>
          <span className="text-xs font-extrabold uppercase tracking-[.16em] text-muted">Good morning, {firstName}</span>
        </div>
        {/* ✅ C6 FIX: Removed streak/coins badges - shown in hero banner only */}
      </header>

      {/* ── Mobile tab bar ── */}
      <div className="mx-auto mb-4 flex max-w-6xl gap-2 overflow-x-auto lg:hidden">
        {TAB_LABELS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === tab ? 'bg-primary text-white' : 'bg-white/70 text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <main className="mx-auto max-w-6xl space-y-5">

        {/* ══ TODAY TAB ══ */}
        {activeTab === 'Today' && (
          <>
            {/* Hero */}
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[#5967d0] p-6 text-white shadow-[0_22px_55px_rgba(63,81,181,.22)] sm:p-8">
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-100">Wednesday · 22 July 2026</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Good morning, {firstName}!</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-indigo-100">
                  You have {pendingHW.length} assignment{pendingHW.length !== 1 ? 's' : ''} due soon and your Maths test is in 6 days.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">📊 97% attendance</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">🔥 {ATTENDANCE_SUMMARY.streak}-day streak</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">⭐ 340 coins</span>
                </div>
              </div>
              <div aria-hidden className="absolute -right-10 -top-12 text-[180px] opacity-10">✦</div>
            </section>

            {/* ShikshaSetu Copilot Strip */}
            <StudentCopilotStrip />

            {/* AI Tip */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-600">✨ AI Insight for today</p>
              <p className="text-sm font-semibold text-amber-900">{AI_STUDY_TIPS[2].tip}</p>
            </div>

            {/* Today's timetable */}
            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">Today's timetable</p>
              <div className="space-y-2">
                {TODAYS_SCHEDULE.map((period, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${
                      period.status === 'current'
                        ? 'border border-primary/20 bg-primary/8 ring-1 ring-primary/15'
                        : period.status === 'done'
                        ? 'bg-deep-teal/[0.03] opacity-60'
                        : 'bg-white/50'
                    }`}
                  >
                    <span className="w-6 text-center text-base">{period.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${period.status === 'current' ? 'text-primary' : 'text-deep-teal'}`}>
                        {period.subject}
                        {period.status === 'current' && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" /> Now
                          </span>
                        )}
                      </p>
                      {period.teacher && (
                        <p className="text-[11px] text-muted">{period.teacher} · {period.room}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-muted">{period.time}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Pending homework */}
            {pendingHW.length > 0 && (
              <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Due soon</p>
                  <button type="button" onClick={() => setActiveTab('Homework')} className="text-xs font-bold text-primary hover:underline">See all →</button>
                </div>
                <div className="space-y-2">
                  {pendingHW.map(hw => (
                    <div key={hw.id} className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                      <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-deep-teal">{hw.subject}</p>
                        <p className="text-xs text-muted">{hw.title}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">Due {hw.dueDate}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 🌱 STUDENT GROWTH JOURNAL (Positive Student Development Card) */}
            <section className="rounded-3xl border border-sage/30 bg-gradient-to-br from-sage/10 via-white to-primary/5 p-6 shadow-sm backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  <div>
                    <h3 className="font-display text-sm font-extrabold text-ink">Student Growth Journal</h3>
                    <p className="text-[11px] font-medium text-muted/70">Weekly positive milestones & personal goals</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-sage/20 text-sage font-extrabold text-[10px] uppercase tracking-wider">
                  This Week
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs space-y-1">
                  <span className="text-lg block">😊</span>
                  <p className="text-xs font-bold text-ink">Feeling Confident</p>
                  <small className="text-[9px] font-medium text-muted/60">Weekly mood log</small>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs space-y-1">
                  <span className="text-lg block">🏆</span>
                  <p className="text-xs font-bold text-ink">Won Science Quiz</p>
                  <small className="text-[9px] font-medium text-muted/60">Academic win</small>
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
              ) : pendingHW.map(hw => (
                <div key={hw.id} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-deep-teal">{hw.title}</p>
                    <p className="text-[11px] text-muted">{hw.subject}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 whitespace-nowrap">Due {hw.dueDate}</span>
                </div>
              ))}
            </div>
            {/* Submitted */}
            <p className="mb-2 text-xs font-extrabold text-sage uppercase tracking-wider">Submitted · {doneHW.length}</p>
            <div className="space-y-2">
              {doneHW.map(hw => (
                <div key={hw.id} className="flex items-start gap-3 rounded-xl bg-sage/5 px-4 py-3 opacity-80">
                  <span className="mt-1 text-sage text-sm">✓</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-deep-teal">{hw.title}</p>
                    <p className="text-[11px] text-muted">{hw.subject} · Submitted {hw.submittedAt}</p>
                  </div>
                  {hw.grade && (
                    <span className="rounded-full bg-sage/10 px-2.5 py-0.5 text-[10px] font-bold text-sage">{hw.grade}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ EXAMS TAB ══ */}
        {activeTab === 'Exams' && (
          <div className="space-y-4">
            {UPCOMING_EXAMS.map(exam => (
              <div key={exam.id} className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-extrabold text-deep-teal">{exam.subject}</p>
                    <p className="text-sm font-bold text-primary">{exam.type}</p>
                    <p className="mt-1 text-xs text-muted">{exam.date} · {exam.time}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    exam.daysLeft <= 3 ? 'bg-warm-clay/10 text-warm-clay' : 'bg-primary/10 text-primary'
                  }`}>{exam.daysLeft} days left</span>
                </div>
                <div className="mt-3 rounded-xl bg-deep-teal/5 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Syllabus</p>
                  <p className="mt-1 text-sm font-semibold text-deep-teal">{exam.syllabus}</p>
                </div>
                {/* AI tip per exam */}
                {AI_STUDY_TIPS.find(t => t.subject === exam.subject) && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3">
                    <span className="text-base">{AI_STUDY_TIPS.find(t => t.subject === exam.subject)!.icon}</span>
                    <p className="text-xs font-semibold text-amber-900">{AI_STUDY_TIPS.find(t => t.subject === exam.subject)!.tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ ACHIEVEMENTS TAB ══ */}
        {activeTab === 'Achievements' && (
          <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Your achievements</p>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">⭐ 340 coins earned</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ACHIEVEMENTS.map(a => (
                <div key={a.id} className={`flex items-center gap-4 rounded-xl border p-4 ${
                  a.rarity === 'epic'   ? 'border-purple-200 bg-purple-50'  :
                  a.rarity === 'rare'   ? 'border-amber-200 bg-amber-50'    :
                                          'border-deep-teal/10 bg-white/50'
                }`}>
                  <span className="text-3xl">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-deep-teal">{a.title}</p>
                    <p className="text-[11px] text-muted">{a.desc}</p>
                    <p className="mt-1 text-[10px] font-bold text-muted">{a.date} · +{a.coins} coins</p>
                  </div>
                  {a.rarity !== 'common' && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      a.rarity === 'epic' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                    }`}>{a.rarity}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ MISSIONS TAB ══ */}
        {activeTab === 'Missions' && (
          <div id="quests">
            <QuestBoard student={student} setActiveAvatar={setActiveAvatar} setActiveTitle={setActiveTitle} activeAvatar={activeAvatar} activeTitle={activeTitle} />
          </div>
        )}

        {/* ══ WELLBEING & MITRA TAB ══ */}
        {activeTab === 'Wellbeing' && (
          <div id="school-mitra">
            <SchoolMitra studentId={student.studentId} studentName={student.displayName} />
          </div>
        )}

      </main>
    </div>
  );
}
