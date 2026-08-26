'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientAICore } from './core/AmbientIntelligenceCore';
import { useContextRegistry } from './context/ContextRegistry';
import { adaptContextToUI } from './core/PresentationAdapter';
import SchoolGPTMessage from './SchoolGPTMessage';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  screenName?: string;
}

export default function SchoolGPTDrawer({
  isOpen,
  onClose,
}: DrawerProps) {
  const { context } = useContextRegistry();
  const { conversation, ask, isLoading, resetConversation } = useAmbientAICore();
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uiProps = adaptContextToUI(context);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  if (!isOpen) return null;

  const handleSend = (query: string) => {
    if (!query.trim() || isLoading) return;
    ask(query.trim());
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
          className="absolute inset-0 bg-[#102A43]/30 backdrop-blur-xs transition-opacity"
        />

        {/* Clean, Modern Messaging Side Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="w-screen max-w-md sm:max-w-lg bg-[#FAF9F6] border-l border-stone-200 shadow-2xl flex flex-col justify-between"
          >
            {/* Header: Clean & Compact */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-white/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-[#102A43]">
                      {uiProps.appName}
                    </h3>
                    <span className="h-2 w-2 rounded-full bg-[#16A085]" />
                  </div>
                  <p className="text-[11px] font-medium text-[#102A43]/60">
                    {uiProps.roleBadge}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {conversation.length > 0 && (
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#102A43]/70 hover:text-[#102A43] hover:bg-stone-100 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-stone-100 text-[#102A43] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                  aria-label="Close Assistant"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Natural Welcome & Contextual Suggestion Chips (Empty State) */}
              {conversation.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-6 sm:py-8 space-y-6 text-center sm:text-left"
                >
                  <div className="space-y-1.5">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-xl shadow-2xs mx-auto sm:mx-0">
                      ✨
                    </div>
                    <h4 className="font-display text-lg sm:text-xl font-black text-[#102A43] pt-2">
                      {uiProps.greetingTitle}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#102A43]/70 font-normal">
                      {uiProps.greetingSubtitle}
                    </p>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#102A43]/50 block">
                      Suggested Actions:
                    </span>
                    <div className="flex flex-col gap-2">
                      {uiProps.suggestions.map((sug) => (
                        <button
                          key={sug.title}
                          type="button"
                          onClick={() => handleSend(sug.prompt)}
                          className="p-3 rounded-xl bg-white border border-stone-200 hover:border-[#2563EB]/40 hover:bg-[#EFF6FF] text-[#102A43] text-xs font-bold transition-all text-left flex items-center justify-between shadow-2xs group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{sug.icon}</span>
                            <span>{sug.title}</span>
                          </div>
                          <span className="text-stone-300 group-hover:text-[#2563EB] transition-colors">&rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Message Feed */}
              {conversation.map((msg) => (
                <SchoolGPTMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  contextTag={uiProps.contextTag}
                  onActionPrompt={(prompt) => handleSend(prompt)}
                />
              ))}

              {/* Natural Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-white border border-stone-200 text-xs font-bold text-[#2563EB] flex items-center gap-2 shadow-2xs max-w-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span>Thinking with {uiProps.contextTag.toLowerCase()}...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area: Modern Messaging Focus */}
            <div className="p-3 sm:p-4 border-t border-stone-200 bg-white space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputVal);
                }}
                className="flex items-center gap-2 bg-[#F8FAFC] border border-stone-200 rounded-2xl p-1.5 focus-within:border-[#2563EB] focus-within:bg-white transition-all shadow-2xs"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={uiProps.placeholder}
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-[#102A43] placeholder-[#102A43]/40 outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputVal.trim()}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-all disabled:opacity-40 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Send</span>
                  <span>&rarr;</span>
                </button>
              </form>

              <div className="flex items-center justify-between px-1 text-[10px] text-[#102A43]/50">
                <span>{uiProps.contextTag}</span>
                <span className="font-mono">Private &amp; Secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
