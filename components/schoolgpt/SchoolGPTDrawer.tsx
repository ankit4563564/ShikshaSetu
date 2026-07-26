'use client';

import { useState } from 'react';
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

export default function SchoolGPTDrawer({
  isOpen,
  onClose,
  screenName = 'Your Classroom',
}: DrawerProps) {
  const { context } = useContextRegistry();
  const { conversation, ask, isLoading, resetConversation } = useAmbientAICore();
  const [inputVal, setInputVal] = useState('');

  const uiProps = adaptContextToUI(context);

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
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        />

        {/* Floating Side Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white border-l border-slate-200/90 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white font-display text-xs font-black flex items-center justify-center">
                  ✨
                </div>
                <div>
                  <h3 className="font-display text-sm font-extrabold text-slate-900">SchoolGPT Assistant</h3>
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{screenName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold"
                  title="Clear Conversation"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Context Card Banner */}
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
                <div className="space-y-4 pt-4">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 block">
                    Suggested Questions:
                  </span>
                  <div className="space-y-2">
                    {uiProps.suggestions.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => handleSend(item.prompt)}
                        className="w-full p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-left transition-all group flex items-center justify-between text-xs font-bold text-slate-800 active:scale-95 shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span>{item.title}</span>
                        </span>
                        <span className="text-slate-400 group-hover:text-slate-900 transition-colors">&rarr;</span>
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

              {isLoading && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-900 animate-bounce" />
                  <span>Looking up student records…</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xs focus-within:border-slate-900 transition-all">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
                  placeholder={uiProps.placeholder}
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSend(inputVal)}
                  disabled={isLoading || !inputVal.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all disabled:opacity-30"
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
