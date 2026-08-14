'use client';

import { useState } from 'react';
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
import { useAmbientAICore } from '../schoolgpt/core/AmbientIntelligenceCore';
import { useContextRegistry } from '../schoolgpt/context/ContextRegistry';

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

interface TeacherWorkspaceV2Props {
  readonly teacherName?: string;
}

export default function TeacherWorkspaceV2({ teacherName }: TeacherWorkspaceV2Props) {
  const [activeTab, setActiveTab] = useState('today');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { ask, isLoading } = useAmbientAICore();
  const { setContext } = useContextRegistry();

  const handleQuerySend = (query: string) => {
    ask(query);
    setIsDrawerOpen(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'attendance') setContext({ module: 'attendance' });
    else if (tab === 'assignments') setContext({ module: 'homework' });
    else if (tab === 'students') setContext({ module: 'general' });
  };

  const displayName = teacherName || 'Teacher';

  return (
    <div className="flex min-h-screen bg-slate-50 font-body text-slate-900 overflow-x-hidden">
      {/* Left Task-Oriented Sidebar */}
      <TeacherSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        teacherName={displayName}
      />

      {/* Main Hero Workspace */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
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
                  className="p-4 bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-3xl text-left transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between gap-3 active:scale-95"
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
                className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shrink-0 active:scale-95 shadow-2xs"
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
            <span className="text-xs font-medium text-slate-400">Class 8A Workspace</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SupportRadarWidget
              onAskWhy={(q) => handleQuerySend(q)}
              onSelectStudent={(id) => setSelectedStudentId(id)}
            />
            <AttendanceWidget onAskExplain={(q) => handleQuerySend(q)} />
            <HomeworkWidget onDraftReminder={(q) => handleQuerySend(q)} />
            <ScheduleCalendarWidget />
          </div>
        </div>
      </main>

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
