'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveChatStudentId(studentId);
    clearNotificationsForStudent(studentId);
    return () => setActiveChatStudentId(null);
  }, [studentId, setActiveChatStudentId, clearNotificationsForStudent]);

  useEffect(() => {
    const loadMessages = async () => {
      const history = await fetchChatMessagesAction(studentId);
      setMessages(history);
    };
    loadMessages();
  }, [studentId]);

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
  }, [studentId, studentName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredMessages = messages.filter((msg) =>
    msg.messageText.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    setInputText('');

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: ChatMessageData = {
      id: tempId,
      studentId,
      senderId: teacherId,
      senderRole: 'teacher',
      messageText: text,
      isContextFlag: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const res = await sendChatMessageAction({
      studentId,
      text,
      senderRole: 'teacher',
      senderId: teacherId,
      isContextFlag: false,
    });

    if (res.success && res.message) {
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? res.message! : msg)));
    } else {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      alert('Failed to send message. Reverting changes.');
    }

    setIsSending(false);
  };

  const presets = [
    `${studentName.split(' ')[0]} looked tired today.`,
    'Homework not submitted.',
    'Great participation today!',
    'Please check school diary.',
  ];

  return (
    <div className="flex h-full min-h-[340px] flex-col justify-between">
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

      <div className="mb-3 flex-1 overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin">
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

      <div className="mb-3 space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-deep-teal/64">
          📌 Send Quick Update
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              disabled={isSending}
              onClick={() => handleSendMessage(preset)}
              className="rounded-lg border border-deep-teal/10 bg-deep-teal/[0.05] px-2.5 py-1 text-[10.5px] font-semibold text-deep-teal/82 transition-all hover:border-deep-teal/20 hover:bg-deep-teal/[0.08] active:scale-95 disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 border-t border-deep-teal/10 pt-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          placeholder="Type message to parent..."
          className="flex-1 rounded-lg border border-deep-teal/15 bg-white/55 px-3 py-2 text-xs text-deep-teal placeholder-deep-teal/40 transition-all focus:border-deep-teal/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-deep-teal/10"
          disabled={isSending}
          aria-label="Message input"
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={isSending || !inputText.trim()}
          className="rounded-lg bg-deep-teal px-4 py-2 text-xs font-bold text-white transition-all hover:bg-deep-teal/90 active:scale-95 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
