'use client';

import { useState, useMemo } from 'react';
import TeacherSidebar from './TeacherSidebar';
import TodaysFocusBar from './TodaysFocusBar';
import PersistentAISearch from './PersistentAISearch';
import SupportRadarWidget from './widgets/SupportRadarWidget';
import AttendanceWidget from './widgets/AttendanceWidget';
import HomeworkWidget from './widgets/HomeworkWidget';
import ScheduleCalendarWidget from './widgets/ScheduleCalendarWidget';
import SchoolGPTSpotlight from '../schoolgpt/SchoolGPTSpotlight';
import SchoolGPTDrawer from '../schoolgpt/SchoolGPTDrawer';
import Student360Modal from './Student360Modal';
import AiHomeworkModal from './AiHomeworkModal';
import { useAmbientAICore } from '../schoolgpt/core/AmbientIntelligenceCore';
import { useContextRegistry } from '../schoolgpt/context/ContextRegistry';
import { TakeAttendanceModal } from './TakeAttendanceModal';
import type { TeacherClassContext } from '@/app/teacher/page';
import type { AttendanceRosterStudent } from '@/lib/attendance/types';

const suggestedCards = [
  { title: 'Support Radar', prompt: 'Which students need support today?', icon: '🎯', bg: 'bg-rose-50 border-rose-100 text-rose-700' },
  { title: 'Student Report', prompt: 'Show complete academic report for student needing support.', icon: '👤', bg: 'bg-purple-50 border-purple-100 text-purple-700' },
  { title: 'Class Performance', prompt: 'How is my class performing this week?', icon: '📊', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
  { title: 'Attendance Summary', prompt: "Summarize today's attendance.", icon: '📅', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  { title: 'Homework Today', prompt: "What's the homework for today?", icon: '📖', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
  { title: 'PTM Draft', prompt: "Generate PTM summary for parent update.", icon: '✉️', bg: 'bg-pink-50 border-pink-100 text-pink-700' },
];

const quickActions = [
  'Compare with Class Average',
  'View Attendance',
  'Open Homework',
  'Generate Parent Summary',
  'Schedule Check-in',
  'Open Student Profile',
];

const getPhotoUrl = (name: string): string | null => {
  const lower = name.toLowerCase();
  if (lower.includes('aarav')) return '/aarav.png';
  if (lower.includes('priya')) return '/priya.png';
  if (lower.includes('rohan')) return '/rohan.png';
  if (lower.includes('ananya')) return '/ananya.png';
  if (lower.includes('kabir')) return '/kabir.png';
  return null;
};

interface TeacherWorkspaceV2Props {
  readonly classContext: TeacherClassContext;
}

export default function TeacherWorkspaceV2({ classContext }: TeacherWorkspaceV2Props) {
  const [activeTab, setActiveTab] = useState('today');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_attention' | 'worth_watching' | 'on_track'>('all');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { ask, isLoading } = useAmbientAICore();
  const { setContext } = useContextRegistry();

  const displayName = classContext.teacherName;
  const { grade, section, students } = classContext;

  const attendanceRoster: AttendanceRosterStudent[] = students.map((s) => ({
    studentId: s.studentId,
    displayName: s.displayName,
    rollNumber: s.roll_number || '',
    currentStatus: 'present',
  }));

  const handleQuerySend = (query: string) => {
    if (query === 'View Attendance') {
      setIsAttendanceModalOpen(true);
      return;
    }
    if (query === 'Open Homework' || query.includes('homework')) {
      setIsHomeworkModalOpen(true);
      return;
    }
    ask(query);
    setIsDrawerOpen(true);
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
    }
  };

  // Filtered student list for the Students tab
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = s.displayName.toLowerCase().includes(studentSearch.toLowerCase()) ||
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

  return (
    <div className="flex min-h-screen bg-slate-50 font-body text-slate-900 overflow-x-hidden">
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
        {/* TAB 1: TODAY (DEFAULT HERO VIEW)                             */}
        {/* ============================================================ */}
        {activeTab === 'today' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Greeting */}
            <div className="space-y-1">
              <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Good morning, {displayName} 👋
              </h1>
              <p className="text-sm font-medium text-slate-500">How can I help you today?</p>
            </div>

            {/* Today's Focus Priorities Bar */}
            <TodaysFocusBar onSelectItem={(item) => handleQuerySend(`Tell me more about: ${item}`)} />

            {/* Persistent Mockup AI Search Anchor */}
            <div className="space-y-4">
              <PersistentAISearch onSend={handleQuerySend} isLoading={isLoading} />

              {/* 6 Adaptive Suggested Prompt Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
                    ✨ Suggested for you
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Select to analyze</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {suggestedCards.map((card) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => handleQuerySend(card.prompt)}
                      className="p-4 bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-3xl text-left transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between gap-3 active:scale-95 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base border shrink-0 ${card.bg}`}>
                          {card.icon}
                        </div>
                        <div>
                          <h4 className="font-display text-xs sm:text-sm font-extrabold text-slate-900">{card.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{card.prompt}</p>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">&rarr;</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 shrink-0 mr-1">
                  ⚡ Quick actions:
                </span>
                {quickActions.map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => handleQuerySend(act)}
                    className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shrink-0 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    {act} &rarr;
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Live Dashboard Grid */}
            <div className="space-y-4 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold text-slate-900">Live Classroom Dashboard</h2>
                <span className="text-xs font-medium text-slate-400">Class {grade}{section} Workspace</span>
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
                <HomeworkWidget
                  grade={grade}
                  section={section}
                  onDraftReminder={(q) => handleQuerySend(q)}
                  onOpenCreateHomework={() => setIsHomeworkModalOpen(true)}
                />
                <ScheduleCalendarWidget />
              </div>
            </div>
          </div>
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
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
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
                const photo = getPhotoUrl(st.displayName);
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

                const initials = st.displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                // Attendance calculation
                const totalAtt = st.attendance?.length || 0;
                const presentCount = st.attendance?.filter((a) => a.status === 'present').length || 0;
                const attPct = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 96;

                // Homework calculation
                const totalHw = st.homework?.length || 0;
                const hwSub = st.homework?.filter((h) => h.isSubmitted).length || 0;
                const hwPct = totalHw > 0 ? Math.round((hwSub / totalHw) * 100) : 92;

                return (
                  <div
                    key={st.studentId}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Avatar & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {photo ? (
                            <img
                              src={photo}
                              alt={st.displayName}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-600 text-white font-black text-sm flex items-center justify-center shadow-2xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <h3 className="font-display text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {st.displayName}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Roll #{st.roll_number || '801'} • {st.house || 'Ruby'} House
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
                        {(st as any).aiExplanation || `${st.displayName} is currently performing well across all core subjects.`}
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
                        onClick={() => setSelectedStudentId(st.studentId)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-extrabold text-center transition-all shadow-2xs active:scale-98 cursor-pointer"
                      >
                        Open 360° Profile →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuerySend(`Give me a complete academic analysis of ${st.displayName}`)}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        title="Analyze with SchoolGPT"
                      >
                        ✨
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
        {/* TAB 3: CLASSES (OVERVIEW & SUBJECTS)                         */}
        {/* ============================================================ */}
        {activeTab === 'classes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Classroom Management 📚
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Grade {grade} • Section {section} Classroom Overview
              </p>
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
              <h3 className="font-display text-base font-extrabold text-slate-900">Core Subject Breakdown</h3>
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
                      <span className="block text-[10px] text-emerald-600 font-bold uppercase">{sub.status}</span>
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
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Academic & Growth Analytics 📊
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Classroom intelligence trends, engagement signals, and grade distributions
              </p>
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
        {/* TAB 6: PARENTS                                               */}
        {/* ============================================================ */}
        {activeTab === 'parents' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Parent Communications 💬
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                PTM schedules, progress updates, and guardian check-ins
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-display text-base font-extrabold text-slate-900">Upcoming Parent Meetings & Updates</h3>
              <div className="space-y-3">
                {[
                  { parent: 'Sunita Sharma', child: 'Aarav Sharma', topic: 'Academic Acceleration & Olympiad Prep', time: 'Today at 2:00 PM', status: 'Scheduled' },
                  { parent: 'Rajesh Patel', child: 'Priya Patel', topic: 'Homework Support & Science Tutoring', time: 'Tomorrow at 4:30 PM', status: 'Pending' },
                  { parent: 'Gurpreet Singh', child: 'Rohan Singh', topic: 'Attendance & Wellness Follow-up', time: 'Friday at 3:00 PM', status: 'Scheduled' },
                ].map((ptm) => (
                  <div key={ptm.parent} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-display text-sm font-extrabold text-slate-900">{ptm.parent} ({ptm.child})</h4>
                      <p className="text-xs text-slate-600 font-medium">{ptm.topic}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1">⏰ {ptm.time}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuerySend(`Draft a PTM meeting brief for ${ptm.parent} regarding ${ptm.child}`)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Draft Brief ✨
                    </button>
                  </div>
                ))}
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
