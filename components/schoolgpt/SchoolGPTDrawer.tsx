'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolGPTContextCard from './SchoolGPTContextCard';
import { useAmbientAICore } from './core/AmbientIntelligenceCore';
import { useContextRegistry } from './context/ContextRegistry';
import { adaptContextToUI } from './core/PresentationAdapter';
import SchoolGPTMessage from './SchoolGPTMessage';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  screenName?: string;
  role?: string;
  studentName?: string;
  classNameLabel?: string;
  studentId?: string;
  classGrade?: string;
  classSection?: string;
}

const loadingMessages = [
  "Reviewing today's attendance...",
  "Checking homework & assignments...",
  "Reading teacher updates...",
  "Preparing your summary...",
];

const compactPills = [
  { label: 'Explain Homework', prompt: "Explain Aarav's homework for today." },
  { label: "Today's Attendance", prompt: "Summarize today's attendance." },
  { label: 'Teacher Message', prompt: "Draft a message to Aarav's class teacher." },
  { label: 'Bus Status', prompt: "Where is the school bus right now?" },
  { label: 'Revision Help', prompt: 'Give revision topics for the upcoming test.' },
];

export default function SchoolGPTDrawer({
  isOpen,
  onClose,
  screenName = 'Your Classroom',
}: DrawerProps) {
  const { context } = useContextRegistry();
  const { conversation, ask, isLoading, resetConversation } = useAmbientAICore();
  const [inputVal, setInputVal] = useState('');
  const [loadingIdx, setLoadingIdx] = useState(0);

  const uiProps = adaptContextToUI(context);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setInterval(() => {
      setLoadingIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isOpen) return null;

  const handleSend = (query: string) => {
    if (!query.trim() || isLoading) return;
    ask(query);
    setInputVal('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden font-body">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        />

        {/* Floating Warm Assistant Side Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, x: '100%' }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="w-screen max-w-md bg-white/95 backdrop-blur-xl border-l border-slate-200/90 shadow-2xl flex flex-col justify-between"
          >
            {/* Warm Friendly Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-indigo-50/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-display text-base font-black flex items-center justify-center shadow-md">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-sm font-black text-slate-900">👋 Hi Rahul</h3>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">I&apos;m here to help with Aarav&apos;s school day.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-all"
                  title="Clear Conversation"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Context Banner */}
            <div className="px-5 pt-3">
              <SchoolGPTContextCard
                screenName={screenName}
                studentName={context.studentName || 'Aarav Sharma'}
                classNameLabel={`Class ${context.classGrade || '8'}${context.classSection || 'A'}`}
              />
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {conversation.length === 0 ? (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100/80 rounded-2xl space-y-1">
                    <h4 className="font-display text-xs font-extrabold text-indigo-900">
                      How can I help with Aarav today?
                    </h4>
                    <p className="text-[11px] text-indigo-700 font-medium">
                      Select a quick topic below or type your question.
                    </p>
                  </div>

                  {/* Compact Rounded Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {compactPills.map((pill) => (
                      <button
                        key={pill.label}
                        type="button"
                        onClick={() => handleSend(pill.prompt)}
                        className="px-3.5 py-2 rounded-full border border-slate-200/90 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-900 text-xs font-extrabold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5"
                      >
                        <span>{pill.label}</span>
                        <span className="text-[10px] text-slate-400">&rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                conversation.map((msg) => (
                  <SchoolGPTMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    sources={msg.aiResponse?.evidence.map((e) => e.label)}
                  />
                ))
              )}

              {/* Natural Rotating Progress Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs font-bold text-indigo-900 flex items-center gap-2.5 shadow-2xs"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping" />
                  <span>{loadingMessages[loadingIdx]}</span>
                </motion.div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60">
              <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
                  placeholder="Ask about Aarav, homework, bus status..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSend(inputVal)}
                  disabled={isLoading || !inputVal.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all disabled:opacity-30 shadow-2xs active:scale-95"
                >
                  Send ✨
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
