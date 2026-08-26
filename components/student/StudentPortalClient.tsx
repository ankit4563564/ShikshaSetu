'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignOutButton } from '@/components/auth/SignOutButton';
import SchoolMitra from '@/components/student/SchoolMitra';
import StudentTodayTasks from '@/components/student/StudentTodayTasks';
import StudentUpcomingTests from '@/components/student/StudentUpcomingTests';
import StudentCompactTimetable from '@/components/student/StudentCompactTimetable';
import StudentLearningFocus from '@/components/student/StudentLearningFocus';
import StudentMarksView from '@/components/student/StudentMarksView';
import StudentExitTicketWidget from '@/components/student/StudentExitTicketWidget';
import AiRevisionNotesWorkspace from '@/components/student/AiRevisionNotesWorkspace';
import StudentMobileNav, { type StudentTab } from '@/components/student/StudentMobileNav';
import { getCanonicalStudentState } from '@/lib/canonical';
import { usePortalSync } from '@/hooks/usePortalSync';
import { useTimeGreeting } from '@/lib/utils/timeGreeting';
import type { StudentWithFlag } from '@/lib/supabase/getStudentsData';

interface StudentPortalClientProps {
  student?: StudentWithFlag;
}

const NAV_TABS: Array<{ id: StudentTab; icon: string; label: string }> = [
  { id: 'Today', icon: '⚡', label: 'Today' },
  { id: 'Homework', icon: '📋', label: 'Homework' },
  { id: 'Revision', icon: '📚', label: 'Revision Notes' },
  { id: 'Tests & Marks', icon: '📊', label: 'Tests & Marks' },
  { id: 'Timetable', icon: '📅', label: 'Timetable' },
  { id: 'Ask a Doubt', icon: '💡', label: 'Ask a Doubt' },
];

export default function StudentPortalClient({ student }: StudentPortalClientProps) {
  const timeGreeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState<StudentTab>('Today');
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

  const studentGrade = student?.grade || '8';
  const studentSection = student?.section || 'A';
  const studentRoll = student?.roll_number || '801';
  const studentGrades = student?.grades || [];
  const effectiveGrades = studentGrades.length > 0 ? studentGrades : (canonicalState?.grades || []);

  const pendingCount = pendingHW.length;
  const studentId = student?.studentId || student?.id || 'b1000000-0000-4000-8000-000000000001';

  // ── Derive "What Should I Study Next?" strictly from evidence ──
  const getNextBestStudyAction = () => {
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
      reason: `Your recent concept check scored ${targetScore}%. A quick 5-minute visual review will help you master this concept before the upcoming test.`,
      action: () => {
        setSelectedStudyTopic(targetTopic);
        setActiveTab('Revision');
      },
      askMitraAction: () => {
        setSelectedStudyTopic(targetTopic);
        setActiveTab('Ask a Doubt');
      },
    };
  };

  const nextStudyAction = getNextBestStudyAction();

  const handleOpenStudyHelp = (topic?: string) => {
    setSelectedStudyTopic(topic || 'Fractions');
    setActiveTab('Ask a Doubt');
  };

  return (
    <div className="student-portal-shell min-h-screen bg-slate-50/70 px-3 py-3 sm:px-6 sm:py-5 lg:pl-72 pb-24 lg:pb-8 relative selection:bg-indigo-600 selection:text-white font-body text-slate-900">
      {/* ── Desktop Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white px-5 py-6 shadow-sm lg:flex">
        {/* App Brand Header */}
        <div className="mb-6 px-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            S
          </div>
          <div>
            <p className="font-display text-lg font-black tracking-tight text-slate-900 leading-none">ShikshaSetu</p>
            <p className="mt-1 text-[11px] font-bold text-indigo-600 tracking-wide uppercase">Student Companion</p>
          </div>
        </div>

        {/* Student Profile Identity Card */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-lg font-bold">
              🎓
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">{displayName}</p>
              <p className="text-[11px] font-bold text-slate-500">
                Class {studentGrade}{studentSection} &bull; Roll #{studentRoll}
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="space-y-1.5 flex-1">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'Homework' && pendingCount > 0 && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Attendance Streak & Sign Out */}
        <div className="mt-auto pt-4 space-y-3 border-t border-slate-100">
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/60 p-3">
            <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <span>🔥</span> {attendanceSummary.streak} day streak &middot; {Math.round(attendanceSummary.rate * 100)}% attendance
            </p>
          </div>

          <SignOutButton className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold transition border border-slate-200 cursor-pointer">
            <span className="flex items-center gap-2">
              <span>🚪</span>
              <span>Sign Out</span>
            </span>
            <span className="text-[10px] font-mono">&rarr;</span>
          </SignOutButton>
        </div>
      </aside>

      {/* ── Top Bar Greeting ── */}
      <header className="mx-auto mb-6 flex max-w-5xl items-center justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-xl border border-indigo-100 text-indigo-700 font-bold">
            🎓
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-black text-slate-900">
              {timeGreeting}, {firstName} 👋
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Class {studentGrade}{studentSection} &bull; Roll #{studentRoll} &bull;{' '}
              <span className={pendingCount > 0 ? 'text-amber-700 font-extrabold' : 'text-emerald-700 font-extrabold'}>
                {pendingCount === 0
                  ? 'All homework clear 🎉'
                  : `${pendingCount} assignment${pendingCount === 1 ? '' : 's'} pending`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-extrabold text-emerald-800">
            <span>🔥</span> {attendanceSummary.streak} Day Streak
          </span>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="mx-auto max-w-5xl">
        <AnimatePresence mode="wait">
          {/* ══ TAB 1: TODAY (PRACTICAL DAILY COMMAND CENTER) ══ */}
          {activeTab === 'Today' && (
            <motion.div
              key="today-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* 🔴 SECTION 1: TODAY'S PRIORITIES */}
              <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block">
                      ACTION LIST
                    </span>
                    <h2 className="font-display text-base font-black text-slate-900">
                      What you need to do today
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {pendingCount === 0 ? 'All clear 🎉' : `${pendingCount} pending`}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Item 1: Pending Homework Due Today */}
                  {pendingHW.length > 0 ? (
                    pendingHW.slice(0, 2).map((hw: any, idx: number) => (
                      <div
                        key={hw.id || `priority-hw-${idx}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1 w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-white text-slate-800 border border-amber-200">
                                {hw.subject}
                              </span>
                              <span className="text-[10px] font-bold text-rose-700 uppercase">
                                Due Today
                              </span>
                            </div>
                            <p className="font-extrabold text-sm text-slate-900 mt-1">{hw.title}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('Homework')}
                          className="self-end sm:self-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xs cursor-pointer"
                        >
                          Open Homework &rarr;
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                      <span>✓</span> No pending homework due today!
                    </div>
                  )}

                  {/* Item 2: Upcoming Test Preparation */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-white text-indigo-900 border border-indigo-200">
                            Science
                          </span>
                          <span className="text-[10px] font-bold text-indigo-700 uppercase">
                            Test Tomorrow &bull; 10:00 AM
                          </span>
                        </div>
                        <p className="font-extrabold text-sm text-slate-900 mt-1">
                          Revise Chapter 4: Cell Structure &amp; Functions
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudyTopic('Cell — Structure & Functions');
                        setActiveTab('Revision');
                      }}
                      className="self-end sm:self-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      Start Revision &rarr;
                    </button>
                  </div>

                  {/* Item 3: Quick Concept Practice */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                            Mathematics
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            5-Min Practice
                          </span>
                        </div>
                        <p className="font-extrabold text-sm text-slate-900 mt-1">
                          Equivalent Fractions &middot; 3 Quick Questions
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={nextStudyAction.action}
                      className="self-end sm:self-center px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-extrabold shadow-2xs cursor-pointer"
                    >
                      Start Practice &rarr;
                    </button>
                  </div>
                </div>
              </section>

              {/* 📝 SECTION 2: UPCOMING TESTS (EXAM PREP HUB) */}
              <StudentUpcomingTests
                onPrepareExam={(exam) => {
                  setSelectedStudyTopic(exam.topic || exam.subject);
                  setActiveTab('Revision');
                }}
              />

              {/* 💡 SECTION 3: WHAT SHOULD I STUDY NEXT? */}
              <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block">
                        FOCUSED REINFORCEMENT
                      </span>
                      <h2 className="font-display text-base font-black text-slate-900">
                        What should I study next?
                      </h2>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
                    Needs Practice
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">
                      {nextStudyAction.subject} &middot; {nextStudyAction.topic}
                    </span>
                    <span className="font-mono text-xs font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">
                      Recent Check: {nextStudyAction.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {nextStudyAction.reason}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Take 5 minutes to review key diagrams and try 3 practice questions.
                  </p>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={nextStudyAction.askMitraAction}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-2xs"
                    >
                      Ask a Doubt 💡
                    </button>
                    <button
                      type="button"
                      onClick={nextStudyAction.action}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      Review for 5 min &rarr;
                    </button>
                  </div>
                </div>
              </section>

              {/* ⚡ SECTION 4: QUICK CONCEPT CHECK WIDGET */}
              <StudentExitTicketWidget
                studentId={studentId}
                studentName={displayName}
                topic="Fractions &amp; Decimals"
                subject="Mathematics"
              />

              {/* 📅 SECTION 5: TODAY'S CLASSES (TIMETABLE PREVIEW) */}
              <StudentCompactTimetable
                schedule={[]}
                studentGrade={studentGrade}
                studentSection={studentSection}
              />
            </motion.div>
          )}

          {/* ══ TAB 2: HOMEWORK (FIRST-CLASS HUB) ══ */}
          {activeTab === 'Homework' && (
            <motion.div
              key="homework-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <StudentTodayTasks
                homework={homework}
                onOpenHomeworkTab={() => setActiveTab('Homework')}
                onOpenRevisionNotes={() => setActiveTab('Revision')}
                onOpenStudyHelp={handleOpenStudyHelp}
              />

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display text-sm font-black text-slate-900">
                    All Homework Assignments
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {pendingHW.length} Pending &bull; {doneHW.length} Submitted
                  </span>
                </div>

                <div className="space-y-3">
                  {homework.map((hw: any, idx: number) => {
                    const isDone = Boolean(hw.isSubmitted || hw.is_submitted);
                    return (
                      <div
                        key={hw.id || `all-hw-${idx}`}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-slate-50/60 border-slate-200/60 text-slate-500'
                            : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {hw.subject}
                            </span>
                            <span className={`text-[10px] font-bold ${isDone ? 'text-emerald-700' : 'text-amber-800'}`}>
                              {isDone ? '✓ Submitted' : `Due: ${hw.dueDate || hw.due_date || 'Today'}`}
                            </span>
                          </div>
                          <p className="font-extrabold text-sm text-slate-900 mt-1">{hw.title}</p>
                        </div>

                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => handleOpenStudyHelp(hw.title)}
                            className="self-end sm:self-center px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            💡 Explain Question
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ TAB 3: REVISION NOTES ══ */}
          {activeTab === 'Revision' && (
            <motion.div
              key="revision-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <AiRevisionNotesWorkspace
                initialSubject="Mathematics"
                initialTopic={selectedStudyTopic || 'Fractions & Decimals'}
                onAskTutor={(ctx) => {
                  setSelectedStudyTopic(ctx.concept || ctx.topic);
                  setActiveTab('Ask a Doubt');
                }}
              />
            </motion.div>
          )}

          {/* ══ TAB 4: TESTS & MARKS ══ */}
          {activeTab === 'Tests & Marks' && (
            <motion.div
              key="marks-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <StudentUpcomingTests
                onPrepareExam={(exam) => {
                  setSelectedStudyTopic(exam.topic || exam.subject);
                  setActiveTab('Revision');
                }}
              />

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Academic Results &amp; Trends
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudyTopic('Fractions & Decimals');
                      setActiveTab('Revision');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Need improvement? Revise Mathematics &rarr;
                  </button>
                </div>

                <StudentMarksView
                  studentId={studentId}
                  studentName={displayName}
                />
              </div>
            </motion.div>
          )}

          {/* ══ TAB 5: TIMETABLE ══ */}
          {activeTab === 'Timetable' && (
            <motion.div
              key="timetable-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <StudentCompactTimetable
                schedule={[]}
                studentGrade={studentGrade}
                studentSection={studentSection}
              />
            </motion.div>
          )}

          {/* ══ TAB 6: ASK A DOUBT (SCHOOLMITRA) ══ */}
          {activeTab === 'Ask a Doubt' && (
            <motion.div
              key="doubt-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <SchoolMitra studentId={studentId} studentName={displayName} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Mobile Navigation Bar ── */}
      <StudentMobileNav
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        unreadCounts={{ homework: pendingCount }}
      />
    </div>
  );
}
