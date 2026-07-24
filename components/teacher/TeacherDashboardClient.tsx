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

const localSanitizeBulletText = (text: string, studentName: string): string => {
  const firstName = studentName.split(' ')[0];
  const cleaned = text.trim();

  // 1. Attendance: "X/Y days present (Z% attendance)"
  const presenceRegex = /(\d+)\/(\d+)\s+days\s+present\s*\((\d+)%\s+attendance\)/i;
  if (presenceRegex.test(cleaned)) {
    const match = cleaned.match(presenceRegex);
    if (match) {
      const present = parseInt(match[1]);
      const total = parseInt(match[2]);
      const absences = total - present;
      if (absences === 0) {
        return `${firstName} attended all scheduled days of classes recently.`;
      }
      return `${firstName} missed ${absences === 1 ? 'one day' : absences === 2 ? 'two days' : absences === 3 ? 'three days' : absences + ' days'} of school recently.`;
    }
  }

  // 2. Attendance: "Missed X days, arrived late Y times"
  const lateRegex = /Missed\s+(\d+)\s+days,\s+arrived\s+late\s+(\d+)\s+times/i;
  if (lateRegex.test(cleaned)) {
    const match = cleaned.match(lateRegex);
    if (match) {
      const absences = parseInt(match[1]);
      const lates = parseInt(match[2]);
      if (absences > 0 && lates > 0) {
        return `${firstName} missed ${absences === 1 ? 'a day' : absences === 2 ? 'two days' : absences === 3 ? 'three days' : absences + ' days'} and arrived late ${lates === 1 ? 'once' : lates === 2 ? 'twice' : lates + ' times'} recently.`;
      } else if (absences > 0) {
        return `${firstName} missed ${absences === 1 ? 'one day' : absences === 2 ? 'two days' : absences === 3 ? 'three days' : absences + ' days'} of school recently.`;
      } else if (lates > 0) {
        return `${firstName} arrived late ${lates === 1 ? 'once' : lates === 2 ? 'twice' : lates === 3 ? 'three times' : lates + ' times'} recently.`;
      }
    }
  }

  // 3. Homework: "X of Y assignments missed (Z% gap)"
  const hwRegex = /(\d+)\s+of\s+(\d+)\s+assignments\s+missed\s*\((\d+)%\s+gap\)/i;
  if (hwRegex.test(cleaned)) {
    const match = cleaned.match(hwRegex);
    if (match) {
      const missed = parseInt(match[1]);
      const total = parseInt(match[2]);
      if (missed === 0) {
        return `${firstName} has submitted all homework assignments on time.`;
      }
      return `${firstName} missed submitting ${missed === 1 ? 'one' : missed === 2 ? 'two' : missed === 3 ? 'three' : missed + ' assignments'} of ${total} homework tasks.`;
    }
  }

  // 4. Homework streak: "Longest streak of missed homework: X in a row"
  const hwStreakRegex = /Longest\s+streak\s+of\s+missed\s+homework:\s*(\d+)\s+in\s+a\s+row/i;
  if (hwStreakRegex.test(cleaned)) {
    const match = cleaned.match(hwStreakRegex);
    if (match) {
      const streak = parseInt(match[1]);
      return `${firstName} missed completing ${streak === 1 ? 'one assignment' : streak === 2 ? 'two assignments' : streak === 3 ? 'three assignments' : streak + ' assignments'} in a row.`;
    }
  }

  // 5. Grades: "Math scores: initial X% -> latest Y% (dropped Z pts)"
  const gradeDropRegex = /(\w+)\s+scores:\s*initial\s+(\d+)%\s*→\s*latest\s+(\d+)%\s*\((dropped|gained)\s+(\d+)\s+pts\)/i;
  if (gradeDropRegex.test(cleaned)) {
    const match = cleaned.match(gradeDropRegex);
    if (match) {
      const subject = match[1];
      const direction = match[4].toLowerCase();
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

  useEffect(() => {
    setIsLoading(false);
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

  const dashboardSnapshot = {
    students: students.length,
    attention: students.filter((student) => student.status === 'Needs Attention').length,
    watching: students.filter((student) => student.status === 'Worth Watching').length,
    pendingReviews: rawStudentsData.reduce((total, student) => total + (student.homework?.filter((item: any) => !item.isSubmitted && !item.submittedAt && !item.submitted_at).length || 0), 0),
  };
  const productQueue = students
    .filter((student) => student.productInsight?.priority !== 'routine')
    .slice()
    .sort((a, b) => (a.productInsight?.priority === 'urgent' ? -1 : 1) - (b.productInsight?.priority === 'urgent' ? -1 : 1));

  return (
    <div className="teacher-shell min-h-screen bg-paper pb-10 pt-4 font-body">
      <div className="teacher-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="teacher-header mb-4 flex flex-col justify-between gap-3 rounded-xl border border-deep-teal/[0.06] bg-white/80 p-4 px-5 shadow-[0_1px_3px_rgba(25,28,29,.02)] backdrop-blur-sm md:flex-row md:items-center">
          <div className="flex justify-between items-start w-full md:w-auto">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-deep-teal">
                  Class Overview
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-deep-teal/10 border border-deep-teal/15 text-deep-teal font-extrabold text-[10px] uppercase tracking-wider">
                  💻 Teacher Web Dashboard
                </span>
              </div>
              <p className="mt-0.5 font-body text-xs text-deep-teal/70 font-semibold">
                Ms. Ananya Mehra · Class 8A · Math & Science
              </p>
            </div>
            <div className="md:hidden">
              <NotificationBell />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setToast({ message: '✓ All 14 students marked Present for Class 8A!', type: 'success' });
                setTimeout(() => setToast(null), 4000);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-sage/15 border border-sage/30 px-3.5 py-2 text-xs font-black text-sage hover:bg-sage hover:text-white transition-all shadow-2xs"
            >
              <span>✅</span>
              <span>1-Tap Roll Call (Mark All Present)</span>
            </button>
            <div className="hidden md:block">
              <NotificationBell />
            </div>
            <div className="flex gap-3 font-body text-[11px] text-deep-teal/70 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                On Track
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-marigold" />
                Worth Watching
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-warm-clay" />
                Needs Attention
              </span>
            </div>
          </div>
        </header>

        <motion.section variants={staggerContainer} initial="hidden" animate="visible" aria-label="Today snapshot" className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <motion.div variants={fadeSlideUp}><SnapshotCard label="Students" value={dashboardSnapshot.students} tone="primary" /></motion.div>
          <motion.div variants={fadeSlideUp}><SnapshotCard label="Needs attention" value={dashboardSnapshot.attention} tone="error" /></motion.div>
          <motion.div variants={fadeSlideUp}><SnapshotCard label="Worth watching" value={dashboardSnapshot.watching} tone="secondary" /></motion.div>
          <motion.div variants={fadeSlideUp}><SnapshotCard label="Pending reviews" value={dashboardSnapshot.pendingReviews} tone="tertiary" /></motion.div>
        </motion.section>

        {/* 💚 STUDENT SUPPORT RADAR CARD (Warm, Compassionate Engagement Detection) */}
        <motion.section variants={fadeSlideUp} initial="hidden" animate="visible" className="mb-4 rounded-2xl border border-sage/30 bg-gradient-to-br from-sage/15 via-white to-primary/5 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sage/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sage/20 border border-sage/30 flex items-center justify-center text-lg shrink-0">
                💚
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-black text-ink">Student Support Radar</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-sage/20 text-sage font-extrabold text-[9px] uppercase tracking-wider">
                    Care Opportunity
                  </span>
                </div>
                <p className="text-xs font-semibold text-muted/80 mt-0.5">
                  Gradual change in engagement observed. A brief, supportive conversation may help.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  alert("📅 Check-in Scheduled for Aarav Sharma on Monday 10:00 AM.");
                }}
                className="px-3.5 py-2 rounded-xl bg-sage text-white font-extrabold text-xs shadow-2xs hover:brightness-105 transition-all flex items-center gap-1.5"
              >
                <span>📅 Schedule Check-in</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Why am I seeing this?\n\n• Homework completion decreased by 30% over 14 days\n• Library activity: No visits in 14 days\n• Class participation: Gradual decline\n• Attendance: Stable ✓\n\nAI Confidence: Moderate");
                }}
                className="px-3 py-2 rounded-xl bg-white border border-sage/30 text-sage font-extrabold text-xs hover:bg-sage/5 transition-all"
              >
                <span>🔍 Why am I seeing this?</span>
              </button>
            </div>
          </div>

          {/* 4 EVIDENCE BREAKDOWN CHIPS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white/90 border border-sage/20">
              <span className="text-[10px] font-bold text-muted/70 block">Homework Completion</span>
              <strong className="text-xs font-black text-amber-700 block">↓ 30% Over 14 Days</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-sage/20">
              <span className="text-[10px] font-bold text-muted/70 block">Library Activity</span>
              <strong className="text-xs font-black text-amber-700 block">No Visits in 14 Days</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-sage/20">
              <span className="text-[10px] font-bold text-muted/70 block">Class Participation</span>
              <strong className="text-xs font-black text-amber-700 block">Slight Decline</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-sage/20">
              <span className="text-[10px] font-bold text-muted/70 block">Attendance</span>
              <strong className="text-xs font-black text-sage block">✓ 98% Stable</strong>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeSlideUp} initial="hidden" animate="visible" className="mb-4 rounded-xl border border-deep-teal/[0.07] bg-white/92 p-4 shadow-sm">
          <div className="mb-3 flex items-end justify-between gap-3 border-b border-deep-teal/10 pb-2">
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-deep-teal/85">Teacher Next Actions</h2>
              <p className="mt-1 text-xs font-medium text-deep-teal/60">The highest-priority interventions for today.</p>
            </div>
            <span className="rounded-full border border-deep-teal/10 bg-deep-teal/[0.03] px-2.5 py-1 text-[10px] font-bold text-deep-teal/72">{productQueue.length} pending</span>
          </div>
          {productQueue.length > 0 ? (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-2 md:grid-cols-2">
              {productQueue.slice(0, 4).map((student) => (
                <motion.div key={student.studentId} variants={fadeSlideUp}>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId(student.studentId)}
                    className="w-full rounded-lg border border-deep-teal/[0.07] bg-paper px-3 py-2.5 text-left transition-all duration-200 hover:border-deep-teal/20 hover:bg-deep-teal/[0.02] hover:shadow-sm active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-[15px] font-extrabold tracking-[-0.02em] text-deep-teal/95">{student.displayName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${student.productInsight?.priority === 'urgent' ? 'bg-warm-clay/10 text-warm-clay' : 'bg-marigold/10 text-marigold'}`}>
                        {student.productInsight?.priority}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-deep-teal/78">{student.productInsight?.nextAction}</p>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="mt-1 text-xs font-semibold text-deep-teal/62">No intervention queue right now. Keep attendance, homework, wellness, and transport updates current.</p>
          )}
        </motion.section>

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
                                                  <span>{localSanitizeBulletText(bullet, selectedStudent.displayName)}</span>
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
