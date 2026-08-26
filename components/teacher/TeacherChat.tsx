'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchChatMessagesAction, sendChatMessageAction, ChatMessageData } from '@/app/actions/chatActions';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from '@/components/shared/NotificationContext';

interface TeacherChatProps {
  studentId: string;
  studentName: string;
  teacherId: string;
  parentName?: string;
  teacherName?: string;
  onOpenAiDraft?: () => void;
}

export default function TeacherChat({
  studentId,
  studentName,
  teacherId,
  parentName = 'Sunita Sharma',
  teacherName = 'Ananya Mehra',
  onOpenAiDraft,
}: TeacherChatProps) {
  const { setActiveChatStudentId, clearNotificationsForStudent } = useNotifications();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  
  // Independent per-student draft state: isolated from message lists, realtime, and status updates
  const [draftsByStudent, setDraftsByStudent] = useState<Record<string, string>>({});
  const inputText = draftsByStudent[studentId] ?? '';
  
  const setInputText = useCallback((text: string) => {
    setDraftsByStudent((prev) => ({ ...prev, [studentId]: text }));
  }, [studentId]);

  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const studentFirstName = studentName.split(' ')[0] || 'Student';
  const parentFirstName = parentName.split(' ')[0] || 'Parent';

  // Set active chat and clear notifications for this student
  useEffect(() => {
    setActiveChatStudentId(studentId);
    clearNotificationsForStudent(studentId);
    return () => setActiveChatStudentId(null);
  }, [studentId, setActiveChatStudentId, clearNotificationsForStudent]);

  // Load and sync message history
  useEffect(() => {
    let isMounted = true;
    const syncMessages = async () => {
      try {
        const history = await fetchChatMessagesAction(studentId);
        if (isMounted && history) {
          setMessages((prev) => {
            const optimistic = prev.filter((m) => m.id.startsWith('temp-'));
            const nonOptimistic = history;
            
            if (
              prev.length === nonOptimistic.length &&
              prev.every((m, idx) => m.id === nonOptimistic[idx]?.id)
            ) {
              return prev;
            }

            const remainingOptimistic = optimistic.filter(
              (opt) => !nonOptimistic.some((dbMsg) => dbMsg.messageText === opt.messageText)
            );

            return [...nonOptimistic, ...remainingOptimistic];
          });
        }
      } catch (err) {
        console.warn('[TeacherChat] Error loading messages:', err);
      }
    };

    syncMessages();

    // Active real-time polling fallback (every 2.5s) to guarantee live updates
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncMessages();
      }
    }, 2500);

    const handleFocus = () => {
      syncMessages();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [studentId]);

  // Supabase Realtime & Broadcast subscription for incoming chat messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-thread-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row || !row.id) return;

          const newMsg: ChatMessageData = {
            id: row.id,
            studentId: row.student_id,
            senderId: row.sender_id,
            senderRole: row.sender_role as 'teacher' | 'parent',
            messageText: row.content,
            isContextFlag: row.is_context_flag || false,
            createdAt: row.created_at,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            const matchedOptIndex = prev.findIndex(
              (m) => m.senderRole === newMsg.senderRole && m.messageText === newMsg.messageText && m.id.startsWith('temp-')
            );
            if (matchedOptIndex !== -1) {
              const updated = [...prev];
              updated[matchedOptIndex] = newMsg;
              return updated;
            }
            return [...prev, newMsg];
          });
        }
      )
      .on('broadcast', { event: 'new_chat_message' }, ({ payload }) => {
        if (!payload || !payload.id || payload.studentId !== studentId) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;

          const matchedOptIndex = prev.findIndex(
            (m) => m.senderRole === payload.senderRole && m.messageText === payload.messageText && m.id.startsWith('temp-')
          );
          if (matchedOptIndex !== -1) {
            const updated = [...prev];
            updated[matchedOptIndex] = payload;
            return updated;
          }
          return [...prev, payload];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  // Track scroll position to detect if user is near bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 100;
      setIsUserNearBottom(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle auto-scroll on new messages
  useEffect(() => {
    if (messages.length === 0) return;

    const isInitialLoad = lastMessageCountRef.current === 0;
    const hasNewMessages = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (isInitialLoad || (hasNewMessages && isUserNearBottom)) {
      requestAnimationFrame(() => {
        const container = chatContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: isInitialLoad ? 'auto' : 'smooth',
          });
        }
      });
    }
  }, [messages, isUserNearBottom]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const query = searchQuery.toLowerCase().trim();
    return messages.filter((msg) => msg.messageText.toLowerCase().includes(query));
  }, [messages, searchQuery]);

  // Teacher Productivity Quick Presets (Clicking populates composer so teacher can edit before sending)
  const quickActions = [
    {
      label: '📝 Homework reminder',
      text: `Hi ${parentFirstName}, just a quick reminder that ${studentFirstName} has pending homework for Mathematics.`,
    },
    {
      label: '📅 Attendance concern',
      text: `Hi ${parentFirstName}, I noticed ${studentFirstName} was absent/late today. Hope everything is alright at home.`,
    },
    {
      label: '🎯 Assessment update',
      text: `Hi ${parentFirstName}, just a heads-up that ${studentFirstName} has an upcoming class assessment this Friday.`,
    },
    {
      label: '🌟 Positive feedback',
      text: `Hi ${parentFirstName}, ${studentFirstName} showed great focus and participation during today's lesson!`,
    },
  ];

  // Transactional Send Flow: Only clears draft AFTER confirmed persistence
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setError(null);

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: ChatMessageData = {
      id: tempId,
      studentId,
      senderId: teacherId,
      senderRole: 'teacher',
      messageText: trimmed,
      isContextFlag: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await sendChatMessageAction({
        studentId,
        text: trimmed,
        senderRole: 'teacher',
        senderId: teacherId,
        isContextFlag: false,
      });

      if (res.success && res.message) {
        const confirmedMsg = res.message;
        // ONLY clear draft on successful persistence
        if (inputText === textToSend) {
          setInputText('');
        }
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? confirmedMsg : msg)));

        // Broadcast to shared channel for instantaneous cross-tab receipt
        try {
          const supabase = createClient();
          const channel = supabase.channel(`chat-thread-${studentId}`);
          channel.send({
            type: 'broadcast',
            event: 'new_chat_message',
            payload: confirmedMsg,
          });
        } catch (bErr) {
          console.warn('[TeacherChat] Broadcast send note:', bErr);
        }
      } else {
        // PRESERVE DRAFT ON FAILURE
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        setError(res.error || "Couldn't send. Your message is still here.");
      }
    } catch (err: any) {
      // PRESERVE DRAFT ON EXCEPTION
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setError("Network error. Couldn't send. Your message is still here.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative flex h-[520px] flex-col justify-between bg-white rounded-2xl">
      {/* ── Search & Filter Bar ── */}
      <div className="mb-2 pb-2 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>💬</span>
          <span>Conversation History</span>
        </div>
        <div className="relative w-48 sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
            aria-label="Search conversation messages"
          />
          <span className="absolute left-2.5 top-1.5 text-[10px] text-slate-400">🔍</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1 text-[10px] text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Stream Container ── */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-3 px-1 py-2 text-xs scrollbar-thin scroll-smooth"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg shadow-2xs">
              💬
            </div>
            {searchQuery ? (
              <p className="text-xs font-medium text-slate-500">
                No messages matching &ldquo;{searchQuery}&rdquo;
              </p>
            ) : (
              <div className="space-y-1">
                <h4 className="font-display text-xs font-bold text-slate-800">No messages yet</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Start a conversation with {parentFirstName} about {studentFirstName}&rsquo;s learning, attendance or homework.
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderRole === 'teacher';
            const isDelivered = !msg.id.startsWith('temp-');
            const authorName = isMe ? teacherName : parentName;
            const roleLabel = isMe ? 'Teacher' : 'Parent';

            return (
              <div
                key={msg.id}
                className={`flex max-w-[82%] sm:max-w-[75%] flex-col ${
                  isMe ? 'self-end items-end ml-auto' : 'self-start items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isMe
                      ? 'rounded-tr-xs bg-slate-900 text-white shadow-xs'
                      : 'rounded-tl-xs bg-slate-100 border border-slate-200/80 text-slate-800'
                  } ${msg.id.startsWith('temp-') ? 'opacity-60 animate-pulse' : ''}`}
                >
                  {msg.isContextFlag && (
                    <div
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1.5 ${
                        isMe ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      📌 Flagged Note
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.messageText}</p>
                </div>
                <span className="mt-1 px-1 text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <span>{authorName} &middot; {roleLabel} &middot; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <span className="text-emerald-600 font-bold text-[10px]" title={isDelivered ? 'Delivered' : 'Sending'}>
                      {isDelivered ? '✓✓' : '✓'}
                    </span>
                  )}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {!isUserNearBottom && (
        <button
          type="button"
          onClick={() => {
            setShouldAutoScroll(true);
            chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
          }}
          className="absolute bottom-28 right-4 bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 z-10 cursor-pointer"
          title="Scroll to bottom"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Quick Action Presets (Populate Composer for Review) ── */}
      <div className="pt-2 pb-1.5 border-t border-slate-100 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick Prompts:
          </span>
          {onOpenAiDraft && (
            <button
              type="button"
              onClick={onOpenAiDraft}
              className="text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>✨ Draft with AI</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(action.text)}
              className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-2.5 py-1 text-[10.5px] font-medium text-slate-700 transition-all active:scale-95 cursor-pointer text-left"
              title="Click to populate message box"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Message Composer Form ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex gap-2 pt-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Write a note to ${parentFirstName} about ${studentFirstName}...`}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 font-medium"
          disabled={isSending}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>{isSending ? 'Sending...' : 'Send'}</span>
          <span>&rarr;</span>
        </button>
      </form>
    </div>
  );
}
