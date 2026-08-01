'use client';

import { useState, useEffect, useRef, useTransition, Fragment } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeSlideUp, staggerContainer, scaleIn } from '@/lib/animations';
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

import { markFalsePositiveAction } from '@/app/teacher/actions';
import TeacherChat from './TeacherChat';
import { approveGatePassAction, rejectGatePassAction } from '@/app/actions/gatePassActions';
import type { StatusResult } from '@/lib/rules-engine/calculateStatus';
import { useNotifications } from '@/components/shared/NotificationContext';
import NotificationBell from '@/components/shared/NotificationBell';
import { sanitizeBulletText } from '@/lib/utils/sanitizeBulletText';
import { createClient } from '@/lib/supabase/client';
import { Toast } from '@/components/shared/Toast';
import { Skeleton } from '@/components/shared/Skeleton';
import type { StudentProductInsight } from '@/lib/product-intelligence';

import AcademicGrowthAnalytics from '@/components/shared/AcademicGrowthAnalytics';
import { TeacherCopilotStrip } from '@/components/copilot/TeacherCopilotStrip';

const TeacherMarksPanel = dynamic(() => import('./TeacherMarksPanel'), { ssr: false });
const SchoolGPTChat = dynamic(() => import('@/components/schoolgpt/SchoolGPTChat'), { ssr: false });

const getPhotoUrl = (name: string): string | null => {
  const lower = name.toLowerCase();
  if (lower.includes('aarav')) return '/aarav.png';
  if (lower.includes('priya')) return '/priya.png';
  if (lower.includes('rohan')) return '/rohan.png';
  if (lower.includes('ananya')) return '/ananya.png';
  if (lower.includes('kabir')) return '/kabir.png';
  return null;
};

const STATUS_BORDER_L_COLOR = {
  'On Track': 'border-l-sage',
  'Worth Watching': 'border-l-marigold',
  'Needs Attention': 'border-l-warm-clay',
};

const formatExplanation = (explanation: string, firstName: string): string => {
  const cleaned = explanation.trim();

  // 5. Grade trend: "X grade dropped/improved by Y points"
  const gradeTrendRegex = /(\w+)\s+grade\s+(dropped|improved)\s+by\s+([\d\.]+)\s+points/i;
  if (gradeTrendRegex.test(cleaned)) {
    const match = cleaned.match(gradeTrendRegex);
    if (match) {
      const subject = match[1];
      const direction = match[2].toLowerCase();
      if (direction === 'dropped') {
        return `${firstName}'s ${subject} grade has slipped recently.`;
      } else {
        return `${firstName}'s ${subject} grade has improved recently.`;
      }
    }
  }

  // 6. Mood: "Average mood rating: X/5"
  const moodRatingRegex = /Average\s+mood\s+rating:\s*([\d\.]+)\/5/i;
  if (moodRatingRegex.test(cleaned)) {
    const match = cleaned.match(moodRatingRegex);
    if (match) {
      const rating = parseFloat(match[1]);
      if (rating >= 4.0) {
        return `${firstName} has shown positive daily check-in patterns.`;
      } else if (rating >= 3.0) {
        return `${firstName}'s emotional check-ins show some mixed patterns.`;
      } else {
        return `${firstName}'s daily wellness check-ins suggest they are feeling down.`;
      }
    }
  }

  // 7. Mood: "Had X check-ins marked as low or sad"
  const moodSadRegex = /Had\s+(\d+)\s+check-ins\s+marked\s+as\s+low\s+or\s+sad/i;
  if (moodSadRegex.test(cleaned)) {
    const match = cleaned.match(moodSadRegex);
    if (match) {
      const count = parseInt(match[1]);
      return `${firstName} shared feeling sad or overwhelmed during ${count === 1 ? 'one check-in' : count === 2 ? 'two check-ins' : count === 3 ? 'three check-ins' : count + ' check-ins'} this week.`;
    }
  }

  // Fallbacks: if we have plain text or partially unformatted text
  if (cleaned.toLowerCase().includes('grade has slipped')) {
    return `${firstName}'s grade has slipped since last month.`;
  }
  if (cleaned.toLowerCase().includes('missed days')) {
    return `${firstName} missed school days recently.`;
  }
  if (cleaned.toLowerCase().includes('arrived late')) {
    return `${firstName} arrived late recently.`;
  }

  // General fallback
  // Make sure it starts with the first name and ends with a period
  let result = cleaned;
  if (!result.startsWith(firstName)) {
    const firstChar = result.charAt(0);
    const rest = result.slice(1);
    result = `${firstName} ${firstChar.toLowerCase()}${rest}`;
  }
  if (!result.endsWith('.')) {
    result += '.';
  }
  return result;
};

export interface TeacherDashboardClientProps {
  initialStudents: (StatusResult & {
    photoUrl: string | null;
    explanation: string;
    activeStatusFlag: {
      id: string;
      status: "on_track" | "worth_watching" | "needs_attention";
      isCorrected: boolean;
    } | null;
    morningNote?: string | null;
    productInsight?: StudentProductInsight;
  })[];
  rawStudentsData: any[];
  teacherId?: string;
  gatePasses?: any[];
}

const STATUS_CHIP_STYLE = {
  'On Track': 'bg-sage/10 text-sage border-sage/20',
  'Worth Watching': 'bg-marigold/10 text-marigold border-marigold/20',
  'Needs Attention': 'bg-warm-clay/10 text-warm-clay border-warm-clay/20',
};

const STATUS_DOT_COLOR = {
  'On Track': 'var(--sage)',
  'Worth Watching': 'var(--marigold)',
  'Needs Attention': 'var(--warm-clay)',
};

function SnapshotCard({ label, value, tone }: { label: string; value: number; tone: 'primary' | 'error' | 'secondary' | 'tertiary' }) {
  const tones = {
    primary: 'text-deep-teal/95',
    error: 'text-warm-clay',
    secondary: 'text-marigold',
    tertiary: 'text-sage',
  };
  return (
    <div className="rounded-xl border border-deep-teal/[0.07] bg-white/92 px-4 py-3 shadow-[0_2px_10px_rgba(25,28,29,.03)] backdrop-blur-sm transition-shadow hover:shadow-[0_5px_14px_rgba(25,28,29,.05)]">
      <div className="flex items-end justify-between gap-3">
        <div className={`text-[2rem] font-extrabold leading-none tracking-tight ${tones[tone]}`}>{value}</div>
        <p className="max-w-[7rem] text-right text-[10px] font-bold uppercase leading-snug tracking-[0.1em] text-deep-teal/68">{label}</p>
      </div>
    </div>
  );
}

export default function TeacherDashboardClient({ 
  initialStudents, 
  rawStudentsData,
  teacherId = 'a1000000-0000-4000-8000-000000000001',
  gatePasses = []
}: TeacherDashboardClientProps) {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);

  // Sync server-rendered student state changes dynamically
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'marks' | 'assistant'>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [passes, setPasses] = useState<any[]>(gatePasses);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [passToReject, setPassToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [isActionPending, setIsActionPending] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<'All' | 'Needs Attention' | 'Worth Watching'>('All');
  const [connectionError, setConnectionError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showChat, setShowChat] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [showWhyDrawer, setShowWhyDrawer] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Listen for ESC key to dismiss Why Am I Seeing This drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWhyDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Journey status tracking for student cards
  const [journeyStatuses, setJourneyStatuses] = useState<Record<string, 'waiting' | 'boarded' | 'deboarded' | 'home_safe' | 'alert'>>({});
  const [moodCheckins, setMoodCheckins] = useState<Record<string, { mood_value: number; mood_label: string; note: string | null }>>({});

  const studentIdsRef = useRef(students.map(s => s.studentId));
  useEffect(() => {
    studentIdsRef.current = students.map(s => s.studentId);
  }, [students]);

  useEffect(() => {
    const supabase = createClient();

    // Fetch latest journey statuses for all students
    const fetchJourneyStatuses = async () => {
      const studentIds = studentIdsRef.current;
      if (studentIds.length === 0) return;

      const { data, error } = await supabase
        .from('student_journey')
        .select('student_id, status, trip_id, driver_trips!inner(status)')
        .in('student_id', studentIds)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching journey statuses:', error);
        return;
      }

      // Group by student, take latest per student
      const statusMap: Record<string, 'waiting' | 'boarded' | 'deboarded' | 'home_safe' | 'alert'> = {};
      const seen = new Set<string>();
      for (const row of data || []) {
        if (!seen.has(row.student_id)) {
          seen.add(row.student_id);
          const tripStatus = (row.driver_trips as any)?.status;
          if (tripStatus === 'en_route' || tripStatus === 'completed') {
            statusMap[row.student_id] = row.status as any;
          }
        }
      }

      // Check for unresolved alerts
      const { data: alerts } = await supabase
        .from('journey_alerts')
        .select('student_id')
        .in('student_id', studentIds)
        .eq('resolved', false);

      if (alerts) {
        for (const a of alerts) {
          statusMap[a.student_id] = 'alert';
        }
      }

      setJourneyStatuses(statusMap);
    };

    const fetchMoodCheckins = async () => {
      const studentIds = studentIdsRef.current;
      if (studentIds.length === 0) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('mood_checkins')
        .select('student_id, mood_value, mood_label, note')
        .in('student_id', studentIds)
        .gte('checked_in_at', todayStart.toISOString());

      if (error) {
        console.error('Error fetching mood check-ins:', error);
        return;
      }

      const moodMap: Record<string, { mood_value: number; mood_label: string; note: string | null }> = {};
      for (const row of data || []) {
        moodMap[row.student_id] = {
          mood_value: row.mood_value,
          mood_label: row.mood_label,
          note: row.note
        };
      }
      setMoodCheckins(moodMap);
    };

    fetchJourneyStatuses();
    fetchMoodCheckins();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('teacher-journey-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_journey' },
        () => {
          fetchJourneyStatuses();
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journey_alerts' },
        () => {
          fetchJourneyStatuses();
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mood_checkins' },
        () => {
          fetchMoodCheckins();
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'status_flags' },
        () => {
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'evidence_logs' },
        () => {
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gate_passes' },
        () => {
          router.refresh();
        }
      )
      .on('error' as any, {} as any, (error: any) => {
        console.error('Realtime error:', error);
        setConnectionError(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teacherId]);

  // Check if current time is during active trip hours (7-9 AM or 2-5 PM)
  const isActiveHours = (() => {
    const hour = new Date().getHours();
    return (hour >= 7 && hour < 9) || (hour >= 14 && hour < 17);
  })();

  const toggleChat = (studentId: string) => {
    setShowChat((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  useEffect(() => {
    setPasses(gatePasses);
  }, [gatePasses]);

  const handleApprovePass = async (passId: string) => {
    setIsActionPending(true);
    try {
      const res = await approveGatePassAction(passId, teacherId);
      if (res.success && res.passCode) {
        setToast({ message: `Pass approved! Code: ${res.passCode}`, type: 'success' });
        setTimeout(() => setToast(null), 4000);
        setPasses(prev => prev.map(p => p.id === passId ? { ...p, status: 'approved', pass_code: res.passCode } : p));
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to approve pass', type: 'error' });
      setTimeout(() => setToast(null), 4000);
      setToastMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleRejectPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passToReject) return;
    setIsActionPending(true);
    try {
      const finalReason = rejectionReason || 'Rejection reason not specified';
      const res = await rejectGatePassAction(passToReject, teacherId, finalReason);
      if (res.success) {
        setToast({ message: 'Pass request rejected.', type: 'success' });
        setTimeout(() => setToast(null), 4000);
        setShowRejectModal(false);
        setPassToReject(null);
        setRejectionReason('');
        setCustomRejectionReason('');
        setPasses(prev => prev.map(p => p.id === passToReject ? { ...p, status: 'rejected', rejection_reason: finalReason } : p));
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to reject pass', type: 'error' });
      setTimeout(() => setToast(null), 4000);
      setToastMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsActionPending(false);
    }
  };

  // Sync state with server component updates
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const { registerStudentIds, registerRecipientId, notifications } = useNotifications();
 
  // Register student IDs for global message updates tracking and teacher ID for DB notifications
  useEffect(() => {
    const studentIds = students.map((s) => s.studentId);
    registerStudentIds(studentIds);
    registerRecipientId(teacherId);
  }, [students, teacherId, registerStudentIds, registerRecipientId]);

  const selectedStudent = students.find((s) => s.studentId === selectedStudentId);

  // Optimistic handler with rollback-on-error
  const handleMarkFalsePositive = async (studentId: string, flagId: string) => {
    const originalStudents = [...students];

    // Optimistically update student's status to 'On Track' and flag as corrected
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              status: 'On Track',
              activeStatusFlag: s.activeStatusFlag
                ? { ...s.activeStatusFlag, isCorrected: true }
                : null,
            }
          : s
      )
    );

    setToast({ message: 'Marked as false positive.', type: 'success' });
    const timer = setTimeout(() => setToast(null), 4000);

    startTransition(async () => {
      try {
        await markFalsePositiveAction(flagId, teacherId);
      } catch (err: any) {
        clearTimeout(timer);
        // Rollback state on error
        setStudents(originalStudents);
        setToast({ message: 'Failed to mark as false positive.', type: 'error' });
        setTimeout(() => setToast(null), 4000);
        setToastMessage(err.message || "Something went wrong. Please try again.");
      }
    });
  };

  const dashboardSnapshot = useMemo(() => ({
    students: students.length,
    attention: students.filter((student) => student.status === 'Needs Attention').length,
    watching: students.filter((student) => student.status === 'Worth Watching').length,
    pendingReviews: rawStudentsData.reduce((total, student) => total + (student.homework?.filter((item: any) => !item.isSubmitted && !item.submittedAt && !item.submitted_at).length || 0), 0),
  }), [students, rawStudentsData]);
  const productQueue = students
    .filter((student) => student.productInsight?.priority !== 'routine')
    .slice()
    .sort((a, b) => (a.productInsight?.priority === 'urgent' ? -1 : 1) - (b.productInsight?.priority === 'urgent' ? -1 : 1));

  return (
    <div className="teacher-shell min-h-screen bg-paper pb-10 pt-4 font-body">
      <div className="teacher-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. TEACHER INTELLIGENT DAILY BRIEFING (HERO HEADER) */}
        <header className="teacher-header mb-6 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                  Good Morning, Ms. Mehra
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  🤖 AI Teaching Companion
                </span>
              </div>
              <p className="mt-1 font-body text-xs text-slate-500 font-semibold">
                Class 8A &bull; Mathematics &amp; Science Coordinator &bull; Classroom 8A
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setToast({ message: '✓ All 14 students marked Present for Class 8A!', type: 'success' });
                  setTimeout(() => setToast(null), 4000);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-extrabold transition-all shadow-2xs active:scale-95"
              >
                <span>✅</span>
                <span>1-Tap Attendance (Mark All Present)</span>
              </button>

              <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-2xl text-xs font-mono font-bold">
                <span>⏱️ Prep Time: 3 mins</span>
              </div>

              <div className="hidden md:block">
                <NotificationBell />
              </div>
            </div>
          </div>

          {/* ShikshaSetu Copilot Strip */}
          <TeacherCopilotStrip />

          {/* Today's Daily Briefing Bullets */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 sm:p-5 space-y-2">
            <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
              Today&apos;s Intelligence Briefing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-semibold text-slate-700 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>2 students</strong> worth checking in with (Priya Patel, Rohan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Attendance completed</strong> (95% Present Today)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sky-600 font-bold">•</span>
                <span><strong>4 parent messages</strong> waiting in inbox</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Math Quiz</strong> scheduled at 11:00 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Overall class health:</strong> Stable (94%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Homework submission:</strong> 88% complete</span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. CLASS HEALTH ACTIONABLE METRICS */}
        <motion.section variants={staggerContainer} initial="hidden" animate="visible" aria-label="Today snapshot" className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <motion.div variants={fadeSlideUp}><SnapshotCard label="Active Students" value={dashboardSnapshot.students} tone="primary" /></motion.div>
          <motion.div variants={fadeSlideUp}><SnapshotCard label="Needs Check-in" value={dashboardSnapshot.attention} tone="error" /></motion.div>
          <motion.div variants={fadeSlideUp}><SnapshotCard label="Worth Watching" value={dashboardSnapshot.watching} tone="secondary" /></motion.div>
          <motion.div variants={fadeSlideUp}><SnapshotCard label="Pending Reviews" value={dashboardSnapshot.pendingReviews} tone="tertiary" /></motion.div>
        </motion.section>

        {/* 2.5 INTEGRATED SCHOOLGPT ASSISTANT WORKFLOW BAR */}
        <motion.div variants={fadeSlideUp} initial="hidden" animate="visible" className="mb-6 bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary-container/20 text-secondary-fixed flex items-center justify-center font-bold">
              ✨
            </div>
            <div>
              <p className="text-xs font-extrabold text-white font-display">Ask SchoolGPT Assistant</p>
              <p className="text-[11px] text-slate-300 font-medium">Instant AI guidance for lesson planning, student alerts, and parent updates.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl font-semibold border border-white/15 transition-all text-left"
            >
              💡 &ldquo;Why is Aarav struggling?&rdquo;
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl font-semibold border border-white/15 transition-all text-left"
            >
              📝 &ldquo;Draft PTM Summary&rdquo;
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className="bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed text-xs px-4 py-2 rounded-xl font-extrabold transition-all shadow-md ml-auto md:ml-0"
            >
              Open Assistant →
            </button>
          </div>
        </motion.div>

        {/* 3. STUDENT SUPPORT RADAR CARD (PRIMARY HERO FOCUS) */}
        <motion.section variants={fadeSlideUp} initial="hidden" animate="visible" className="mb-6 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/30 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                💚
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-extrabold text-slate-900">Student Support Radar</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-200">
                    High Priority Focus
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  &ldquo;Priya Patel has shown a gradual decline in homework completion over the past 2 weeks. A brief supportive conversation during today&apos;s homeroom is recommended.&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setToast({ message: '📅 Homeroom Check-in scheduled for Priya Patel today at 10:00 AM!', type: 'success' });
                  setTimeout(() => setToast(null), 4000);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>📅 Schedule Check-in</span>
              </button>
              <button
                type="button"
                onClick={() => setShowWhyDrawer(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-50 transition-all active:scale-95"
              >
                <span>🔍 Why am I seeing this?</span>
              </button>
            </div>
          </div>

          {/* 4 EVIDENCE BREAKDOWN CHIPS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Homework Completion</span>
              <strong className="text-xs font-extrabold text-amber-700 block">↓ 30% Over 14 Days</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Library Visits</span>
              <strong className="text-xs font-extrabold text-amber-700 block">0 Visits in 14 Days</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Participation</span>
              <strong className="text-xs font-extrabold text-amber-700 block">Slight Decline</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Record</span>
              <strong className="text-xs font-extrabold text-emerald-700 block">✓ 98% Stable</strong>
            </div>
          </div>
        </motion.section>

        {/* 4. SCHOOLGPT AI CLASS SUMMARY BANNER (SURFACED DIRECTLY ON MAIN FEED) */}
        <motion.section variants={fadeSlideUp} initial="hidden" animate="visible" className="mb-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🤖</span>
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-300">
                SchoolGPT Daily Class Intelligence Summary
              </h4>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Class 8A: Stable (94%)
            </span>
          </div>
          <p className="font-body text-xs leading-relaxed text-slate-200 font-medium">
            &ldquo;Your class is performing well overall. Attendance is excellent at 95%, and homework completion remains above average at 88%. Two students (Priya Patel and Rohan Sharma) may benefit from brief supportive check-ins during homeroom today.&rdquo;
          </p>
        </motion.section>

        {/* 5. TODAY'S CLASSROOM TIMELINE & INTERACTIVE NEXT ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Today's Next Actions (2 cols) */}
          <motion.section variants={fadeSlideUp} initial="hidden" animate="visible" className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Today&apos;s Action Items (Task Checklist)</h2>
                <p className="mt-0.5 text-xs font-semibold text-slate-600 font-body">Tap any checkbox as you complete tasks throughout your day.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-700 font-mono">
                {4 - Object.keys(completedActions).length} Remaining
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Check in with Priya Patel during homeroom', detail: 'Address homework completion drop (30% over 14 days)', tag: 'Urgent' },
                { title: 'Reply to Sunita Sharma regarding Bus #4 Saket stop', detail: 'Parent asked about evening pickup telemetry', tag: 'Message' },
                { title: 'Review Chapter 4 Mathematics Quiz scores', detail: 'Class average 92% — 2 students need review', tag: 'Academic' },
                { title: 'Approve pending Gate Pass for Kabir Verma', detail: 'Early departure requested for dental appointment', tag: 'Pass' },
              ].map((item, idx) => {
                const isDone = Boolean(completedActions[idx]);
                return (
                  <div
                    key={idx}
                    className={`p-3.5 border rounded-2xl flex items-start justify-between gap-3 transition-all ${
                      isDone ? 'bg-emerald-50/50 border-emerald-200 opacity-80' : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {
                          setCompletedActions((prev) => {
                            const next = { ...prev, [idx]: !prev[idx] };
                            if (!prev[idx]) {
                              setToast({ message: `✓ Task Completed: "${item.title}"`, type: 'success' });
                              setTimeout(() => setToast(null), 3000);
                            }
                            return next;
                          });
                        }}
                        className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-0 h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <h5 className={`font-display text-xs font-extrabold ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {item.title}
                        </h5>
                        <p className="font-body text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider shrink-0 border ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}>
                      {isDone ? 'Done ✓' : item.tag}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Today's Classroom Timeline (1 col) */}
          <motion.section variants={fadeSlideUp} initial="hidden" animate="visible" className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Classroom Timeline</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-600">Today&apos;s real-time events.</p>
            </div>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-100">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                <span className="font-mono text-[10px] font-bold text-slate-400 block">08:10 AM</span>
                <strong className="font-display text-xs font-extrabold text-slate-900 block">Attendance Completed</strong>
                <span className="text-[11px] text-slate-500">14/14 Students Verified</span>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-sky-500 border-2 border-white" />
                <span className="font-mono text-[10px] font-bold text-slate-400 block">09:30 AM</span>
                <strong className="font-display text-xs font-extrabold text-slate-900 block">Parent Message Received</strong>
                <span className="text-[11px] text-slate-500">Sunita Sharma &bull; Bus #4</span>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500 border-2 border-white" />
                <span className="font-mono text-[10px] font-bold text-slate-400 block">10:15 AM</span>
                <strong className="font-display text-xs font-extrabold text-slate-900 block">Homework Submitted</strong>
                <span className="text-[11px] text-slate-500">Algebra Practice #4 (12/14)</span>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-amber-500 border-2 border-white" />
                <span className="font-mono text-[10px] font-bold text-slate-400 block">11:00 AM</span>
                <strong className="font-display text-xs font-extrabold text-slate-900 block">Math Quiz Begins</strong>
                <span className="text-[11px] text-slate-500">Scheduled Classroom 8A</span>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Tab Navigation */}
        <div className="teacher-tabs mb-4 border-b border-deep-teal/[0.08]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 text-sm font-bold transition-all duration-200 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-deep-teal text-deep-teal'
                  : 'border-transparent text-deep-teal/60 hover:text-deep-teal/80'
              }`}
            >
              Class Overview
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`pb-2.5 text-sm font-bold transition-all duration-200 border-b-2 ${
                activeTab === 'growth'
                  ? 'border-deep-teal text-deep-teal'
                  : 'border-transparent text-deep-teal/60 hover:text-deep-teal/80'
              }`}
            >
              📈 Growth Analytics
            </button>
            <button
              onClick={() => setActiveTab('marks')}
              className={`pb-2.5 text-sm font-bold transition-all duration-200 border-b-2 ${
                activeTab === 'marks'
                  ? 'border-deep-teal text-deep-teal'
                  : 'border-transparent text-deep-teal/60 hover:text-deep-teal/80'
              }`}
            >
              Marks
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`pb-2.5 text-sm font-bold transition-all duration-200 border-b-2 ${
                activeTab === 'assistant'
                  ? 'border-deep-teal text-deep-teal'
                  : 'border-transparent text-deep-teal/60 hover:text-deep-teal/80'
              }`}
            >
              SchoolGPT
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Filter chips row below tabs */}
            <motion.div variants={fadeSlideUp} initial="hidden" animate="visible" className="mb-3.5 flex gap-2">
              {(['All', 'Needs Attention', 'Worth Watching'] as const).map((filterOpt) => (
                <button
                  key={filterOpt}
                  type="button"
                  onClick={() => setStatusFilter(filterOpt)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border ${
                    statusFilter === filterOpt
                      ? 'bg-deep-teal border-deep-teal text-white shadow-sm'
                      : 'bg-white border-deep-teal/[0.12] text-deep-teal/70 hover:border-deep-teal/20 hover:text-deep-teal/90 hover:bg-deep-teal/[0.02]'
                  }`}
                >
                  {filterOpt}
                </button>
              ))}
            </motion.div>

            {/* Grid of Student Cards (5 columns desktop -> 2 tablet -> 1 mobile) */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} className="h-[74px] w-full" />
                ))}
              </div>
            ) : students.filter((student) => {
              if (statusFilter === 'All') return true;
              return student.status === statusFilter;
            }).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 border border-deep-teal/[0.08] rounded-xl p-6 max-w-sm mx-auto space-y-3">
                <BookOpenIcon className="h-7 w-7 text-deep-teal/30" />
                <div>
                  <p className="font-display text-sm font-semibold text-deep-teal">No students to show</p>
                  <p className="font-body text-xs text-deep-teal/50 mt-1">Adjust filters to see more</p>
                </div>
              </div>
            ) : (() => {
              const filtered = students.filter((student) => {
                if (statusFilter === 'All') return true;
                return student.status === statusFilter;
              });

              const selectedIndex = filtered.findIndex((s) => s.studentId === selectedStudentId);
              const selectedStudent = selectedIndex !== -1 ? filtered[selectedIndex] : null;

              return (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="teacher-student-grid grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 relative">
                  {filtered.map((student, index) => {
                    const isSelected = selectedStudentId === student.studentId;
                    const photoUrl = getPhotoUrl(student.displayName);
                    const studentStatus = student.status;
                    const initials = student.displayName
                      .split(' ')
                      .map((n) => n[0])
                      .join('');

                    const showPanelAfterThisCard = selectedIndex !== -1 && index === Math.min(filtered.length - 1, Math.floor(selectedIndex / 5) * 5 + 4);

                    return (
                      <Fragment key={student.studentId}>
                        {/* Student Card */}
                        <motion.div variants={fadeSlideUp} className="relative h-[70px] w-full">
                          <div
                            onClick={() => {
                              setSelectedStudentId(isSelected ? null : student.studentId);
                            }}
                            className={`relative w-full h-[70px] px-2.5 py-2 rounded-lg border border-deep-teal/[0.08] bg-paper hover:shadow-md hover:border-deep-teal/15 transition-all duration-200 cursor-pointer flex items-center gap-2.5 active:scale-[0.98] ${
                              isSelected
                                ? (studentStatus === 'On Track' ? 'border-l-4 border-l-sage bg-deep-teal/[0.05] shadow-[0_4px_12px_rgba(25,28,29,.06)] border-deep-teal/15' :
                                   studentStatus === 'Worth Watching' ? 'border-l-4 border-l-marigold bg-deep-teal/[0.05] shadow-[0_4px_12px_rgba(25,28,29,.06)] border-deep-teal/15' :
                                   'border-l-4 border-l-warm-clay bg-deep-teal/[0.05] shadow-[0_4px_12px_rgba(25,28,29,.06)] border-deep-teal/15')
                                : 'border-l-4'
                            } ${
                              !isSelected && (studentStatus === 'On Track' ? 'border-l-sage' :
                              studentStatus === 'Worth Watching' ? 'border-l-marigold' :
                              'border-l-warm-clay')
                            }`}
                          >
                            <div className="flex items-center gap-2.5 w-full">
                              {/* Photo 42x42 */}
                              <div
                                className={`h-[42px] w-[42px] rounded-full overflow-hidden flex-shrink-0 bg-deep-teal/[0.04] flex items-center justify-center font-display text-sm font-bold text-deep-teal border-2 ${
                                  studentStatus === 'On Track' ? 'border-sage/40' :
                                  studentStatus === 'Worth Watching' ? 'border-marigold/40' :
                                  'border-warm-clay/40'
                                } ${
                                  isSelected ? 'shadow-sm' : ''
                                }`}
                              >
                                {photoUrl ? (
                                  <Image src={photoUrl} width={50} height={50} loading="lazy" className="h-full w-full object-cover" alt={student.displayName} />
                                ) : (
                                  initials
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 justify-between">
                                  <h3 className="font-display text-[15px] font-extrabold tracking-[-0.02em] text-deep-teal/95 truncate">
                                    {student.displayName}
                                  </h3>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {moodCheckins[student.studentId] && (
                                       <div className="relative group">
                                         <span
                                           className={`h-1.5 w-1.5 rounded-full block border border-white cursor-pointer ${
                                             moodCheckins[student.studentId].mood_value >= 4 ? 'bg-sage shadow-[0_0_4px_rgba(107,144,128,0.4)]' :
                                             moodCheckins[student.studentId].mood_value === 3 ? 'bg-marigold shadow-[0_0_4px_rgba(232,163,61,0.4)]' :
                                             'bg-warm-clay shadow-[0_0_4px_rgba(193,80,46,0.4)]'
                                           }`}
                                         />
                                         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-deep-teal/95 backdrop-blur-xs text-white text-[9px] font-medium py-1 px-2 rounded-md shadow-lg z-50 whitespace-nowrap leading-none">
                                           Mood: {moodCheckins[student.studentId].mood_label}
                                         </div>
                                       </div>
                                     )}
                                    {notifications.filter((n) => n.studentId === student.studentId).length > 0 && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-warm-clay shadow-[0_0_4px_rgba(193,80,46,0.3)] animate-pulse" title="New message from parent" />
                                    )}
                                  </div>
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1 items-center">
                                  <span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${STATUS_CHIP_STYLE[student.status]}`}>
                                    {student.status === 'On Track' ? (
                                      <CheckIcon className="h-2.5 w-2.5 text-sage" />
                                    ) : student.status === 'Worth Watching' ? (
                                      <AlertCircleIcon className="h-2.5 w-2.5 text-marigold" />
                                    ) : (
                                      <ZapIcon className="h-2.5 w-2.5 text-warm-clay" />
                                    )}
                                    {student.status}
                                  </span>
                                  {/* Journey Status Chip */}
                                  {isActiveHours && journeyStatuses[student.studentId] && (
                                    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wide ${
                                      journeyStatuses[student.studentId] === 'boarded' ? 'bg-marigold/10 text-marigold border border-marigold/20' :
                                      journeyStatuses[student.studentId] === 'deboarded' ? 'bg-sage/10 text-sage border border-sage/20' :
                                      journeyStatuses[student.studentId] === 'home_safe' ? 'bg-sage/15 text-sage border border-sage/25' :
                                      journeyStatuses[student.studentId] === 'alert' ? 'bg-warm-clay/10 text-warm-clay border border-warm-clay/20 animate-pulse' :
                                      'bg-deep-teal/5 text-deep-teal/50 border border-deep-teal/10'
                                    }`}>
                                      {journeyStatuses[student.studentId] === 'boarded' && '🚌 Bus'}
                                      {journeyStatuses[student.studentId] === 'waiting' && '⏳ Wait'}
                                      {journeyStatuses[student.studentId] === 'deboarded' && '📍 Drop'}
                                      {journeyStatuses[student.studentId] === 'home_safe' && '🏠 Home'}
                                      {journeyStatuses[student.studentId] === 'alert' && '⚠️ Alert'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Expanded details below the row */}
                        {showPanelAfterThisCard && selectedStudent && (() => {
                          const selStatus = selectedStudent.status;
                          const selPhotoUrl = getPhotoUrl(selectedStudent.displayName);
                          const selInitials = selectedStudent.displayName
                            .split(' ')
                            .map((n) => n[0])
                            .join('');

                          return (
                            <motion.div 
                              variants={scaleIn}
                              initial="hidden"
                              animate="visible"
                              onClick={(e) => e.stopPropagation()}
                              className="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-5 mt-2"
                            >
                              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/95 rounded-xl border border-deep-teal/[0.08] border-l-4 ${STATUS_BORDER_L_COLOR[selStatus]} shadow-[0_4px_16px_rgba(25,28,29,.05)] relative`}>
                                
                                {/* Close Button */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentId(null)}
                                  className="absolute top-3.5 right-3.5 text-deep-teal/40 hover:text-deep-teal/70 transition-colors p-1.5 rounded-md hover:bg-deep-teal/5"
                                  aria-label="Close details"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>

                                {/* Left Column: Evidence Card */}
                                <div className="space-y-3.5 pr-1">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`h-[48px] w-[48px] rounded-full overflow-hidden flex-shrink-0 bg-deep-teal/[0.04] flex items-center justify-center font-display text-sm font-bold text-deep-teal border-2 ${
                                        selStatus === 'On Track' ? 'border-sage/50' :
                                        selStatus === 'Worth Watching' ? 'border-marigold/50' :
                                        'border-warm-clay/50'
                                      }`}
                                    >
                                      {selPhotoUrl ? (
                                        <Image src={selPhotoUrl} width={50} height={50} loading="lazy" className="h-full w-full object-cover" alt={selectedStudent.displayName} />
                                      ) : (
                                        selInitials
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-display text-[17px] text-deep-teal/95 font-extrabold leading-tight tracking-[-0.02em]">
                                        {selectedStudent.displayName}
                                      </h3>
                                      <div className="mt-0.5">
                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[9px] font-bold ${STATUS_CHIP_STYLE[selectedStudent.status]}`}>
                                          {selectedStudent.status === 'On Track' ? (
                                            <CheckIcon className="h-3 w-3 text-sage" />
                                          ) : selectedStudent.status === 'Worth Watching' ? (
                                            <AlertCircleIcon className="h-3 w-3 text-marigold" />
                                          ) : (
                                            <ZapIcon className="h-3 w-3 text-warm-clay" />
                                          )}
                                          {selectedStudent.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-black text-deep-teal/65 uppercase tracking-[0.14em] block">AI Insight</span>
                                    <p className="font-body text-xs md:text-sm font-semibold text-deep-teal/92 leading-relaxed bg-deep-teal/[0.03] border border-deep-teal/[0.08] p-3 rounded-lg">
                                      {selectedStudent.explanation}
                                    </p>
                                  </div>

                                  {selectedStudent.productInsight && (
                                    <div className="space-y-2 rounded-lg border border-deep-teal/[0.07] bg-white/78 p-3 shadow-2xs">
                                      <span className="text-[10px] font-black text-deep-teal/60 uppercase tracking-[0.14em] block">Recommended Action</span>
                                      <h4 className="font-display text-[13px] md:text-sm font-extrabold tracking-[-0.02em] text-deep-teal/95">{selectedStudent.productInsight.headline}</h4>
                                      <p className="font-body text-xs font-semibold leading-relaxed text-deep-teal/72">{selectedStudent.productInsight.nextAction}</p>
                                      {selectedStudent.productInsight.missingInformation.length > 0 && (
                                        <p className="font-body text-[10px] font-semibold text-deep-teal/50">
                                          Missing: {selectedStudent.productInsight.missingInformation.join(', ')}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <span className="text-[10px] font-black text-deep-teal/60 uppercase tracking-[0.14em] block">Evidence Logs</span>
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                      {selectedStudent.evidence && selectedStudent.evidence.length > 0 ? (
                                        selectedStudent.evidence.map((item, itemIdx) => (
                                          <div key={item.id || itemIdx} className="space-y-1 bg-deep-teal/[0.025] border border-deep-teal/[0.06] p-2.5 rounded-lg">
                                            <div className="flex items-center gap-1.5">
                                              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.status === 'on-track' ? 'var(--sage)' : item.status === 'worth-watching' ? 'var(--marigold)' : 'var(--warm-clay)' }} />
                                              <span className="font-display text-xs font-bold text-deep-teal/92">{item.headline}</span>
                                            </div>
                                            <ul className="space-y-0.5 pl-3">
                                              {item.bullets.map((bullet, idx) => (
                                                <li key={idx} className="flex items-start gap-1.5 font-body text-[11px] text-deep-teal/75 font-semibold leading-relaxed">
                                                  <span className="text-[9px] mt-0.5 text-deep-teal/40">•</span>
                                                  <span>{sanitizeBulletText(bullet)}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="font-body text-xs text-deep-teal/50 italic p-3 text-center border border-dashed border-deep-teal/[0.08] rounded-lg">
                                          No evidence logs available.
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {selectedStudent.activeStatusFlag && !selectedStudent.activeStatusFlag.isCorrected && selectedStudent.status !== 'On Track' && (
                                    <div className="pt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleMarkFalsePositive(selectedStudent.studentId, selectedStudent.activeStatusFlag!.id)}
                                        className="border border-deep-teal/[0.2] text-deep-teal hover:bg-deep-teal/[0.04] font-display text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 bg-transparent"
                                      >
                                        Mark as False Positive
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Right Column: Chat with Parent */}
                                <div className="border-t md:border-t-0 md:border-l border-deep-teal/[0.08] pt-4 md:pt-0 md:pl-4 flex flex-col min-h-[300px]">
                                  <div className="mb-2">
                                    <p className="font-body text-xs font-black text-deep-teal/72 uppercase tracking-[0.14em]">
                                      Parent Communication
                                    </p>
                                    <p className="font-body text-[10px] text-deep-teal/55 font-semibold mt-0.5">
                                      Asynchronous updates · parents reply at convenience
                                    </p>
                                  </div>
                                  <div className="flex-1 overflow-y-auto">
                                    <TeacherChat
                                      studentId={selectedStudent.studentId}
                                      studentName={selectedStudent.displayName}
                                      teacherId={teacherId}
                                    />
                                  </div>
                                </div>

                              </div>
                            </motion.div>
                          );
                        })()}
                      </Fragment>
                    );
                  })}
                </motion.div>
              );
            })()}
          </>
        )}

        {activeTab === 'growth' && (
          <AcademicGrowthAnalytics studentName="Class 8A Aggregated Trajectory" />
        )}

        {activeTab === 'marks' && (
          <TeacherMarksPanel teacherId={teacherId} />
        )}

        {activeTab === 'assistant' && (
          <div className="flex flex-col rounded-xl border border-deep-teal/[0.08] bg-white/70 p-4 shadow-sm" style={{ height: 'calc(100vh - 200px)' }}>
            <SchoolGPTChat role="teacher" teacherId={teacherId} classGrade="8" />
          </div>
        )}
      </div>

      {/* Right-Side Explanation Drawer Overlay (Why Am I Seeing This?) */}
      <AnimatePresence>
        {showWhyDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true" aria-labelledby="why-drawer-title">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWhyDrawer(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col justify-between overflow-y-auto z-10 border-l border-slate-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-lg">
                    🔍
                  </div>
                  <div>
                    <h3 id="why-drawer-title" className="font-display text-base font-extrabold text-slate-900">
                      AI Recommendation Explainability
                    </h3>
                    <p className="font-body text-xs text-slate-500 font-semibold">Student Support Radar Analysis</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWhyDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-extrabold text-sm transition-all"
                  aria-label="Close drawer"
                >
                  ✕
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Student Profile Card */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-emerald-400 overflow-hidden flex items-center justify-center font-display text-base font-extrabold text-slate-700">
                    <Image src="/priya.png" width={50} height={50} alt="Priya Patel" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-extrabold text-slate-900">Priya Patel</h4>
                    <p className="font-body text-xs text-slate-500">Class 8A &bull; Roll #14 &bull; Mathematics</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                      Needs Check-in
                    </span>
                  </div>
                </div>

                {/* AI Recommendation Box */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Generated Recommendation</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold">94% High Confidence</span>
                  </div>
                  <p className="font-body text-xs leading-relaxed text-slate-800 font-semibold">
                    &ldquo;Priya Patel has shown a gradual decline in homework completion over the past 2 weeks. A brief supportive conversation during today&apos;s homeroom is recommended.&rdquo;
                  </p>
                </div>

                {/* Supporting Evidence Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                    Supporting Evidence Signals
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="font-display font-extrabold text-slate-900 block">Homework Completion Rate</strong>
                        <span className="font-body text-[11px] text-slate-500">Decreased by 30% over the last 14 days</span>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] rounded-full">Primary Trigger</span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="font-display font-extrabold text-slate-900 block">Library &amp; Study Visits</strong>
                        <span className="font-body text-[11px] text-slate-500">0 visits in 14 days (Class avg: 3 visits)</span>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] rounded-full">Low Engagement</span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="font-display font-extrabold text-slate-900 block">Class Q&amp;A Participation</strong>
                        <span className="font-body text-[11px] text-slate-500">Slight decline recorded during Math sessions</span>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px] rounded-full">Secondary</span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="font-display font-extrabold text-slate-900 block">Daily Attendance Record</strong>
                        <span className="font-body text-[11px] text-slate-500">98% verified present &bull; Zero safety flags</span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-full">✓ Stable</span>
                    </div>
                  </div>
                </div>

                {/* Why Was This Recommendation Generated? */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1.5 text-xs">
                  <h5 className="font-display font-extrabold text-slate-900">Why was this recommendation generated?</h5>
                  <p className="font-body text-slate-600 leading-relaxed">
                    SchoolGPT detected a 2-week consecutive drop in assignment submission timing paired with zero library check-ins. Historically in Class 8A, early supportive teacher conversations resolve 85% of early engagement slips.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/80 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWhyDrawer(false);
                    setToast({ message: '📅 Homeroom Check-in scheduled for Priya Patel today at 10:00 AM!', type: 'success' });
                    setTimeout(() => setToast(null), 4000);
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>📅 Schedule Homeroom Check-in</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowWhyDrawer(false);
                    setSelectedStudentId('st_2');
                  }}
                  className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-2xl transition-all"
                >
                  ⏱️ View Full Student Timeline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Toast message={toast.message} onClose={() => setToast(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
