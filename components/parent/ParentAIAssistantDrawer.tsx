'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askSchoolGPTAction } from '@/app/actions/schoolgptActions';

interface ParentAIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  studentGrade?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  suggestedFollowUps?: string[];
}

export function ParentAIAssistantDrawer({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentGrade = '8A',
}: ParentAIAssistantDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const promptChips = [
    `Did ${studentName.split(' ')[0]} reach school today?`,
    'What homework is due tomorrow?',
    `How is ${studentName.split(' ')[0]}'s attendance this month?`,
    'When is the next exam or holiday?',
    'What recent notice was published?',
  ];

  const handleAsk = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await askSchoolGPTAction({
        question: trimmed,
        history,
        role: 'parent',
        studentId,
        childrenIds: [studentId],
        classGrade: studentGrade.replace(/[^0-9]/g, '') || '8',
        classSection: studentGrade.replace(/[0-9]/g, '') || 'A',
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.text,
          sources: res.sources,
          suggestedFollowUps: res.suggestedFollowUps,
        },
      ]);
    } catch (err: any) {
      console.error('[ParentAIAssistantDrawer] Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not retrieve that information right now. Please check the attendance or homework tab directly.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-deep-teal/10 bg-deep-teal text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base">
                  ✨
                </div>
                <div>
                  <h3 className="font-display text-sm font-extrabold">
                    Parent AI Assistant
                  </h3>
                  <p className="text-[10px] text-white/70">
                    Contextual queries for {studentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-paper/50">
              {messages.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-deep-teal/10 text-deep-teal flex items-center justify-center text-2xl mx-auto shadow-2xs">
                    💬
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display text-sm font-bold text-deep-teal">
                      Ask about {studentName}'s school day
                    </h4>
                    <p className="font-body text-xs text-deep-teal/60 max-w-xs mx-auto">
                      Get verified, instantaneous answers from official school records.
                    </p>
                  </div>

                  {/* Prompt Chips */}
                  <div className="space-y-2 pt-2 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-deep-teal/40 block px-1">
                      Quick Questions:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {promptChips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAsk(chip)}
                          className="text-left px-3.5 py-2.5 rounded-xl bg-white border border-deep-teal/10 hover:border-deep-teal/30 hover:bg-deep-teal/5 text-xs text-deep-teal font-semibold transition-all shadow-2xs"
                        >
                          {chip} →
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 font-body text-xs leading-relaxed ${
                          isUser
                            ? 'bg-deep-teal text-white rounded-br-xs'
                            : 'bg-white border border-deep-teal/10 text-deep-teal rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 pt-1 border-t border-deep-teal/10 text-[9px] font-mono text-deep-teal/50">
                            Verified Source: {msg.sources.join(', ')}
                          </div>
                        )}
                      </div>

                      {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.suggestedFollowUps.map((fu, fIdx) => (
                            <button
                              key={fIdx}
                              type="button"
                              onClick={() => handleAsk(fu)}
                              className="px-2.5 py-1 rounded-lg bg-deep-teal/5 hover:bg-deep-teal/10 text-[10px] font-semibold text-deep-teal border border-deep-teal/10"
                            >
                              {fu}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-deep-teal/10 w-fit">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
                  <span className="text-xs text-deep-teal/60 font-medium">Checking records...</span>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-deep-teal/10 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk(inputQuery);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-deep-teal/20 bg-paper/60 px-3.5 py-2.5 font-body text-xs text-deep-teal placeholder:text-deep-teal/30 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/10"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading}
                  className="h-10 px-4 rounded-xl bg-deep-teal hover:bg-deep-teal/90 text-white font-display text-xs font-bold transition-all disabled:opacity-40"
                >
                  Send
                </button>
              </form>
              <p className="text-[9px] text-deep-teal/40 text-center font-medium">
                Strict Privacy: AI answers strictly from your linked child's official records.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
