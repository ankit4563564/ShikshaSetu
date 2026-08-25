'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { requestGatePassAction, cancelGatePassAction } from '@/app/actions/gatePassActions';
import { getChildAiInsightAction, type ChildAiInsightResult } from '@/app/actions/parentAiActions';
import NotificationBell from '@/components/shared/NotificationBell';
import { Toast } from '@/components/shared/Toast';
import { Skeleton } from '@/components/shared/Skeleton';
import { useTimeGreeting } from '@/lib/utils/timeGreeting';

// Sub-components
import { ParentStudentHeader } from './ParentStudentHeader';
import { ParentHomeworkTab } from './ParentHomeworkTab';
import { ParentAttendanceTab } from './ParentAttendanceTab';
import { ParentGatePassTab } from './ParentGatePassTab';
import { ParentBusTrackingTab } from './ParentBusTrackingTab';
import { ParentChatTab } from './ParentChatTab';
import { ParentCalendarTab } from './ParentCalendarTab';
import { ParentSupportPlanTab } from './ParentSupportPlanTab';
import { ParentDocumentsTab } from './ParentDocumentsTab';
import { ParentFeesTab } from './ParentFeesTab';
import { ParentAIAssistantDrawer } from './ParentAIAssistantDrawer';
import ParentMarksView from './ParentMarksView';

export type ParentActiveTab =
  | 'home'
  | 'child'
  | 'homework'
  | 'attendance'
  | 'marks'
  | 'messages'
  | 'calendar'
  | 'support'
  | 'documents'
  | 'fees'
  | 'bus'
  | 'gate';

interface ParentTodayClientProps {
  studentsData: {
    studentId: string;
    displayName: string;
    parentName: string;
    parentEmail: string;
    parentType: 'sunita' | 'kavita';
    classTeacherId?: string | null;
    grade?: string | null;
    section?: string | null;
    noteResult: {
      note: string;
      prompt: string;
      tone: 'positive' | 'neutral' | 'concern';
      statusLabel: string;
    };
    homework: {
      id: string;
      subject: string;
      title: string;
      dueDate: string;
      submittedAt: string | null;
      isSubmitted: boolean;
      description?: string;
      feedback?: string;
    }[];
    attendance: {
      id: string;
      date: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      notes: string | null;
    }[];
    gatePasses: {
      id: string;
      status: 'pending' | 'approved' | 'used' | 'expired' | 'rejected';
      pickup_window_start: string;
      pickup_window_end: string;
      pass_code: string | null;
      reason: string | null;
      used_at: string | null;
      rejection_reason: string | null;
    }[];
    evidence?: {
      id: string;
      status: 'on-track' | 'worth-watching' | 'needs-attention';
      headline: string;
      bullets: string[];
    }[];
  }[];
  initialParentType?: 'sunita' | 'kavita';
  isClerkActive?: boolean;
  guardianId?: string | null;
}

export default function ParentTodayClient({
  studentsData = [],
  initialParentType = 'sunita',
  isClerkActive = false,
  guardianId = null,
}: ParentTodayClientProps) {
  const timeGreeting = useTimeGreeting();
  const pathname = usePathname();

  // ── Core State ──
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<ParentActiveTab>('home');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    studentsData[0]?.studentId || ''
  );

  // ── AI Insights State ──
  const [aiInsight, setAiInsight] = useState<ChildAiInsightResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // ── UI States ──
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Consent / Preference Settings ──
  const [consentSettings, setConsentSettings] = useState({
    receiveBus: true,
    receiveAcademic: true,
    receiveNotifications: true,
  });

  // ── Gate Pass Request Form State ──
  const [showPassModal, setShowPassModal] = useState(false);
  const [passReason, setPassReason] = useState('Doctor Appointment');
  const [pickupPerson, setPickupPerson] = useState('Parent (Primary Guardian)');
  const [pickupTime, setPickupTime] = useState('14:30');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);
  const [passFormError, setPassFormError] = useState('');
  const [timeLeftText, setTimeLeftText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Current active student
  const activeStudent = useMemo(() => {
    const found = studentsData.find((s) => s.studentId === selectedStudentId);
    return found || studentsData[0];
  }, [studentsData, selectedStudentId]);

  const studentShortName = activeStudent?.displayName.split(' ')[0] || 'Child';
  const studentGradeStr = `${activeStudent?.grade || '8'}${activeStudent?.section || 'A'}`;

  // ── Load Real AI Insights for Active Child ──
  const loadAiInsights = async (sId: string) => {
    if (!sId) return;
    setIsAiLoading(true);
    try {
      const res = await getChildAiInsightAction(sId);
      if (res.success && res.insight) {
        setAiInsight(res.insight);
      }
    } catch (err) {
      console.warn('Failed to load child AI insight:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (activeStudent?.studentId) {
      loadAiInsights(activeStudent.studentId);
    }
  }, [activeStudent?.studentId]);

  // ── Real Today Records Computation ──
  const todayIso = new Date().toISOString().split('T')[0];

  const todayAttendance = useMemo(() => {
    return activeStudent?.attendance?.find((a) => a.date === todayIso) || null;
  }, [activeStudent, todayIso]);

  const activeGatePass = useMemo(() => {
    return activeStudent?.gatePasses?.[0] || null;
  }, [activeStudent]);

  const pendingHomework = useMemo(() => {
    return (activeStudent?.homework || []).filter((h) => !h.isSubmitted);
  }, [activeStudent]);

  const homeworkDueTodayOrTomorrow = useMemo(() => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return pendingHomework.filter((h) => h.dueDate <= tomorrow);
  }, [pendingHomework]);

  // Attendance metrics
  const totalAttendanceDays = activeStudent?.attendance?.length || 0;
  const presentDays = (activeStudent?.attendance || []).filter((a) => a.status === 'present').length;
  const attendancePercentage =
    totalAttendanceDays > 0 ? Math.round((presentDays / totalAttendanceDays) * 100) : 100;
  const isAttendanceLow = totalAttendanceDays > 0 && attendancePercentage < 75;

  // ── Gate Pass Expiration Countdown ──
  useEffect(() => {
    if (!activeGatePass || activeGatePass.status !== 'approved') {
      setTimeLeftText('');
      return;
    }
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(activeGatePass.pickup_window_end);
      const diffMs = end.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeftText('Pass Window Expired');
      } else {
        const diffMins = Math.ceil(diffMs / (60 * 1000));
        setTimeLeftText(`Pickup window expires in ${diffMins} mins`);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 15000);
    return () => clearInterval(interval);
  }, [activeGatePass]);

  // ── Gate Pass Handlers ──
  const handleRequestGatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    setIsSubmittingPass(true);
    setPassFormError('');

    try {
      const startTime = new Date();
      const [h, m] = pickupTime.split(':').map(Number);
      startTime.setHours(h || 14, m || 30, 0, 0);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window

      const res = await requestGatePassAction(
        activeStudent.studentId,
        `${passReason} — Pickup by ${pickupPerson}`,
        startTime.toISOString(),
        endTime.toISOString(),
        guardianId || undefined
      );

      if (res.success) {
        setShowPassModal(false);
        setToastMessage('Gate pass requested successfully. Awaiting teacher verification.');
        // Append optimistic pass
        if (activeStudent.gatePasses) {
          activeStudent.gatePasses.unshift({
            id: res.passId,
            status: 'pending',
            pickup_window_start: startTime.toISOString(),
            pickup_window_end: endTime.toISOString(),
            pass_code: 'PENDING',
            reason: passReason,
            used_at: null,
            rejection_reason: null,
          });
        }
      }
    } catch (err: any) {
      console.error('Gate pass request failed:', err);
      setPassFormError(err.message || 'Failed to submit gate pass request');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const handleCancelGatePass = async (passId: string) => {
    if (!confirm('Are you sure you want to cancel this gate pass?')) return;
    try {
      const res = await cancelGatePassAction(passId);
      if (res.success) {
        setToastMessage('Gate pass has been cancelled.');
        if (activeStudent?.gatePasses) {
          const match = activeStudent.gatePasses.find((p) => p.id === passId);
          if (match) match.status = 'expired';
        }
      }
    } catch (err: any) {
      console.error('Cancel gate pass failed:', err);
      setToastMessage(err.message || 'Failed to cancel gate pass');
    }
  };

  return (
    <div className="parent-portal-shell mx-auto min-h-screen sm:min-h-[calc(100vh-2rem)] w-full max-w-md sm:max-w-5xl sm:rounded-[2.5rem] sm:shadow-2xl sm:border border-deep-teal/10 bg-paper flex flex-col relative font-body text-deep-teal antialiased overflow-hidden">
      {/* ── Top Header ── */}
      <ParentStudentHeader
        activeStudent={activeStudent}
        currentStudents={studentsData}
        selectedStudentId={selectedStudentId}
        onStudentChange={(id) => {
          setSelectedStudentId(id);
          setToastMessage(`Switched context to ${studentsData.find((s) => s.studentId === id)?.displayName}`);
        }}
        isLoading={isLoading}
        rightActions={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowChildModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-deep-teal/5 hover:bg-deep-teal/10 text-deep-teal text-xs font-bold transition-all"
              title="My Child Overview"
            >
              <span>👤</span>
              <span className="hidden sm:inline">My Child</span>
            </button>
            <NotificationBell recipientId={guardianId} />
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className="p-2 rounded-full hover:bg-deep-teal/5 text-deep-teal/60 hover:text-deep-teal transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/30"
              aria-label="Parent Settings"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        }
      />

      {/* ── Main Viewport Content ── */}
      <div className="parent-portal-viewport flex-1 w-full max-w-4xl mx-auto px-4 py-5 sm:px-6 sm:py-6 overflow-y-auto pb-32 space-y-5">
        {/* TAB 1: PARENT TODAY (HOME) */}
        {activeNav === 'home' && (
          isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Daily Greeting Bar */}
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-deep-teal/70 uppercase tracking-widest">
                  {timeGreeting} · Today's Update
                </span>
                <span className="text-xs text-deep-teal/50 font-semibold">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* ── 1. Real Status Hero ── */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-deep-teal to-teal-800 p-6 shadow-md text-white space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        todayAttendance?.status === 'present'
                          ? 'bg-emerald-400 animate-pulse'
                          : todayAttendance?.status === 'absent'
                          ? 'bg-rose-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-display text-xs font-bold text-white/80 uppercase tracking-wider">
                      {todayAttendance?.status === 'present'
                        ? `${studentShortName} is at School`
                        : todayAttendance?.status === 'absent'
                        ? 'Marked Absent Today'
                        : todayAttendance?.status === 'late'
                        ? 'Marked Late Today'
                        : 'Attendance Pending'}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold border border-white/10">
                    Class {studentGradeStr}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="font-display text-xl sm:text-2xl font-black text-white leading-tight">
                    {todayAttendance?.status === 'present'
                      ? `${studentShortName} is in class today.`
                      : todayAttendance?.status === 'absent'
                      ? `${studentShortName} is marked absent today.`
                      : `Welcome, ${activeStudent?.parentName || 'Parent'}.`}
                  </h2>
                  <p className="font-body text-xs text-white/70">
                    {pendingHomework.length === 0
                      ? 'No pending homework due. All work is done!'
                      : `${pendingHomework.length} homework task${pendingHomework.length > 1 ? 's' : ''} to do.`}
                  </p>
                </div>

                {/* Status Snapshot Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-emerald-300">✓</span>
                    <span className="text-xs font-semibold">
                      Attendance: {attendancePercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                    <span>📚</span>
                    <span className="text-xs font-semibold">
                      {pendingHomework.length} Due
                    </span>
                  </div>
                  {activeGatePass && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 backdrop-blur-sm border border-amber-400/30">
                      <span>🎫</span>
                      <span className="text-xs font-semibold text-amber-200">
                        Gate Pass: {activeGatePass.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ── 2. AI Insight for Your Child Card ── */}
              <div className="rounded-3xl bg-white border border-teal-600/20 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-deep-teal">
                      AI Insight for {studentShortName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => activeStudent && loadAiInsights(activeStudent.studentId)}
                    disabled={isAiLoading}
                    className="text-[10px] text-teal-800 font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>🔄</span>
                    <span>{isAiLoading ? 'Analyzing...' : 'Refresh'}</span>
                  </button>
                </div>

                {isAiLoading ? (
                  <div className="space-y-2 py-1">
                    <div className="h-4 bg-deep-teal/5 rounded animate-pulse w-full" />
                    <div className="h-4 bg-deep-teal/5 rounded animate-pulse w-3/4" />
                  </div>
                ) : aiInsight ? (
                  <div className="space-y-3 text-xs">
                    <p className="font-display text-sm font-bold text-deep-teal leading-snug">
                      {aiInsight.headline}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                          🌟 Current Strengths
                        </span>
                        <ul className="text-emerald-900 font-medium space-y-0.5 list-disc list-inside text-[11px]">
                          {aiInsight.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/60 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                          🎯 Focus &amp; Attention
                        </span>
                        <ul className="text-amber-900 font-medium space-y-0.5 list-disc list-inside text-[11px]">
                          {aiInsight.attentionAreas.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-deep-teal/5 border border-deep-teal/10 flex items-start gap-2">
                      <span className="text-base shrink-0">💡</span>
                      <div>
                        <span className="font-extrabold text-deep-teal block text-[11px]">Recommended for Tonight:</span>
                        <p className="text-deep-teal/80 font-medium text-[11px] mt-0.5">{aiInsight.recommendedAction}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* ── 3. Important Today (Actionable Alerts) ── */}
              <div className="space-y-3">
                <h3 className="font-display text-xs font-extrabold uppercase tracking-widest text-deep-teal/50 px-1">
                  Important Today
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Action 1: Homework alert */}
                  {homeworkDueTodayOrTomorrow.length > 0 ? (
                    <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                          <span>📝</span>
                          <span>Homework Due Soon</span>
                        </div>
                        <p className="text-xs text-amber-900 font-semibold">
                          {homeworkDueTodayOrTomorrow[0].title} ({homeworkDueTodayOrTomorrow[0].subject})
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveNav('homework')}
                        className="self-start text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
                      >
                        Review assignment details →
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                        <span>✓</span>
                        <span>Homework Up to Date</span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        No urgent assignment deadlines pending today.
                      </p>
                    </div>
                  )}

                  {/* Action 2: Gate Pass / Attendance alert */}
                  {isAttendanceLow ? (
                    <div className="rounded-2xl bg-rose-50/80 border border-rose-200 p-4 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                          <span>⚠</span>
                          <span>Attendance Warning</span>
                        </div>
                        <p className="text-xs text-rose-900 font-medium">
                          Attendance is currently {attendancePercentage}%, which is below the 75% target.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveNav('attendance')}
                        className="self-start text-xs font-bold text-rose-900 hover:underline flex items-center gap-1"
                      >
                        View attendance log →
                      </button>
                    </div>
                  ) : activeGatePass ? (
                    <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-4 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs">
                          <span>🎫</span>
                          <span>Active Gate Pass</span>
                        </div>
                        <p className="text-xs text-blue-900 font-medium">
                          {activeGatePass.status === 'approved'
                            ? `Pass #${activeGatePass.pass_code} ready for gate verification.`
                            : `Pass request is currently ${activeGatePass.status}.`}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveNav('gate')}
                        className="self-start text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
                      >
                        View Gate Pass QR →
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-deep-teal/5 border border-deep-teal/10 p-4 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-deep-teal font-bold text-xs">
                          <span>🎫</span>
                          <span>Early Pickup</span>
                        </div>
                        <p className="text-xs text-deep-teal/60">
                          Need early pickup today? Submit a request for teacher approval.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPassModal(true)}
                        className="self-start text-xs font-bold text-deep-teal hover:underline flex items-center gap-1"
                      >
                        Request early gate pass →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── 4. Today's Timeline ── */}
              <div className="bg-white rounded-3xl border border-deep-teal/10 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
                  <div>
                    <h3 className="font-display text-sm font-extrabold text-deep-teal">
                      Today's Timeline
                    </h3>
                    <p className="font-body text-[11px] text-deep-teal/50">
                      School schedule and events in order
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Event 1: Morning Check-in */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        todayAttendance
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-deep-teal/5 text-deep-teal/40'
                      }`}
                    >
                      {todayAttendance ? '✓' : '🏫'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-xs font-bold text-deep-teal">
                          Morning Attendance
                        </p>
                        <span className="text-[10px] font-bold text-deep-teal/40">
                          08:30 AM
                        </span>
                      </div>
                      <p className="text-xs text-deep-teal/60">
                        {todayAttendance
                          ? `Marked ${todayAttendance.status.toUpperCase()} in Class ${studentGradeStr}`
                          : 'Awaiting teacher attendance roll call'}
                      </p>
                    </div>
                  </div>

                  {/* Event 2: Homework Status */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      📚
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-xs font-bold text-deep-teal">
                          Homework &amp; Practice
                        </p>
                        <span className="text-[10px] font-bold text-deep-teal/40">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-deep-teal/60">
                        {pendingHomework.length > 0
                          ? `${pendingHomework.length} task${pendingHomework.length > 1 ? 's' : ''} to complete`
                          : 'All homework submitted for this week'}
                      </p>
                    </div>
                  </div>

                  {/* Event 3: Gate / Dismissal Status */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        activeGatePass?.status === 'used'
                          ? 'bg-emerald-100 text-emerald-700'
                          : activeGatePass?.status === 'approved'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-deep-teal/5 text-deep-teal/40'
                      }`}
                    >
                      🔔
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-xs font-bold text-deep-teal">
                          School Dismissal
                        </p>
                        <span className="text-[10px] font-bold text-deep-teal/40">
                          03:15 PM
                        </span>
                      </div>
                      <p className="text-xs text-deep-teal/60">
                        {activeGatePass?.status === 'used'
                          ? `Picked up at school gate at ${activeGatePass.used_at || '3:42 PM'}`
                          : activeGatePass?.status === 'approved'
                          ? `Approved early pickup pass ready: #${activeGatePass.pass_code}`
                          : 'Standard afternoon school dismissal at 03:15 PM'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 5. Quick Modules Grid ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveNav('marks')}
                  className="p-4 rounded-2xl bg-white border border-deep-teal/10 hover:border-deep-teal/30 hover:shadow-sm text-left transition-all space-y-1"
                >
                  <span className="text-xl">📊</span>
                  <p className="font-display text-xs font-extrabold text-deep-teal">Marks &amp; Results</p>
                  <p className="text-[10px] text-deep-teal/50">Test scores &amp; report card</p>
                </button>

                <button
                  onClick={() => setActiveNav('calendar')}
                  className="p-4 rounded-2xl bg-white border border-deep-teal/10 hover:border-deep-teal/30 hover:shadow-sm text-left transition-all space-y-1"
                >
                  <span className="text-xl">🗓️</span>
                  <p className="font-display text-xs font-extrabold text-deep-teal">School Calendar</p>
                  <p className="text-[10px] text-deep-teal/50">Holidays, exams &amp; PTMs</p>
                </button>

                <button
                  onClick={() => setActiveNav('support')}
                  className="p-4 rounded-2xl bg-white border border-deep-teal/10 hover:border-deep-teal/30 hover:shadow-sm text-left transition-all space-y-1"
                >
                  <span className="text-xl">🌱</span>
                  <p className="font-display text-xs font-extrabold text-deep-teal">Study Help</p>
                  <p className="text-[10px] text-deep-teal/50">Focus areas &amp; home tips</p>
                </button>

                <button
                  onClick={() => setActiveNav('documents')}
                  className="p-4 rounded-2xl bg-white border border-deep-teal/10 hover:border-deep-teal/30 hover:shadow-sm text-left transition-all space-y-1"
                >
                  <span className="text-xl">📁</span>
                  <p className="font-display text-xs font-extrabold text-deep-teal">Documents</p>
                  <p className="text-[10px] text-deep-teal/50">Certificates &amp; receipts</p>
                </button>
              </div>
            </div>
          )
        )}

        {/* TAB 2: HOMEWORK */}
        {activeNav === 'homework' && (
          <ParentHomeworkTab
            homework={activeStudent?.homework || []}
            studentName={studentShortName}
            isLoading={isLoading}
            isEnabled={consentSettings.receiveAcademic}
            onSendMessage={() => setActiveNav('messages')}
          />
        )}

        {/* TAB 3: ATTENDANCE */}
        {activeNav === 'attendance' && (
          <ParentAttendanceTab
            attendance={activeStudent?.attendance || []}
            studentId={activeStudent?.studentId || ''}
            studentName={studentShortName}
            isLoading={isLoading}
            isEnabled={consentSettings.receiveAcademic}
          />
        )}

        {/* TAB 4: RESULTS / MARKS */}
        {activeNav === 'marks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
              <div>
                <h3 className="font-display text-lg font-extrabold text-deep-teal">
                  Academic Performance &amp; Results
                </h3>
                <p className="font-body text-xs text-deep-teal/60 font-medium mt-0.5">
                  Published assessment scores and subject-wise trends for {studentShortName}.
                </p>
              </div>
            </div>
            <ParentMarksView
              studentId={activeStudent?.studentId || ''}
              studentName={activeStudent?.displayName || 'Student'}
            />
          </div>
        )}

        {/* TAB 5: MESSAGES */}
        {activeNav === 'messages' && (
          <ParentChatTab
            studentId={activeStudent?.studentId || ''}
            studentName={studentShortName}
            guardianId={guardianId}
            guardianName={activeStudent?.parentName || 'Parent'}
            isLoading={isLoading}
          />
        )}

        {/* TAB 6: SCHOOL CALENDAR & NOTICES */}
        {activeNav === 'calendar' && (
          <ParentCalendarTab
            studentName={studentShortName}
            isLoading={isLoading}
          />
        )}

        {/* TAB 7: STUDENT SUPPORT PLAN */}
        {activeNav === 'support' && (
          <ParentSupportPlanTab
            studentName={studentShortName}
            evidenceLogs={activeStudent?.evidence || []}
            isLoading={isLoading}
          />
        )}

        {/* TAB 8: DOCUMENTS LOCKER */}
        {activeNav === 'documents' && (
          <ParentDocumentsTab
            studentName={activeStudent?.displayName || 'Student'}
            studentGrade={studentGradeStr}
            isLoading={isLoading}
          />
        )}

        {/* TAB 9: FEES */}
        {activeNav === 'fees' && (
          <ParentFeesTab
            studentName={activeStudent?.displayName || 'Student'}
            studentGrade={studentGradeStr}
            isLoading={isLoading}
          />
        )}

        {/* TAB 10: BUS TRACKING */}
        {activeNav === 'bus' && (
          <ParentBusTrackingTab
            studentId={activeStudent?.studentId || ''}
            studentName={studentShortName}
            isLoading={isLoading}
            isEnabled={consentSettings.receiveBus}
          />
        )}

        {/* TAB 11: GATE PASS */}
        {activeNav === 'gate' && (
          <ParentGatePassTab
            activePass={activeGatePass}
            studentName={studentShortName}
            guardianName={activeStudent?.parentName || 'Primary Guardian'}
            isLoading={isLoading}
            timeLeftText={timeLeftText}
            onRequestPass={() => setShowPassModal(true)}
            onCancelPass={handleCancelGatePass}
          />
        )}
      </div>

      {/* ── Floating Parent AI Assistant Trigger ── */}
      <button
        type="button"
        onClick={() => setShowAIDrawer(true)}
        className="fixed bottom-24 right-5 sm:right-10 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-deep-teal to-teal-700 text-white font-display text-xs font-extrabold shadow-xl hover:shadow-2xl transition-all active:scale-95 border border-white/20"
      >
        <span className="text-base animate-spin" style={{ animationDuration: '6s' }}>✨</span>
        <span className="hidden sm:inline">Ask Assistant</span>
      </button>

      {/* ── Contextual AI Assistant Drawer ── */}
      <ParentAIAssistantDrawer
        isOpen={showAIDrawer}
        onClose={() => setShowAIDrawer(false)}
        studentId={activeStudent?.studentId || ''}
        studentName={studentShortName}
        studentGrade={studentGradeStr}
      />

      {/* ── Floating Dock Navigation ── */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm sm:max-w-md px-3">
        <div className="bg-white/95 backdrop-blur-xl border border-deep-teal/15 rounded-3xl shadow-2xl px-2 py-2 flex items-center justify-between">
          {[
            { id: 'home', label: 'Today', icon: '🏠' },
            { id: 'homework', label: 'Homework', icon: '📚' },
            { id: 'attendance', label: 'Attend', icon: '✓' },
            { id: 'marks', label: 'Results', icon: '📊' },
            { id: 'messages', label: 'Notes', icon: '💬' },
            { id: 'more', label: 'More', icon: '☰' },
          ].map((tab) => {
            const isTabActive =
              tab.id === 'more'
                ? ['calendar', 'support', 'documents', 'fees', 'bus', 'gate'].includes(activeNav) || showMoreMenu
                : activeNav === tab.id && !showMoreMenu;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'more') {
                    setShowMoreMenu((prev) => !prev);
                  } else {
                    setActiveNav(tab.id as any);
                    setShowMoreMenu(false);
                  }
                }}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[50px] gap-1 px-2.5 py-1.5 rounded-2xl transition-all relative ${
                  isTabActive
                    ? 'text-deep-teal bg-deep-teal/10 shadow-2xs font-extrabold'
                    : 'text-deep-teal/50 hover:text-deep-teal hover:bg-deep-teal/5 font-semibold'
                }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── More Modules Bottom Sheet ── */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 max-w-lg mx-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
                <h4 className="font-display text-base font-extrabold text-deep-teal">
                  More School Services
                </h4>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-1.5 rounded-full hover:bg-deep-teal/5 text-deep-teal/40"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'gate', label: 'Gate Pass', icon: '🎫', desc: 'Pickup code' },
                  { id: 'calendar', label: 'Calendar', icon: '🗓️', desc: 'Holidays & events' },
                  { id: 'support', label: 'Study Help', icon: '🌱', desc: 'Home learning tips' },
                  { id: 'documents', label: 'Documents', icon: '📁', desc: 'Reports & certificates' },
                  { id: 'fees', label: 'School Fees', icon: '🧾', desc: 'Fees & receipts' },
                  { id: 'bus', label: 'School Bus', icon: '🚌', desc: 'Bus route & driver' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id as any);
                      setShowMoreMenu(false);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      activeNav === item.id
                        ? 'border-deep-teal bg-deep-teal/10 text-deep-teal'
                        : 'border-deep-teal/10 hover:border-deep-teal/30 bg-paper/60'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-display text-xs font-bold text-deep-teal leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-deep-teal/50 font-medium">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── My Child Overview Modal ── */}
      <AnimatePresence>
        {showChildModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowChildModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-deep-teal to-teal-700 text-white flex items-center justify-center font-display font-black text-sm">
                    {activeStudent?.displayName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-deep-teal">
                      {activeStudent?.displayName}
                    </h3>
                    <p className="font-body text-[11px] text-deep-teal/50">
                      Class {studentGradeStr} &bull; Roll #{activeStudent?.studentId.slice(0, 4).toUpperCase() || '12'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChildModal(false)}
                  className="p-1 rounded-full hover:bg-deep-teal/5 text-deep-teal/40"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-paper border border-deep-teal/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-deep-teal/50">Attendance</span>
                    <p className="font-mono text-base font-black text-deep-teal">{attendancePercentage}%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-paper border border-deep-teal/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-deep-teal/50">Pending Homework</span>
                    <p className="font-mono text-base font-black text-deep-teal">{pendingHomework.length} tasks</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200/60 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-teal-900 block">✨ Teacher &amp; AI Note</span>
                  <p className="text-teal-950 leading-relaxed font-medium">
                    {aiInsight?.headline || `${studentShortName} is participating consistently in class discussions and keeping up with daily assignments.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowChildModal(false);
                  setActiveNav('marks');
                }}
                className="w-full py-2.5 rounded-xl bg-deep-teal text-white text-xs font-bold hover:bg-deep-teal/90 shadow-md"
              >
                View Full Academic Profile →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Request Gate Pass Modal ── */}
      <AnimatePresence>
        {showPassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowPassModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
                <div>
                  <h3 className="font-display text-base font-extrabold text-deep-teal">
                    Request Early Gate Pass
                  </h3>
                  <p className="font-body text-[11px] text-deep-teal/50">
                    For {studentShortName} (Class {studentGradeStr})
                  </p>
                </div>
                <button
                  onClick={() => setShowPassModal(false)}
                  className="p-1 rounded-full hover:bg-deep-teal/5 text-deep-teal/40"
                >
                  ✕
                </button>
              </div>

              {passFormError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  ⚠ {passFormError}
                </div>
              )}

              <form onSubmit={handleRequestGatePass} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-deep-teal uppercase tracking-wider block">
                    Reason for Early Pickup
                  </label>
                  <select
                    value={passReason}
                    onChange={(e) => setPassReason(e.target.value)}
                    className="w-full rounded-xl border border-deep-teal/20 p-2.5 text-xs font-semibold text-deep-teal bg-white"
                  >
                    <option value="Doctor Appointment">Medical / Doctor Appointment</option>
                    <option value="Family Function">Urgent Family Function</option>
                    <option value="Unwell / Sickness">Child Unwell / Fever</option>
                    <option value="Personal Emergency">Personal / Travel Emergency</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-deep-teal uppercase tracking-wider block">
                    Authorized Pickup Person
                  </label>
                  <select
                    value={pickupPerson}
                    onChange={(e) => setPickupPerson(e.target.value)}
                    className="w-full rounded-xl border border-deep-teal/20 p-2.5 text-xs font-semibold text-deep-teal bg-white"
                  >
                    <option value={`${activeStudent?.parentName || 'Parent'} (Primary Guardian)`}>
                      {activeStudent?.parentName || 'Parent'} (Primary Guardian)
                    </option>
                    <option value="Father / Secondary Guardian">Father / Secondary Guardian</option>
                    <option value="Authorized Grandparent">Authorized Grandparent</option>
                    <option value="Verified Family Relative">Verified Family Relative</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-deep-teal uppercase tracking-wider block">
                    Estimated Pickup Time
                  </label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-deep-teal/20 p-2.5 text-xs font-semibold text-deep-teal bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-deep-teal/20 text-deep-teal text-xs font-bold hover:bg-deep-teal/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPass}
                    className="flex-1 py-2.5 rounded-xl bg-deep-teal text-white text-xs font-bold hover:bg-deep-teal/90 shadow-md disabled:opacity-50"
                  >
                    {isSubmittingPass ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings Modal ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
                <h3 className="font-display text-base font-extrabold text-deep-teal">
                  Notification Preferences
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-full hover:bg-deep-teal/5 text-deep-teal/40"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-paper border border-deep-teal/5 cursor-pointer">
                  <div>
                    <span className="font-bold text-deep-teal block">Academic &amp; Homework Alerts</span>
                    <span className="text-[10px] text-deep-teal/50">Daily updates and test results</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentSettings.receiveAcademic}
                    onChange={(e) => setConsentSettings((prev) => ({ ...prev, receiveAcademic: e.target.checked }))}
                    className="rounded border-deep-teal/20 text-deep-teal h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-paper border border-deep-teal/5 cursor-pointer">
                  <div>
                    <span className="font-bold text-deep-teal block">Transport &amp; Bus Updates</span>
                    <span className="text-[10px] text-deep-teal/50">Arrival &amp; route notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentSettings.receiveBus}
                    onChange={(e) => setConsentSettings((prev) => ({ ...prev, receiveBus: e.target.checked }))}
                    className="rounded border-deep-teal/20 text-deep-teal h-4 w-4"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-full py-2.5 rounded-xl bg-deep-teal text-white text-xs font-bold"
              >
                Save Preferences
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast Notifications ── */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
