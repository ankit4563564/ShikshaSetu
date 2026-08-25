'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchChatMessagesAction, sendChatMessageAction, ChatMessageData } from '@/app/actions/chatActions';
import { draftParentTeacherMessageAction } from '@/app/actions/parentAiActions';

interface ParentChatTabProps {
  studentId: string;
  studentName: string;
  guardianId: string | null;
  guardianName: string;
  teacherName?: string;
  isLoading?: boolean;
}

const QUICK_NOTE_CHIPS = [
  'Regarding today’s homework',
  'Doctor appointment / medical note',
  'Bus delay inquiry',
  'Clarification on upcoming test',
  'Thank you for the update!',
];

export function ParentChatTab({
  studentId,
  studentName,
  guardianId,
  guardianName,
  teacherName = 'Class Teacher (Ms. Mehra)',
  isLoading = false,
}: ParentChatTabProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isContextFlag, setIsContextFlag] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Message Assistant Drawer State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiIntent, setAiIntent] = useState<'leave_request' | 'homework_query' | 'meeting_request' | 'progress_query' | 'health_note'>('homework_query');
  const [aiNotes, setAiNotes] = useState('');
  const [aiTone, setAiTone] = useState<'polite' | 'shorter' | 'clearer'>('polite');
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  // Load message history on student change
  useEffect(() => {
    let isMounted = true;
    async function loadMessages() {
      setIsFetching(true);
      setErrorMsg(null);
      try {
        const history = await fetchChatMessagesAction(studentId);
        if (isMounted) {
          setMessages(history);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[ParentChatTab] Failed to fetch messages:', err);
          setErrorMsg('Could not load past conversation history.');
        }
      } finally {
        if (isMounted) setIsFetching(false);
      }
    }

    if (studentId) {
      loadMessages();
    }
    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setErrorMsg(null);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessageData = {
      id: tempId,
      studentId,
      senderId: guardianId || 'guardian',
      senderRole: 'parent',
      messageText: trimmed,
      isContextFlag,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    const flagToSend = isContextFlag;
    setIsContextFlag(false);

    try {
      const result = await sendChatMessageAction({
        studentId,
        text: trimmed,
        senderRole: 'parent',
        senderId: guardianId || 'guardian',
        isContextFlag: flagToSend,
      });

      if (!result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setErrorMsg(result.error || 'Failed to send note.');
      } else if (result.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? result.message! : m)));
      }
    } catch (err: any) {
      console.error('[ParentChatTab] Send error:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setErrorMsg('Network error. Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateAiDraft = async () => {
    setIsAiDrafting(true);
    try {
      const res = await draftParentTeacherMessageAction({
        intent: aiIntent,
        studentName: studentName.split(' ')[0],
        notes: aiNotes,
        tone: aiTone,
      });

      if (res.success && res.draft) {
        setInputText(res.draft.draftText);
        setShowAiModal(false);
        setAiNotes('');
      }
    } catch (err) {
      console.error('Failed to generate AI draft:', err);
    } finally {
      setIsAiDrafting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-deep-teal/10 bg-white shadow-xs overflow-hidden flex flex-col h-[560px]">
      {/* ── Chat Header ── */}
      <div className="bg-paper/80 border-b border-deep-teal/10 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-deep-teal to-teal-700 text-white flex items-center justify-center font-display font-bold text-sm shadow-2xs">
            👩‍🏫
          </div>
          <div>
            <h3 className="font-display text-sm font-extrabold text-deep-teal">
              {teacherName}
            </h3>
            <p className="font-body text-[11px] text-deep-teal/60 font-medium">
              Class Teacher &bull; Direct Parent-Teacher Communication Channel
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold hover:bg-teal-100 transition-all shadow-2xs"
        >
          <span>✨</span>
          <span>Help me write message</span>
        </button>
      </div>

      {/* ── Message Stream ── */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-paper/30">
        {isFetching ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2 text-deep-teal/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
            <span className="text-xs font-medium">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-deep-teal/5 text-deep-teal text-2xl flex items-center justify-center shadow-2xs">
              💬
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm font-bold text-deep-teal">
                No past messages yet
              </h4>
              <p className="font-body text-xs text-deep-teal/50 max-w-xs mx-auto">
                Send a note to {studentName.split(' ')[0]}'s class teacher regarding leave, homework questions, or medical updates.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isParent = msg.senderRole === 'parent';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs space-y-1 ${
                    isParent
                      ? 'bg-deep-teal text-white rounded-br-xs'
                      : 'bg-white border border-deep-teal/10 text-deep-teal rounded-bl-xs'
                  }`}
                >
                  {msg.isContextFlag && (
                    <div
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 ${
                        isParent ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      📌 Flagged Note
                    </div>
                  )}
                  <p className="font-medium whitespace-pre-wrap">{msg.messageText}</p>
                  <span
                    className={`block text-[9px] font-mono text-right ${
                      isParent ? 'text-white/60' : 'text-deep-teal/40'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Chips Bar */}
      <div className="bg-white border-t border-deep-teal/5 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-extrabold uppercase text-deep-teal/40 font-mono shrink-0">
          Quick:
        </span>
        {QUICK_NOTE_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setInputText((prev) => (prev ? `${prev} ${chip}` : chip))}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-paper border border-deep-teal/10 text-deep-teal/70 hover:text-deep-teal hover:border-deep-teal/30 shrink-0 transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="bg-rose-50 border-t border-rose-200 px-4 py-1.5 text-xs text-rose-700 font-semibold flex items-center justify-between">
          <span>⚠ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800">✕</button>
        </div>
      )}

      {/* ── Input Box & Send Bar ── */}
      <form onSubmit={handleSendMessage} className="bg-white p-3 border-t border-deep-teal/10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsContextFlag(!isContextFlag)}
          title="Flag as Important Note"
          className={`p-2.5 rounded-xl border text-sm transition-all ${
            isContextFlag
              ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
              : 'bg-paper border-deep-teal/10 text-deep-teal/50 hover:text-deep-teal'
          }`}
        >
          📌
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Write a polite note to ${teacherName}...`}
          disabled={isSending}
          className="flex-1 rounded-xl border border-deep-teal/15 px-3.5 py-2.5 text-xs font-semibold text-deep-teal placeholder:text-deep-teal/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="bg-deep-teal text-white px-4 py-2.5 rounded-xl font-display text-xs font-bold hover:bg-deep-teal/90 active:scale-95 transition-all shadow-xs disabled:opacity-50 flex items-center gap-1 shrink-0"
        >
          <span>{isSending ? 'Sending...' : 'Send'}</span>
          <span>➤</span>
        </button>
      </form>

      {/* ── AI Message Drafter Modal ── */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowAiModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="font-display text-base font-extrabold text-deep-teal">
                    AI Message Assistant
                  </h3>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1 rounded-full hover:bg-deep-teal/5 text-deep-teal/40"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Intent Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-deep-teal uppercase text-[10px] tracking-wider block">
                    What would you like to communicate?
                  </label>
                  <select
                    value={aiIntent}
                    onChange={(e) => setAiIntent(e.target.value as any)}
                    className="w-full rounded-xl border border-deep-teal/20 p-2.5 font-semibold text-deep-teal bg-white"
                  >
                    <option value="leave_request">📝 Leave Application / Absence Note</option>
                    <option value="homework_query">❓ Homework Clarification</option>
                    <option value="meeting_request">🤝 Request for Discussion / PTM</option>
                    <option value="health_note">🩺 Health / Diet / Medical Update</option>
                    <option value="progress_query">📈 Academic Progress Inquiry</option>
                  </select>
                </div>

                {/* Tone Options */}
                <div className="space-y-1">
                  <label className="font-bold text-deep-teal uppercase text-[10px] tracking-wider block">
                    Message Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'polite', label: 'Very Polite' },
                      { id: 'shorter', label: 'Short & Direct' },
                      { id: 'clearer', label: 'Detailed' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAiTone(t.id as any)}
                        className={`py-2 rounded-xl border font-bold text-[11px] transition-all ${
                          aiTone === t.id
                            ? 'bg-deep-teal text-white border-deep-teal'
                            : 'bg-paper border-deep-teal/15 text-deep-teal/70 hover:border-deep-teal/30'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Notes input */}
                <div className="space-y-1">
                  <label className="font-bold text-deep-teal uppercase text-[10px] tracking-wider block">
                    Any specific details to include? (Optional)
                  </label>
                  <textarea
                    value={aiNotes}
                    onChange={(e) => setAiNotes(e.target.value)}
                    placeholder="e.g. Fever since yesterday, will complete homework by Thursday..."
                    rows={2}
                    className="w-full rounded-xl border border-deep-teal/20 p-2.5 font-medium text-deep-teal placeholder:text-deep-teal/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-deep-teal/20 text-deep-teal text-xs font-bold hover:bg-deep-teal/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={isAiDrafting}
                  className="flex-1 py-2.5 rounded-xl bg-deep-teal text-white text-xs font-bold hover:bg-deep-teal/90 shadow-md disabled:opacity-50"
                >
                  {isAiDrafting ? 'Drafting...' : 'Insert Message'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
