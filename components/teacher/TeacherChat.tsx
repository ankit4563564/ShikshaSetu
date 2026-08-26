'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchChatMessagesAction, sendChatMessageAction, ChatMessageData } from '@/app/actions/chatActions';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from '@/components/shared/NotificationContext';

interface TeacherChatProps {
  studentId: string;
  studentName: string;
  teacherId: string;
}

export default function TeacherChat({ studentId, studentName, teacherId }: TeacherChatProps) {
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
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Set active chat and clear notifications for this student
  useEffect(() => {
    setActiveChatStudentId(studentId);
    clearNotificationsForStudent(studentId);
    return () => setActiveChatStudentId(null);
  }, [studentId, setActiveChatStudentId, clearNotificationsForStudent]);

  // Load message history on studentId change
  useEffect(() => {
    let isMounted = true;
    const loadMessages = async () => {
      try {
        const history = await fetchChatMessagesAction(studentId);
        if (isMounted) {
          setMessages(history);
        }
      } catch (err) {
        console.warn('[TeacherChat] Error loading messages:', err);
      }
    };
    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // Supabase Realtime subscription for incoming chat messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`teacher-chat-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `student_id=eq.${studentId}`,
        },
        (payload: any) => {
          const rawMessage = payload.new;
          if (!rawMessage) return;

          const newMsg: ChatMessageData = {
            id: rawMessage.id,
            studentId: rawMessage.student_id,
            senderId: rawMessage.sender_id,
            senderRole: rawMessage.sender_role as 'teacher' | 'parent',
            messageText: rawMessage.content,
            isContextFlag: rawMessage.is_context_flag || false,
            createdAt: rawMessage.created_at,
          };

          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMsg.id)) return prev;

            const matchedOptimisticIndex = prev.findIndex(
              (msg) => msg.senderRole === 'teacher' && msg.messageText === newMsg.messageText && msg.id.startsWith('temp-')
            );

            if (matchedOptimisticIndex !== -1) {
              const updated = [...prev];
              updated[matchedOptimisticIndex] = newMsg;
              return updated;
            }

            return [...prev, newMsg];
          });
        }
      )
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

  // Auto-scroll logic
  useEffect(() => {
    if (!shouldAutoScroll && !isUserNearBottom) return;

    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: shouldAutoScroll ? 'smooth' : 'auto'
    });
  }, [messages, shouldAutoScroll, isUserNearBottom]);

  // Auto-scroll on newly sent message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].senderRole === 'teacher') {
      setShouldAutoScroll(true);
      const container = chatContainerRef.current;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  const filteredMessages = messages.filter((msg) =>
    msg.messageText.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

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
        // ONLY clear draft on successful persistence
        if (inputText === textToSend) {
          setInputText('');
        }
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? res.message! : msg)));
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

  const presets = [
    `${studentName.split(' ')[0]} looked tired today.`,
    'Homework not submitted.',
    'Great participation today!',
    'Please check school diary.',
  ];

  return (
    <div className="relative flex h-full min-h-[340px] flex-col justify-between">
      {/* Header with Search */}
      <div className="mb-3 border-b border-deep-teal/10 pb-2 flex items-center justify-between gap-2">
        <h4 className="font-display text-[11px] font-black uppercase tracking-[0.14em] text-deep-teal/72">
          Chat with Parent
        </h4>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search messages..."
          className="rounded-lg border border-deep-teal/15 bg-white/70 px-2 py-0.5 text-[11px] text-deep-teal placeholder-deep-teal/40 outline-none focus:border-deep-teal/30"
          aria-label="Search messages"
        />
      </div>

      {/* Messages Stream Container */}
      <div ref={chatContainerRef} className="mb-3 flex-1 overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin scroll-smooth">
        {filteredMessages.length === 0 ? (
          <div className="py-10 text-center italic text-deep-teal/54 font-medium">
            {searchQuery ? 'No messages matching search.' : 'No messages yet. Send a quick update below.'}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderRole === 'teacher';
            const isDelivered = !msg.id.startsWith('temp-');
            return (
              <div
                key={msg.id}
                className={`flex max-w-[86%] flex-col ${isMe ? 'self-end items-end ml-auto' : 'self-start items-start'}`}
              >
                <div
                  className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'rounded-tr-none bg-deep-teal text-white shadow-sm'
                      : 'rounded-tl-none border border-deep-teal/10 bg-deep-teal/[0.06] text-deep-teal/95'
                  } ${msg.id.startsWith('temp-') ? 'opacity-60 animate-pulse' : ''}`}
                >
                  <p className="whitespace-pre-wrap">{msg.messageText}</p>
                </div>
                <span className="mt-1 px-1 text-[9px] font-semibold text-deep-teal/54 flex items-center gap-1">
                  {isMe ? 'You' : 'Parent'} &middot; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && (
                    <span className="text-sage font-black text-[10px]" title={isDelivered ? 'Read by parent' : 'Sending'}>
                      {isDelivered ? '✓✓ Read' : '✓ Sent'}
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
          className="absolute bottom-24 right-2 bg-deep-teal hover:bg-deep-teal/90 text-white p-2 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 z-10 cursor-pointer"
          title="Scroll to bottom"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
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

      {/* Quick Action Presets */}
      <div className="mb-3 space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-deep-teal/64">
          📌 Send Quick Update
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isSending}
              onClick={() => handleSendMessage(preset)}
              className="rounded-lg border border-deep-teal/10 bg-deep-teal/[0.05] px-2.5 py-1 text-[10.5px] font-semibold text-deep-teal/82 transition-all hover:border-deep-teal/20 hover:bg-deep-teal/[0.08] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Stable Controlled Composition Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex gap-2 border-t border-deep-teal/10 pt-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message to parent..."
          className="flex-1 rounded-lg border border-deep-teal/15 bg-white/55 px-3 py-2 text-xs text-deep-teal placeholder-deep-teal/40 transition-all focus:border-deep-teal/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-deep-teal/10 font-medium"
          disabled={isSending}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="rounded-lg bg-deep-teal px-4 py-2 text-xs font-bold text-white transition-all hover:bg-deep-teal/90 active:scale-95 disabled:opacity-50 shadow-md cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>{isSending ? 'Sending...' : 'Send'}</span>
          <span>&rarr;</span>
        </button>
      </form>
    </div>
  );
}
