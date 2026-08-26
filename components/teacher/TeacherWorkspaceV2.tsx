'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeacherSidebar from './TeacherSidebar';
import TodaysFocusBar from './TodaysFocusBar';
import SupportRadarWidget from './widgets/SupportRadarWidget';
import AttendanceWidget from './widgets/AttendanceWidget';
import HomeworkWidget from './widgets/HomeworkWidget';
import ScheduleCalendarWidget from './widgets/ScheduleCalendarWidget';
import SchoolGPTSpotlight from '../schoolgpt/SchoolGPTSpotlight';
import SchoolGPTDrawer from '../schoolgpt/SchoolGPTDrawer';
import Student360Modal from './Student360Modal';
import AiHomeworkModal from './AiHomeworkModal';
import SchoolPulsePDF from './SchoolPulsePDF';
import TeacherMarksPanel from './TeacherMarksPanel';
import TeacherChat from './TeacherChat';
import PersistentAISearch from './PersistentAISearch';
import ClassroomInsightCard from './ClassroomInsightCard';
import TeacherAiToolkitModal, { type ToolkitTab } from './TeacherAiToolkitModal';
import { TakeAttendanceModal } from './TakeAttendanceModal';
import { useContextRegistry } from '../schoolgpt/context/ContextRegistry';
import { useAmbientAICore } from '../schoolgpt/core/AmbientIntelligenceCore';
import { useTimeGreeting } from '@/lib/utils/timeGreeting';
import type { TeacherClassContext } from '@/app/teacher/page';
import type { AttendanceRosterStudent } from '@/lib/attendance/types';

const getPhotoUrl = (name: string): string | null => {
  const lower = name.toLowerCase();
  if (lower.includes('aarav')) return '/aarav.png';
  if (lower.includes('priya')) return '/priya.png';
  if (lower.includes('rohan')) return '/rohan.png';
  if (lower.includes('ananya')) return '/ananya.png';
  if (lower.includes('kabir')) return '/kabir.png';
  return null;
};

const PARENT_MAP: Record<string, { parentName: string; relationship: string; phone: string }> = {
  'Aarav Sharma': { parentName: 'Sunita Sharma', relationship: 'Mother', phone: '+91 98765 43210' },
  'Priya Patel': { parentName: 'Rajesh Patel', relationship: 'Father', phone: '+91 98123 45678' },
  'Rohan Singh': { parentName: 'Gurpreet Singh', relationship: 'Father', phone: '+91 97234 56789' },
  'Ananya Gupta': { parentName: 'Pooja Gupta', relationship: 'Mother', phone: '+91 96345 67890' },
  'Kabir Khan': { parentName: 'Farah Khan', relationship: 'Mother', phone: '+91 95456 78901' },
};

interface TeacherWorkspaceV2Props {
  readonly classContext: TeacherClassContext;
}

export default function TeacherWorkspaceV2({ classContext }: TeacherWorkspaceV2Props) {
  const timeGreeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('today');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_attention' | 'worth_watching' | 'on_track'>('all');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [isAiToolkitOpen, setIsAiToolkitOpen] = useState(false);
  const [aiToolkitTab, setAiToolkitTab] = useState<ToolkitTab>('exit_ticket');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Chat with parent state
  const [chattingStudent, setChattingStudent] = useState<{ id: string; name: string } | null>(null);
  const [activeParentTabStudentId, setActiveParentTabStudentId] = useState<string>(
    classContext.students[0]?.studentId || 'b1000000-0000-4000-8000-000000000001'
  );

  const { ask, isLoading } = useAmbientAICore();
  const { setContext } = useContextRegistry();

  const displayName = classContext.teacherName;
  const teacherId = classContext.teacherId;
  const { grade, section, students } = classContext;

  const attendanceRoster: AttendanceRosterStudent[] = students.map((s) => ({
    studentId: s.studentId || '',
    displayName: s.displayName || 'Student',
    rollNumber: s.roll_number || '',
    currentStatus: 'present',
  }));

  const pulsePdfStudents = useMemo(() => {
    return students.map((s) => {
      const totalAtt = s.attendance?.length || 10;
      const presAtt = s.attendance?.filter((a) => a.status === 'present').length || 9;
      const totalHw = s.homework?.length || 5;
      const subHw = s.homework?.filter((h) => h.isSubmitted).length || 4;
      return {
        studentId: s.studentId || '',
        displayName: s.displayName || 'Student',
        rollNumber: s.roll_number || '801',
        grade: (s as any).grade || grade || '8',
        section: (s as any).section || section || 'A',
        teacherName: displayName || 'Ananya Mehra',
        academicYear: '2026–27',
        attendance: {
          present: presAtt,
          total: totalAtt,
          percentage: Math.round((presAtt / totalAtt) * 100),
        },
        homework: {
          submitted: subHw,
          total: totalHw,
          percentage: Math.round((subHw / totalHw) * 100),
        },
        grades: s.grades || [],
        positiveNote: (s as any).aiExplanation || `${s.displayName || 'Student'} demonstrates strong conceptual clarity and active participation in class discussions.`,
        conversationPrompt: `Celebrate achievements in Mathematics and discuss goals for the upcoming term.`,
      };
    });
  }, [students, grade, section, displayName]);

  const handleQuerySend = (query: string) => {
    if (query === 'View Attendance') {
      setIsAttendanceModalOpen(true);
      return;
    }
    if (query === 'Open Homework' || query.includes('homework')) {
      setIsHomeworkModalOpen(true);
      return;
    }
    if (query === 'Open Student Profile') {
      if (students.length > 0 && students[0].studentId) {
        setSelectedStudentId(students[0].studentId);
      }
      return;
    }
    if (query === 'Generate Parent Summary') {
      setIsPdfModalOpen(true);
      return;
    }
    if (query === 'Chat with Parent') {
      setActiveTab('parents');
      return;
    }
    if (query === 'Schedule Check-in') {
      setActiveTab('calendar');
      return;
    }
    if (query === 'Compare with Class Average') {
      setActiveTab('analytics');
      return;
    }

    ask(query);
    setIsDrawerOpen(true);
  };

  const handleFocusItemClick = (actionKey: string) => {
    if (actionKey === 'needs_attention_students' || actionKey.includes('student')) {
      setStatusFilter('needs_attention');
      setActiveTab('students');
    } else if (actionKey === 'open_homework_hub' || actionKey.includes('homework')) {
      setIsHomeworkModalOpen(true);
    } else if (actionKey === 'view_attendance_modal' || actionKey.includes('Attendance')) {
      setIsAttendanceModalOpen(true);
    } else if (actionKey === 'open_ai_toolkit') {
      setAiToolkitTab('lesson');
      setIsAiToolkitOpen(true);
    } else {
      handleQuerySend(`Tell me more about: ${actionKey}`);
    }
  };

  const handlePromptCardClick = (cardTitle: string, prompt: string) => {
    if (cardTitle === 'Support Radar') {
      setStatusFilter('needs_attention');
      setActiveTab('students');
    } else if (cardTitle === 'Student Report') {
      const targetStudent = students.find((s) => (s as any).status?.toLowerCase().includes('attention')) || students[0];
      if (targetStudent && targetStudent.studentId) setSelectedStudentId(targetStudent.studentId);
    } else if (cardTitle === 'Class Performance') {
      setActiveTab('analytics');
    } else if (cardTitle === 'Attendance Summary') {
      setIsAttendanceModalOpen(true);
    } else if (cardTitle === 'Homework Today') {
      setIsHomeworkModalOpen(true);
    } else if (cardTitle === 'PTM Draft') {
      setActiveTab('parents');
    } else {
      handleQuerySend(prompt);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'attendance') {
      setContext({ module: 'attendance' });
      setIsAttendanceModalOpen(true);
    } else if (tab === 'assignments') {
      setContext({ module: 'homework' });
    } else if (tab === 'students') {
      setContext({ module: 'general' });
    } else if (tab === 'parents') {
      setContext({ module: 'general' });
    }
  };

  const openParentChat = (studentId?: string, studentName?: string) => {
    if (studentId && studentName) {
      setChattingStudent({ id: studentId, name: studentName });
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = s.displayName || '';
      const matchesSearch = name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.roll_number && s.roll_number.includes(studentSearch));
      
      const normalizedStatus = (s as any).status?.toLowerCase().replace(/\s+/g, '_') || 'on_track';
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, studentSearch, statusFilter]);

  const studentCounts = useMemo(() => {
    let needsAttention = 0;
    let worthWatching = 0;
    let onTrack = 0;
    students.forEach((s) => {
      const st = (s as any).status?.toLowerCase().replace(/\s+/g, '_');
      if (st === 'needs_attention') needsAttention++;
      else if (st === 'worth_watching') worthWatching++;
      else onTrack++;
    });
    return { total: students.length, needsAttention, worthWatching, onTrack };
  }, [students]);

  const activeParentStudent = useMemo(() => {
    return students.find((s) => s.studentId === activeParentTabStudentId) || students[0];
  }, [students, activeParentTabStudentId]);

  const suggestedCards = [
    { title: 'Support Radar', prompt: 'Which students need support today?', icon: '🎯', bg: 'bg-rose-50 border-rose-100 text-rose-700' },
    { title: 'Student Report', prompt: 'Show complete academic report for student needing support.', icon: '👤', bg: 'bg-purple-50 border-purple-100 text-purple-700' },
    { title: 'Class Performance', prompt: 'How is my class performing this week?', icon: '📊', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
    { title: 'Attendance Summary', prompt: "Summarize today's attendance.", icon: '📅', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { title: 'Homework Today', prompt: "What's the homework for today?", icon: '📖', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
    { title: 'PTM Draft', prompt: "Generate PTM summary for parent update.", icon: '✉️', bg: 'bg-pink-50 border-pink-100 text-pink-700' },
  ];

  const quickActions = [
    'View Attendance',
    'Open Homework',
    'Chat with Parent',
    'Compare with Class Average',
    'Generate Parent Summary',
    'Schedule Check-in',
    'Open Student Profile',
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-body text-slate-900 overflow-x-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-64 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Left Task-Oriented Sidebar */}
      <TeacherSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        teacherName={displayName}
      />

      {/* Main Workspace Content Area */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
        {/* ============================================================ */}
        {/* TAB 1: TODAY (CALM, INTELLIGENT TEACHER WORKSPACE)          */}
        {/* ============================================================ */}
        {activeTab === 'today' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-6 max-w-5xl"
          >
            {/* 1. Header Greeting */}
            <div className="space-y-1">
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                {timeGreeting}, <span className="text-[#2563EB]">{displayName}</span> 👋
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Class {grade}{section} · Your teaching workspace
              </p>
            </div>

            {/* 2. LEVEL 1: TODAY'S FOCUS (One Dominant Card) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-rose-200/80 shadow-[0_4px_24px_rgba(225,29,72,0.06)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎯</span>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600">
                      Today&apos;s Focus
                    </span>
                    <h2 className="font-display text-base sm:text-lg font-black text-slate-900">
                      {studentCounts.needsAttention > 0
                        ? `${studentCounts.needsAttention} students need attention`
                        : 'All students on track'}
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 self-start sm:self-auto">
                  Mathematics · Equivalent Fractions
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Several students struggled with the latest concept check. Targeted review recommended before advancing.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('needs_attention');
                    setActiveTab('students');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-display text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review Students</span>
                  <span>&rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiToolkitTab('lesson');
                    setIsAiToolkitOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Plan 10-Min Revision</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* 3. Small Status Metric Row (Compact supporting info) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Class Size</span>
                <p className="font-display text-base font-bold text-slate-900">{students.length} Students</p>
              </div>
              <div className="space-y-0.5 border-l border-slate-100">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Attendance</span>
                <p className="font-display text-base font-bold text-emerald-600">96% Present</p>
              </div>
              <div className="space-y-0.5 border-l border-slate-100">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Assignments</span>
                <p className="font-display text-base font-bold text-slate-900">3 Active</p>
              </div>
              <div className="space-y-0.5 border-l border-slate-100">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Need Support</span>
                <p className="font-display text-base font-bold text-rose-600">{studentCounts.needsAttention} Flagged</p>
              </div>
            </div>

            {/* 4. LEVEL 2: CLASSROOM SNAPSHOT & WHAT SHOULD I TEACH NEXT? */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Classroom Snapshot */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📊</span>
                  <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Classroom Snapshot
                  </h3>
                </div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">What the data shows:</p>
                <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    <span>Class average: <strong className="text-slate-900">84% in Mathematics</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A085]" />
                    <span>Attendance: <strong className="text-slate-900">96% this week</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span><strong className="text-slate-900">{studentCounts.needsAttention} students</strong> need concept support</span>
                  </li>
                </ul>
              </div>

              {/* What Should I Teach Next? */}
              <div className="p-5 rounded-2xl bg-[#FFF9F0] border border-[#F59E0B]/30 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                      Recommended Next Action
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Class 8A</span>
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
                    What Should I Teach Next?
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
                    <strong className="text-slate-900">Equivalent Fractions:</strong> Students need reinforcement on multiplying denominators before moving forward.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAiToolkitTab('exit_ticket');
                      setIsAiToolkitOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Plan Revision</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 5. LEVEL 2: STUDENT SUPPORT (Clean list of students) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Student Support Radar
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setActiveTab('students');
                  }}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  View Full Roster ({students.length}) &rarr;
                </button>
              </div>

              <div className="space-y-2.5">
                {students.map((s) => {
                  const rawStatus = (s as any).status?.toLowerCase().replace(/\s+/g, '_') || 'on_track';
                  const isAttention = rawStatus === 'needs_attention';
                  const isWatching = rawStatus === 'worth_watching';

                  return (
                    <div
                      key={s.studentId}
                      className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {(s.displayName || 'Student').split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{s.displayName || 'Student'}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isAttention
                                ? 'text-rose-700 bg-rose-50 border-rose-200'
                                : isWatching
                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            }`}
                          >
                            {isAttention ? 'Needs Attention' : isWatching ? 'Watching' : 'On Track'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentId(s.studentId || null)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                        >
                          View 360 &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuerySend(`Why does ${s.displayName || 'this student'} need attention?`)}
                          className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] font-bold text-xs border border-[#2563EB]/20 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Ask AI</span>
                          <span>✨</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. LEVEL 3: ATTENDANCE & HOMEWORK ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Attendance */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📅</span>
                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 uppercase">
                      Attendance
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    96% Today
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Class 8A: 4 of 4 logged present for morning session.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAttendanceModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Take Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuerySend('Explain Monday attendance trend for Class 8A')}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Explain Trend
                  </button>
                </div>
              </div>

              {/* Homework */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📖</span>
                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 uppercase">
                      Homework
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    3 Active
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Due this week: Mathematics Fractions Sheet &amp; Science Lab Report.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsHomeworkModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Review Homework
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHomeworkModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Create Homework
                  </button>
                </div>
              </div>
            </div>

            {/* 7. LEVEL 3: TODAY'S SCHEDULE */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">⏱️</span>
                  <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 uppercase">
                    Today&apos;s Schedule
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  Open Calendar &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#2563EB]">09:00 AM – 10:00 AM</span>
                  <h4 className="font-bold text-slate-900">Class 8A Science Lab</h4>
                  <p className="text-slate-500 text-[11px]">Lab Room 204</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#2563EB]">11:15 AM – 12:15 PM</span>
                  <h4 className="font-bold text-slate-900">Class 9B Physics</h4>
                  <p className="text-slate-500 text-[11px]">Room 302</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#F59E0B]">02:00 PM – 03:00 PM</span>
                  <h4 className="font-bold text-slate-900">PTM Parent Check-ins</h4>
                  <p className="text-slate-500 text-[11px]">Staff Room &amp; Digital</p>
                </div>
              </div>
            </div>

            {/* 8. LEVEL 3: ✨ TEACHING COPILOT (Calm, Contextual AI Entry Point) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#102A43] text-white shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-display text-sm sm:text-base font-bold text-white">
                      What do you need help with?
                    </h3>
                    <p className="text-xs text-white/70">
                      Ask about Class 8A or choose an action:
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAiToolkitTab('lesson');
                    setIsAiToolkitOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <span>✨ Teaching Copilot Studio</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl p-1.5 focus-within:bg-white focus-within:text-slate-900 transition-all">
                <input
                  type="text"
                  placeholder="Ask about Class 8A..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      handleQuerySend((e.target as HTMLInputElement).value.trim());
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-white focus:text-slate-900 placeholder-white/50 focus:placeholder-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                    if (input && input.value.trim()) {
                      handleQuerySend(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Ask &rarr;
                </button>
              </div>

              {/* 3 Contextual Suggestion Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuerySend('Which students need my attention today?')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 cursor-pointer flex items-center gap-1.5"
                >
                  <span>🎯</span>
                  <span>Who needs my attention?</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuerySend('What should I teach next?')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 cursor-pointer flex items-center gap-1.5"
                >
                  <span>📚</span>
                  <span>What should I teach next?</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuerySend('Draft a parent update for Class 8A')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 cursor-pointer flex items-center gap-1.5"
                >
                  <span>✉️</span>
                  <span>Draft a parent update</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: STUDENTS (CLASS ROSTER & 360 PROFILES)                */}
        {/* ============================================================ */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Students Roster 👨‍🎓
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Class {grade}{section} • {students.length} Total Students Enrolled
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📄</span>
                  <span>Print Report Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold tracking-wide transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>📋</span>
                  <span>Take Attendance</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name or roll..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                  {studentSearch && (
                    <button
                      onClick={() => setStudentSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Badges */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({studentCounts.total})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('needs_attention')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      statusFilter === 'needs_attention'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                    }`}
                  >
                    🔴 Needs Attention ({studentCounts.needsAttention})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('worth_watching')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      statusFilter === 'worth_watching'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                    }`}
                  >
                    🟡 Worth Watching ({studentCounts.worthWatching})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('on_track')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      statusFilter === 'on_track'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                    }`}
                  >
                    🟢 On Track ({studentCounts.onTrack})
                  </button>
                </div>
              </div>
            </div>

            {/* Students List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((st) => {
                const sName = st.displayName || 'Student';
                const photo = getPhotoUrl(sName);
                const rawStatus = (st as any).status || 'On Track';
                const statusStr = typeof rawStatus === 'string' ? rawStatus : 'On Track';
                const isNeedsAttention = statusStr.toLowerCase().includes('attention');
                const isWorthWatching = statusStr.toLowerCase().includes('watching');

                const statusBg = isNeedsAttention
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isWorthWatching
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                const statusDot = isNeedsAttention
                  ? 'bg-rose-500'
                  : isWorthWatching
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

                const initials = sName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                const totalAtt = st.attendance?.length || 0;
                const presentCount = st.attendance?.filter((a) => a.status === 'present').length || 0;
                const attPct = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 96;

                const totalHw = st.homework?.length || 0;
                const hwSub = st.homework?.filter((h) => h.isSubmitted).length || 0;
                const hwPct = totalHw > 0 ? Math.round((hwSub / totalHw) * 100) : 92;

                const parentInfo = PARENT_MAP[sName] || { parentName: 'Guardian', relationship: 'Parent' };

                return (
                  <div
                    key={st.studentId || sName}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Avatar & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {photo ? (
                            <img
                              src={photo}
                              alt={sName}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-600 text-white font-black text-sm flex items-center justify-center shadow-2xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <h3 className="font-display text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {sName}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Roll #{st.roll_number || '801'} • {parentInfo.parentName} ({parentInfo.relationship})
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border flex items-center gap-1.5 shrink-0 ${statusBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                          {statusStr}
                        </span>
                      </div>

                      {/* AI Status Explanation / Narration Snippet */}
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {(st as any).aiExplanation || `${sName} is currently performing well across all core subjects.`}
                      </p>

                      {/* Metrics Pill Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Attendance</span>
                          <span className="text-xs font-black text-slate-900">{attPct}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">HW Rate</span>
                          <span className="text-xs font-black text-slate-900">{hwPct}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(st.studentId || null)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-extrabold text-center transition-all shadow-2xs active:scale-98 cursor-pointer"
                      >
                        Open 360° Profile →
                      </button>
                      <button
                        type="button"
                        onClick={() => openParentChat(st.studentId, sName)}
                        className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer border border-indigo-200/60"
                        title={`Chat with ${parentInfo.parentName}`}
                      >
                        💬 Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredStudents.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200/80">
                <span className="text-3xl">🔍</span>
                <h3 className="font-display text-base font-extrabold text-slate-900">No students match your filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search keyword or switching the status filter back to "All".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStudentSearch('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CLASSES (OVERVIEW & MARKS)                            */}
        {/* ============================================================ */}
        {activeTab === 'classes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Classroom Management 📚
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Grade {grade} • Section {section} Classroom Overview
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMarksModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold tracking-wide transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>📊</span>
                  <span>Enter Marks & Exams</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Strength</span>
                <h3 className="font-display text-3xl font-black text-slate-900">{students.length}</h3>
                <p className="text-xs text-emerald-600 font-bold">100% active enrollment</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                <h3 className="font-display text-3xl font-black text-slate-900">96.4%</h3>
                <p className="text-xs text-emerald-600 font-bold">Above school benchmark (92%)</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Class Average</span>
                <h3 className="font-display text-3xl font-black text-slate-900">84.2%</h3>
                <p className="text-xs text-indigo-600 font-bold">Term 1 Assessment Avg</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-extrabold text-slate-900">Core Subject Breakdown</h3>
                <button
                  type="button"
                  onClick={() => setIsMarksModalOpen(true)}
                  className="text-xs font-extrabold text-indigo-600 hover:underline cursor-pointer"
                >
                  Manage Subject Grading →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { subject: 'Mathematics', teacher: 'Ananya Mehra', avg: '82%', status: 'Active' },
                  { subject: 'Science & Physics', teacher: 'Dr. R. Verma', avg: '88%', status: 'Active' },
                  { subject: 'English Literature', teacher: 'S. Sen', avg: '85%', status: 'Active' },
                  { subject: 'Social Studies', teacher: 'K. Deshmukh', avg: '81%', status: 'Active' },
                ].map((sub) => (
                  <div key={sub.subject} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-sm font-extrabold text-slate-900">{sub.subject}</h4>
                      <p className="text-xs text-slate-500 font-medium">{sub.teacher}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">{sub.avg}</span>
                      <button
                        type="button"
                        onClick={() => setIsMarksModalOpen(true)}
                        className="block text-[10px] text-indigo-600 font-bold uppercase hover:underline cursor-pointer"
                      >
                        Enter Marks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ASSIGNMENTS (HOMEWORK & TASKS)                         */}
        {/* ============================================================ */}
        {activeTab === 'assignments' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Assignments & Homework 📝
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Manage homework, grading, and draft new assignments with AI
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHomeworkModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold tracking-wide transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>✨</span>
                <span>Create AI Homework</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-display text-base font-extrabold text-slate-900">Current Homework Assignments</h3>
              <div className="space-y-3">
                {[
                  { title: 'Algebraic Expressions Practice Set 4', subject: 'Mathematics', dueDate: 'Tomorrow, 5:00 PM', submitted: '18/20 Submitted', badge: 'Active' },
                  { title: 'Newtonian Physics Lab Observations', subject: 'Science', dueDate: 'Friday, 11:59 PM', submitted: '14/20 Submitted', badge: 'Active' },
                  { title: 'Essay: The Industrial Revolution Impact', subject: 'Social Studies', dueDate: 'Monday, 9:00 AM', submitted: '6/20 Submitted', badge: 'Upcoming' },
                ].map((hw) => (
                  <div key={hw.title} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wide block">{hw.subject}</span>
                      <h4 className="font-display text-sm font-extrabold text-slate-900">{hw.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Due: {hw.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        {hw.submitted}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuerySend(`Summarize homework status for ${hw.title}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: ANALYTICS                                             */}
        {/* ============================================================ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Academic & Growth Analytics 📊
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Classroom intelligence trends, engagement signals, and grade distributions
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMarksModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold tracking-wide transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>📊</span>
                <span>Open Marks & Exams Hub</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SupportRadarWidget
                grade={grade}
                section={section}
                onAskWhy={(q) => handleQuerySend(q)}
                onSelectStudent={(id) => setSelectedStudentId(id)}
              />
              <AttendanceWidget
                grade={grade}
                section={section}
                onAskExplain={(q) => handleQuerySend(q)}
                onOpenTakeAttendance={() => setIsAttendanceModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: PARENTS (INTERACTIVE LIVE CHAT & COMMUNICATIONS)      */}
        {/* ============================================================ */}
        {activeTab === 'parents' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Parent Communications & Chat 💬
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Direct live messaging with parents, PTM scheduling & report sharing
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold tracking-wide transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>📄</span>
                  <span>Print Report Cards</span>
                </button>
              </div>
            </div>

            {/* Split Screen Parent Messaging Center */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Parent Contact List */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display text-sm font-extrabold text-slate-900">
                    Class 8A Parents ({students.length})
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    🟢 Online
                  </span>
                </div>

                <div className="space-y-2">
                  {students.map((st) => {
                    const sName = st.displayName || 'Student';
                    const sId = st.studentId || '';
                    const parent = PARENT_MAP[sName] || { parentName: 'Guardian', relationship: 'Parent', phone: '+91 90000 00000' };
                    const isSelected = activeParentTabStudentId === sId;
                    const photo = getPhotoUrl(sName);

                    return (
                      <button
                        key={sId || sName}
                        type="button"
                        onClick={() => setActiveParentTabStudentId(sId)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {photo ? (
                            <img
                              src={photo}
                              alt={sName}
                              className="w-10 h-10 rounded-xl object-cover border border-white/20"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                              {sName[0]}
                            </div>
                          )}
                          <div>
                            <h4 className={`font-display text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {parent.parentName}
                            </h4>
                            <p className={`text-[11px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {sName} ({parent.relationship})
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isSelected ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-600 border border-slate-200'}`}>
                          💬 Chat
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live TeacherChat Box */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs min-h-[480px] flex flex-col">
                <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-sm font-extrabold text-slate-900">
                      {PARENT_MAP[activeParentStudent?.displayName || '']?.parentName || 'Sunita Sharma'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Parent of {activeParentStudent?.displayName || 'Aarav Sharma'} · Class {grade}{section}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAiToolkitTab('parent_message');
                        setIsAiToolkitOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition border border-indigo-200/80 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>✨</span>
                      <span>Draft with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentId(activeParentStudent?.studentId || null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      360° Profile →
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <TeacherChat
                    studentId={activeParentStudent?.studentId || 'b1000000-0000-4000-8000-000000000001'}
                    studentName={activeParentStudent?.displayName || 'Aarav Sharma'}
                    parentName={PARENT_MAP[activeParentStudent?.displayName || '']?.parentName || 'Sunita Sharma'}
                    teacherName={displayName || 'Ananya Mehra'}
                    teacherId={teacherId}
                    onOpenAiDraft={() => {
                      setAiToolkitTab('parent_message');
                      setIsAiToolkitOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: CALENDAR                                              */}
        {/* ============================================================ */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Schedule & Calendar 📅
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Classroom timetable, exam periods, and upcoming events
              </p>
            </div>

            <div className="max-w-2xl">
              <ScheduleCalendarWidget />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: SETTINGS                                              */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Teacher Preferences & Settings ⚙️
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Account information, notifications, and classroom parameters
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 max-w-xl">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">Class Teacher</span>
                  <span className="font-extrabold text-slate-900">{displayName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">Assigned Class</span>
                  <span className="font-extrabold text-slate-900">Grade {grade}{section}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">Academic Year</span>
                  <span className="font-extrabold text-slate-900">2026 - 2027</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-bold">AI Assistant</span>
                  <span className="font-extrabold text-emerald-600">SchoolGPT Ambient Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Take Attendance Full-Screen Modal */}
      <TakeAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        initialStudents={attendanceRoster}
        className={`Grade ${grade}${section}`}
      />

      {/* AI Homework Draft & Publish Modal */}
      <AiHomeworkModal
        isOpen={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        defaultGrade={grade}
        defaultSection={section}
      />

      {/* Student 360 Viewport Modal */}
      {selectedStudentId && (
        <Student360Modal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}

      {/* Direct Parent Chat Modal */}
      {chattingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full h-[600px] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="font-display text-base font-black text-slate-900">
                  💬 Chat with Parent ({PARENT_MAP[chattingStudent.name]?.parentName || 'Parent'})
                </h3>
                <p className="text-xs text-slate-400 font-medium">Student: {chattingStudent.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setChattingStudent(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TeacherChat
                studentId={chattingStudent.id}
                studentName={chattingStudent.name}
                teacherId={teacherId}
              />
            </div>
          </div>
        </div>
      )}

      {/* School Pulse PDF Generator Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display text-lg font-black text-slate-900">📄 Generate School Pulse Reports</h3>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <SchoolPulsePDF students={pulsePdfStudents} teacherId={teacherId} />
          </div>
        </div>
      )}

      {/* Teacher Marks & Gradebook Modal */}
      {isMarksModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display text-lg font-black text-slate-900">📊 Gradebook & Exams Hub</h3>
              <button
                type="button"
                onClick={() => setIsMarksModalOpen(false)}
                className="p-1 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <TeacherMarksPanel teacherId={teacherId} />
          </div>
        </div>
      )}

      {/* Teacher AI Toolkit Modal (Lesson Planner, Differentiation, Parent Messages) */}
      <TeacherAiToolkitModal
        isOpen={isAiToolkitOpen}
        onClose={() => setIsAiToolkitOpen(false)}
        defaultGrade={grade}
        defaultSection={section}
        initialTab={aiToolkitTab}
        initialStudentName={activeParentStudent?.displayName || 'Aarav Sharma'}
        initialParentName={PARENT_MAP[activeParentStudent?.displayName || '']?.parentName || 'Sunita Sharma'}
      />

      {/* Floating Spotlight Command Palette */}
      <SchoolGPTSpotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSelectPrompt={(p) => handleQuerySend(p)}
      />

      {/* Floating Assistant Drawer */}
      <SchoolGPTDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        screenName="Teacher Workspace"
      />
    </div>
  );
}
