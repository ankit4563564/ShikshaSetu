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

const suggestedQuestions: Record<SchoolGPTRole, { title: string; prompt: string; icon: string; modeTag: string }[]> = {
  teacher: [
    { title: 'Support Radar', prompt: 'Which students need support today?', icon: '🎯', modeTag: 'Action Mode' },
    { title: 'Student Report', prompt: 'Show Aarav\'s complete report.', icon: '👤', modeTag: 'Student Report Mode' },
    { title: 'Class Briefing', prompt: 'Summarize today\'s classroom.', icon: '📊', modeTag: 'Class Analytics Mode' },
    { title: 'Term Comparison', prompt: 'Compare this term with last term.', icon: '📈', modeTag: 'Comparison Mode' },
    { title: 'Today\'s Timeline', prompt: 'What happened today?', icon: '⏱️', modeTag: 'Timeline Mode' },
    { title: 'PTM Summary', prompt: 'Generate PTM summary update for Aarav\'s parent.', icon: '✉️', modeTag: 'Parent Summary Mode' },
  ],
  parent: [
    { title: 'Child Report', prompt: 'Show Aarav\'s complete report.', icon: '👤', modeTag: 'Student Report Mode' },
    { title: 'Safety Journey', prompt: 'Was my child safe today? Show arrival telemetry.', icon: '🛡️', modeTag: 'Timeline Mode' },
    { title: 'Attendance Health', prompt: 'What is my child\'s attendance percentage?', icon: '📈', modeTag: 'Class Analytics Mode' },
    { title: 'Teacher Updates', prompt: 'Summarize recent messages from Ms. Ananya Mehra.', icon: '💬', modeTag: 'Action Mode' },
  ],
  student: [
    { title: 'My Performance', prompt: 'Show my complete academic report.', icon: '📊', modeTag: 'Student Report Mode' },
    { title: 'Today\'s Timeline', prompt: 'What happened today in my timetable?', icon: '⏱️', modeTag: 'Timeline Mode' },
    { title: 'Robotics & Clubs', prompt: 'When is the next Robotics Club meeting?', icon: '🤖', modeTag: 'Search Mode' },
    { title: 'Homework Status', prompt: 'Show my homework submission status.', icon: '📅', modeTag: 'Action Mode' },
  ],
  admin: [
    { title: 'Safety Audits', prompt: 'Show unresolved safety alerts and gate entry logs.', icon: '🚨', modeTag: 'Action Mode' },
    { title: 'School Attendance', prompt: 'Show school-wide attendance trends across Class 6 to 12.', icon: '📊', modeTag: 'Class Analytics Mode' },
    { title: 'Term Growth', prompt: 'Compare Term 1 and Term 3 across all grades.', icon: '📈', modeTag: 'Comparison Mode' },
    { title: 'School Policies', prompt: 'What is the school uniform and gate policy?', icon: '📜', modeTag: 'Search Mode' },
  ],
  driver: [
    { title: 'Route Stops', prompt: 'Show my bus route stops and ETA.', icon: '🚌', modeTag: 'Timeline Mode' },
    { title: 'Safety Protocol', prompt: 'What is the speed limit for Saket Route #4?', icon: '⚠️', modeTag: 'Search Mode' },
  ],
  gate: [
    { title: 'Entry Verification', prompt: 'Show gate rules and entry policies.', icon: '🔑', modeTag: 'Search Mode' },
    { title: 'Today\'s Timeline', prompt: 'Show today\'s gate scan timeline.', icon: '⏱️', modeTag: 'Timeline Mode' },
  ],
  vendor: [
    { title: 'Active Rules', prompt: 'Show active campus vendor policies.', icon: '📄', modeTag: 'Search Mode' },
    { title: 'School Calendar', prompt: 'List school calendar holidays.', icon: '🗓️', modeTag: 'Search Mode' },
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
            'SchoolGPT Adaptive AI Education Operating System is active. Tap any query card or ask a custom question to render real-time student reports, class analytics, side-by-side term comparisons, or daily timelines.',
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
        suggestedFollowUps: response.suggestedFollowUps || ['Compare with Class Average', 'Open Student Profile'],
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
    <div className="flex h-full flex-col justify-between space-y-4 font-body">
      {/* Workspace Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-display text-sm font-extrabold text-slate-900">
              SchoolGPT Adaptive AI Workspace
            </h3>
            <p className="font-body text-[11px] text-slate-500 font-medium">
              Apple &amp; Perplexity-Grade Adaptive AI Response Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono">
            ● 7 Response Modes Active
          </span>
        </div>
      </div>

      {/* PROACTIVE AI WORKSPACE HOME SCREEN (BEFORE CONVERSATION) */}
      {showSuggestions && messages.length <= 2 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Popular Adaptive Intelligence Queries
            </span>
            <span className="text-[10px] font-bold text-slate-500">Tap to render UI layout</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentSuggested.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => handleSend(card.prompt)}
                className="p-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:border-slate-300 rounded-2xl text-left transition-all shadow-2xs group flex flex-col justify-between gap-3 active:scale-95"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{card.icon}</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-full font-mono font-bold text-[9px] uppercase tracking-wider">
                    {card.modeTag}
                  </span>
                </div>
                <div>
                  <h5 className="font-display text-xs font-extrabold text-slate-900">{card.title}</h5>
                  <p className="font-body text-[11px] text-slate-500 line-clamp-1 mt-0.5">{card.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Conversation Stream & Adaptive Cards */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const previousUserMessage = idx > 0 && messages[idx - 1].role === 'user' ? messages[idx - 1].content : '';
            return (
              <SchoolGPTMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                userQuery={previousUserMessage}
                sources={msg.sources}
              />
            );
          })}
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
                SchoolGPT is selecting optimal response mode &amp; compiling telemetry…
              </span>
            </div>
          </motion.div>
        )}

        {/* Contextual Smart Follow-up Action Pills */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'Compare with Class Average',
              'View Attendance',
              'Open Homework',
              'Generate Parent Summary',
              'Schedule Check-in',
              'Open Student Profile',
            ].map((actionText) => (
              <button
                key={actionText}
                type="button"
                onClick={() => handleSend(actionText)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow-2xs transition-all active:scale-95"
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
            placeholder={isLoading ? 'Compiling telemetry UI…' : placeholder}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:bg-white font-medium"
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-xs sm:text-sm font-extrabold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-40 shadow-xs"
          >
            Ask ✨
          </button>
        </div>
      </div>
    </div>
  );
}
