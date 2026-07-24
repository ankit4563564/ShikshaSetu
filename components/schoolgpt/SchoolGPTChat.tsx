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

const suggestedQuestions: Record<SchoolGPTRole, string[]> = {
  student: ['What is my attendance?', 'Show my safety journey today.', 'When is Robotics Club?', "Show tomorrow's timetable."],
  parent: ['Was my child safe today?', 'Show Guardian Journey timeline.', 'What is my child\'s attendance?', 'Show upcoming events.'],
  teacher: ['Which students need attention?', 'Show today\'s arrival safety checks.', 'Show attendance trends.', 'What events are coming up?'],
  admin: ['Show unresolved safety alerts.', 'Show attendance trends.', 'What events are coming up?', 'List school rules.'],
  driver: ['Show my bus route stops.', 'What is the speed limit?'],
  gate: ['Show gate rules and entry policies.', 'What announcements are there?'],
  vendor: ['Show active school rules.', 'List calendar holidays.'],
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
  // Pre-populate with demo history for student role
  const initialMessages: SchoolGPTMessageType[] = role === 'student'
    ? [
        ...SCHOOLGPT_HISTORY.map((msg, i) => ({
          id: `demo-${i}`,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: Date.now() - (SCHOOLGPT_HISTORY.length - i) * 60000,
          sources: [],
          suggestedFollowUps: [],
        })),
      ]
    : [
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "Hello! I'm SchoolGPT, your AI school assistant. Ask me anything about attendance, homework, timetable, clubs, events, bus, exams, library, school rules, and more!",
          timestamp: Date.now(),
          sources: [],
          suggestedFollowUps: [],
        },
      ];

  const [messages, setMessages] = useState<SchoolGPTMessageType[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(role !== 'student');
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
        sources: response.sources || [],
        suggestedFollowUps: response.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setHasError(true);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
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
    <div className="flex h-full flex-col justify-between">
      <div className="flex-1 overflow-y-auto space-y-0.5 px-0.5 pb-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <SchoolGPTMessage key={msg.id} role={msg.role} content={msg.content} sources={msg.sources} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start py-2.5 pl-12">
            <div className="rounded-lg border border-deep-teal/10 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-deep-teal/30" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-deep-teal/30" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-deep-teal/30" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {!isLoading && messages.length > 1 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].suggestedFollowUps && (
          <div className="flex flex-wrap gap-1.5 pt-1.5 pl-12">
            {messages[messages.length - 1].suggestedFollowUps?.map((actionText) => (
              <button
                key={actionText}
                type="button"
                onClick={() => handleSend(actionText)}
                className="flex items-center gap-1 rounded-lg border border-deep-teal/10 bg-deep-teal/[0.05] px-2.5 py-1 text-[10.5px] font-semibold text-deep-teal/82 shadow-sm transition-all hover:border-deep-teal/20 hover:bg-deep-teal/[0.08] active:scale-95"
              >
                <span>💡</span> {actionText}
              </button>
            ))}
          </div>
        )}

        {showSuggestions && (messages.length === 1 || (role !== 'student' && messages.filter(m => m.role === 'user').length === 0)) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1.5 pt-2 pl-12">
            {currentSuggested.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="rounded-lg border border-deep-teal/10 bg-white/72 px-3 py-1.5 text-xs font-semibold text-deep-teal/74 shadow-xs backdrop-blur-sm transition-all hover:border-deep-teal/20 hover:bg-white hover:text-deep-teal"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {hasError && lastQuestion && (
        <div className="flex justify-start px-1 pb-3 pl-12 animate-fade-in">
          <button
            type="button"
            onClick={() => handleSend(lastQuestion)}
            className="flex items-center gap-1 rounded-lg border border-warm-clay/10 bg-warm-clay/5 px-3 py-1.5 text-[10px] font-bold text-warm-clay transition-all hover:border-warm-clay/20 hover:bg-warm-clay/10 active:scale-95"
          >
            <span>🔄 Retry last question</span>
          </button>
        </div>
      )}

      <div className="mt-auto border-t border-deep-teal/10 pt-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Waiting for response…' : placeholder}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-deep-teal/15 bg-white/55 px-3 py-2 text-xs md:text-sm text-deep-teal placeholder-deep-teal/40 outline-none transition-all focus:border-deep-teal/30 focus:bg-white focus:ring-1 focus:ring-deep-teal/10"
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-deep-teal px-4 py-2 text-xs md:text-sm font-bold text-white transition-all hover:bg-deep-teal/90 active:scale-95 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
