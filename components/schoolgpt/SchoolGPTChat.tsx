'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askSchoolGPTAction } from '@/app/actions/schoolgptActions';
import SchoolGPTMessage from './SchoolGPTMessage';
import type { SchoolGPTRole, SchoolGPTMessage as SchoolGPTMessageType } from '@/lib/schoolgpt/types';

interface SchoolGPTChatProps {
  role: SchoolGPTRole;
  studentId?: string;
  teacherId?: string;
  childrenIds?: string[];
  classGrade?: string;
  classSection?: string;
  placeholder?: string;
}

// 6 Lightweight Suggestion Cards (Design System 2.0: No mode badges, clean, pastel icons)
const suggestedQuestions: Record<SchoolGPTRole, { title: string; prompt: string; icon: string; bg: string }[]> = {
  teacher: [
    { title: 'Support Radar', prompt: 'Which students need support today?', icon: '🎯', bg: 'bg-rose-50 border-rose-100 text-rose-700' },
    { title: 'Student Report', prompt: "Show Aarav's complete performance report.", icon: '👤', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
    { title: 'Attendance Summary', prompt: "Summarize today's classroom attendance.", icon: '📊', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { title: 'Parent PTM Draft', prompt: 'Generate PTM summary update for parents.', icon: '✉️', bg: 'bg-purple-50 border-purple-100 text-purple-700' },
    { title: 'Term Growth', prompt: 'Compare Term 1 and Term 3 performance.', icon: '📈', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
    { title: 'Class Timeline', prompt: "What happened today in Class 8A?", icon: '⏱️', bg: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
  ],
  parent: [
    { title: 'Child Performance', prompt: "Show Aarav's academic report.", icon: '👤', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
    { title: 'Safety & Arrival', prompt: 'Was my child safe today? Show arrival logs.', icon: '🛡️', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { title: 'Attendance Record', prompt: "What is my child's attendance rate?", icon: '📈', bg: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
    { title: 'Homework Status', prompt: "Summarize pending homework for this week.", icon: '📅', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
    { title: 'Teacher Updates', prompt: 'Show recent notes from class teacher.', icon: '💬', bg: 'bg-purple-50 border-purple-100 text-purple-700' },
    { title: 'Bus Location', prompt: 'Where is the school bus currently?', icon: '🚌', bg: 'bg-rose-50 border-rose-100 text-rose-700' },
  ],
  student: [
    { title: 'My Performance', prompt: 'Show my academic progress summary.', icon: '📊', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
    { title: "Today's Timetable", prompt: "What is today's schedule and homework?", icon: '⏱️', bg: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
    { title: 'Revision Helper', prompt: 'Give revision notes for Physics Chapter 4.', icon: '📚', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { title: 'Homework Deadlines', prompt: 'Which homework is due tomorrow?', icon: '📅', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
    { title: 'Library Dues', prompt: 'Which books do I have issued from library?', icon: '📖', bg: 'bg-purple-50 border-purple-100 text-purple-700' },
    { title: 'School Events', prompt: 'List upcoming school sports and club events.', icon: '🏆', bg: 'bg-rose-50 border-rose-100 text-rose-700' },
  ],
  admin: [
    { title: 'School Attendance', prompt: 'Show school-wide attendance trends today.', icon: '📊', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { title: 'Teacher Workload', prompt: 'Show teacher period allocations and free slots.', icon: '👥', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
    { title: 'Safety Audits', prompt: 'Show unresolved gate alerts and bus tracking.', icon: '🚨', bg: 'bg-rose-50 border-rose-100 text-rose-700' },
    { title: 'Term Comparison', prompt: 'Compare Term 1 and Term 3 across all grades.', icon: '📈', bg: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
    { title: 'Campus Policies', prompt: 'What are the current campus gate policies?', icon: '📜', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
    { title: 'Fee Clearance', prompt: 'Show fee collection summary for Q3.', icon: '💳', bg: 'bg-purple-50 border-purple-100 text-purple-700' },
  ],
  driver: [
    { title: 'Route Schedule', prompt: 'Show my bus route stops and timings.', icon: '🚌', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
    { title: 'Safety Protocol', prompt: 'Show speed limits and emergency protocols.', icon: '⚠️', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
    { title: 'Passenger Roster', prompt: 'Show assigned student list for Route #4.', icon: '📋', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { title: 'Delay Notice', prompt: 'Send traffic delay update to transport team.', icon: '📢', bg: 'bg-purple-50 border-purple-100 text-purple-700' },
  ],
  gate: [
    { title: 'Gate Scan Rules', prompt: 'Show gate visitor and QR scan policy.', icon: '🔑', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { title: 'Today Scan Log', prompt: 'Show today gate entry count and status.', icon: '⏱️', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
    { title: 'Security Alert', prompt: 'Report unverified visitor at main gate.', icon: '🚨', bg: 'bg-rose-50 border-rose-100 text-rose-700' },
    { title: 'Bus Pickup Pass', prompt: 'Verify parent pickup authorization.', icon: '🎫', bg: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
  ],
  vendor: [
    { title: 'Campus Rules', prompt: 'Show canteen health and vendor rules.', icon: '📄', bg: 'bg-sky-50 border-sky-100 text-sky-700' },
    { title: 'School Calendar', prompt: 'Show upcoming school holidays.', icon: '🗓️', bg: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
    { title: 'Menu Clearance', prompt: 'Show approved canteen menu list.', icon: '🍎', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { title: 'POS Summary', prompt: 'Summarize today coin redemption count.', icon: '🪙', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
  ],
};

const quickActions = [
  'Compare with Class Average',
  'Attendance Summary',
  'Overdue Homework',
  'Student Profile',
  'Generate PTM',
  'Schedule Check-in',
];

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function SchoolGPTChat({
  role,
  studentId,
  teacherId,
  childrenIds,
  classGrade,
  classSection,
}: SchoolGPTChatProps) {
  const [messages, setMessages] = useState<SchoolGPTMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(question: string) {
    const q = question.trim();
    if (!q || isLoading) return;

    setLastQuestion(q);
    setHasError(false);

    const userMsg: SchoolGPTMessageType = {
      id: generateId(),
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const formattedHistory = messages.map((m) => ({ role: m.role, content: m.content }));

      const response = await askSchoolGPTAction({
        question: q,
        history: formattedHistory,
        role,
        studentId,
        teacherId,
        childrenIds,
        classGrade,
        classSection,
      });

      const assistantMsg: SchoolGPTMessageType = {
        id: generateId(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources || ['School Telemetry Database', 'Official School Portal'],
        suggestedFollowUps: response.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[SchoolGPT Chat] Error:', err);
      setHasError(true);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, I encountered an error retrieving data. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  const cards = suggestedQuestions[role] || suggestedQuestions.teacher;
  const showHero = messages.length === 0;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 font-body min-h-[85vh] flex flex-col justify-between space-y-8">
      {/* ── 1. HERO SECTION (Clean Greeting, Zero Tech Clutter) ── */}
      {showHero && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 pt-4 sm:pt-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Good Morning, Priya 👋
          </h1>
          <p className="font-body text-sm sm:text-base text-slate-500 font-medium max-w-md mx-auto">
            How can I help you today?
          </p>
        </motion.div>
      )}

      {/* ── 2. AI SEARCH FOCAL POINT ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto space-y-3"
      >
        <div className="relative flex items-center bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-slate-900 transition-all p-2 sm:p-2.5">
          <span className="pl-4 text-slate-400 text-lg">🔍</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'SchoolGPT is compiling telemetry answer…' : 'Ask about a student, attendance, homework, or PTM...'}
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2 sm:py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none font-medium"
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 sm:py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-30 shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>Ask</span>
            <span className="text-xs">✨</span>
          </button>
        </div>

        {/* Subtle Category Action Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 mr-1">Shortcuts:</span>
          {['Ask', 'Analyze', 'Compare', 'Create'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setInput(`${tag} `)}
              className="px-2.5 py-1 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 text-[11px] font-bold transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── 3. SUGGESTED QUESTIONS (6 Lightweight Cards, Zero Badges) ── */}
      {showHero && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 w-full max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
              Suggested Questions
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Select to analyze</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {cards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => handleSend(card.prompt)}
                className="p-5 bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 rounded-3xl text-left transition-all shadow-2xs hover:shadow-xs group flex flex-col justify-between gap-3 active:scale-95"
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg border ${card.bg}`}>
                    {card.icon}
                  </div>
                  <span className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all text-sm">
                    &rarr;
                  </span>
                </div>
                <div>
                  <h4 className="font-display text-sm font-extrabold text-slate-900">{card.title}</h4>
                  <p className="font-body text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">{card.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── 4. QUICK ACTIONS BAR (Single Horizontal Scrollable Row) ── */}
      {showHero && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-4xl mx-auto pt-2"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 shrink-0 mr-1">
              Quick Actions:
            </span>
            {quickActions.map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => handleSend(act)}
                className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all shrink-0 active:scale-95 shadow-2xs"
              >
                {act} &rarr;
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── 5. AI RESPONSE STREAM (Clean Apple/Notion AI Sectioned Containers) ── */}
      <div className="w-full max-w-4xl mx-auto space-y-6 flex-1">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const prevQuery = idx > 0 && messages[idx - 1].role === 'user' ? messages[idx - 1].content : '';
            return (
              <SchoolGPTMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                userQuery={prevQuery}
                sources={msg.sources}
              />
            );
          })}
        </AnimatePresence>

        {/* Calm Animated Loading Indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start py-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-medium text-slate-600">
                SchoolGPT is evaluating records and generating answer…
              </span>
            </div>
          </motion.div>
        )}

        {hasError && lastQuestion && (
          <div className="flex justify-start pt-2">
            <button
              type="button"
              onClick={() => handleSend(lastQuestion)}
              className="flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 active:scale-95"
            >
              <span>🔄 Retry question</span>
            </button>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
