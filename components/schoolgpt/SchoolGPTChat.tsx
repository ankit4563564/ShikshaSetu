'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askSchoolGPTAction } from '@/app/actions/schoolgptActions';
import SchoolGPTMessage from './SchoolGPTMessage';
import { SCHOOLGPT_HISTORY } from '@/lib/demo/schoolUniverse';
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

const suggestedQuestions: Record<SchoolGPTRole, { title: string; prompt: string; icon: string }[]> = {
  student: [
    { title: 'Diagnostic Brief', prompt: 'What is my current attendance and academic standing?', icon: '📊' },
    { title: 'Safety Journey', prompt: 'Show my safety journey, gate entry, and bus arrival today.', icon: '🛡️' },
    { title: 'Robotics & Clubs', prompt: 'When is the next Robotics Club meeting and room details?', icon: '🤖' },
    { title: 'Timetable & Prep', prompt: 'Show tomorrow\'s timetable and homework submission deadlines.', icon: '📅' },
  ],
  parent: [
    { title: 'Safety & Transport', prompt: 'Was my child safe today? Show bus telemetry and gate scan timestamps.', icon: '🛡️' },
    { title: 'Guardian Journey', prompt: 'Show Guardian Journey timeline of homework, attendance and teacher notes.', icon: '💚' },
    { title: 'Attendance Health', prompt: 'What is my child\'s attendance percentage and monthly trend?', icon: '📈' },
    { title: 'Teacher Updates', prompt: 'Summarize recent messages and office hours for Ms. Ananya Mehra.', icon: '💬' },
  ],
  teacher: [
    { title: 'Support Radar', prompt: 'Which students need academic or emotional check-ins today?', icon: '🎯' },
    { title: 'Arrival Safety', prompt: 'Show today\'s arrival safety checks and unexcused absences.', icon: '⚡' },
    { title: 'Class Growth', prompt: 'Show class attendance and math mastery trends for Term 3.', icon: '📈' },
    { title: 'Remediation Sprint', prompt: 'Generate a 10-minute revision plan for Science Forces & Motion.', icon: '🧪' },
  ],
  admin: [
    { title: 'Safety Audits', prompt: 'Show unresolved safety alerts and gate entry logs.', icon: '🚨' },
    { title: 'School Attendance', prompt: 'Show school-wide attendance trends across Class 6 to 12.', icon: '📊' },
    { title: 'Upcoming Events', prompt: 'List upcoming school events, exams, and holiday schedules.', icon: '📅' },
    { title: 'Policy Guidelines', prompt: 'Summarize active campus safety and moderation policies.', icon: '📜' },
  ],
  driver: [
    { title: 'Route Telemetry', prompt: 'Show my bus route stops, student pickup status, and ETA.', icon: '🚌' },
    { title: 'Speed & Safety', prompt: 'What is the speed limit and safety protocol for Saket Route #4?', icon: '⚠️' },
  ],
  gate: [
    { title: 'Entry Verification', prompt: 'Show gate rules, student RFID scan policies, and visitor logs.', icon: '🔑' },
    { title: 'Campus Alerts', prompt: 'What announcements or security notices exist for today?', icon: '📢' },
  ],
  vendor: [
    { title: 'Vendor Guidelines', prompt: 'Show active campus vendor entry rules and payment schedules.', icon: '📄' },
    { title: 'School Calendar', prompt: 'List school holidays and non-operational campus dates.', icon: '🗓️' },
  ],
};

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
  placeholder = 'Ask SchoolGPT anything…',
}: SchoolGPTChatProps) {
  const initialMessages: SchoolGPTMessageType[] = role === 'student'
    ? [
        ...SCHOOLGPT_HISTORY.map((msg, i) => ({
          id: `demo-${i}`,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: Date.now() - (SCHOOLGPT_HISTORY.length - i) * 60000,
          sources: ['School Telemetry Database', 'Attendance Logs', 'Grade Portal'],
          suggestedFollowUps: ['Show detailed Math quiz breakdown', 'Verify bus arrival timestamp'],
        })),
      ]
    : [
        {
          id: 'welcome',
          role: 'assistant',
          content:
            'SchoolGPT AI Education Workspace is active. Ask any question to retrieve real-time attendance, homework, safety telemetry, academic growth, and class diagnostic summaries.',
          timestamp: Date.now(),
          sources: ['School Core System', 'Live Telemetry API'],
          suggestedFollowUps: ['Show class diagnostic summary', 'List students needing support'],
        },
      ];

  const [messages, setMessages] = useState<SchoolGPTMessageType[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(question: string) {
    const q = question.trim();
    if (!q || isLoading) return;

    setShowSuggestions(false);
    setLastQuestion(q);
    setHasError(false);

    const userMsg: SchoolGPTMessageType = {
      id: generateId(),
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => {
      const filtered = prev.filter((m) => m.content !== 'Sorry, I encountered an error. Please try again.');
      return [...filtered, userMsg] as SchoolGPTMessageType[];
    });

    setInput('');
    setIsLoading(true);

    try {
      const formattedHistory = messages
        .filter((m) => m.role !== 'assistant' || (m.content && !m.content.includes('encountered an error')))
        .map((m) => ({ role: m.role, content: m.content }));

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
        suggestedFollowUps: response.suggestedFollowUps || ['Ask for further details', 'Export summary report'],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
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

  const currentSuggested = suggestedQuestions[role] || suggestedQuestions.student;

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="font-display text-sm font-extrabold text-slate-900">
              SchoolGPT Education Workspace
            </h3>
            <p className="font-body text-[11px] text-slate-500 font-medium">
              Perplexity &amp; Claude Artifacts-Grade AI Intelligence Operating System
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
          ● Live Telemetry Active
        </span>
      </div>

      {/* Suggested Prompt Cards Grid (Displayed Before Conversation) */}
      {showSuggestions && messages.length <= 2 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
            Suggested Intelligence Queries
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentSuggested.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => handleSend(card.prompt)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 rounded-2xl text-left transition-all shadow-2xs group flex items-start gap-2.5 active:scale-95"
              >
                <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">{card.icon}</span>
                <div>
                  <h5 className="font-display text-xs font-extrabold text-slate-900">{card.title}</h5>
                  <p className="font-body text-[11px] text-slate-500 line-clamp-1 mt-0.5">{card.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Conversation Workspace Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <SchoolGPTMessage key={msg.id} role={msg.role} content={msg.content} sources={msg.sources} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start py-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                SchoolGPT is retrieving real-time school telemetry…
              </span>
            </div>
          </motion.div>
        )}

        {/* Suggested Follow-up Actions */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].suggestedFollowUps && (
          <div className="flex flex-wrap gap-2 pt-1 pl-12">
            {messages[messages.length - 1].suggestedFollowUps?.map((actionText) => (
              <button
                key={actionText}
                type="button"
                onClick={() => handleSend(actionText)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs transition-all active:scale-95"
              >
                <span>💡</span> {actionText}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {hasError && lastQuestion && (
        <div className="flex justify-start px-1 pb-2">
          <button
            type="button"
            onClick={() => handleSend(lastQuestion)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 active:scale-95"
          >
            <span>🔄 Retry query</span>
          </button>
        </div>
      )}

      {/* Query Bar */}
      <div className="mt-auto border-t border-slate-200/80 pt-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Retrieving school telemetry…' : placeholder}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:bg-white font-medium"
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-xs sm:text-sm font-extrabold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-40 shadow-xs"
          >
            Send ✨
          </button>
        </div>
      </div>
    </div>
  );
}
