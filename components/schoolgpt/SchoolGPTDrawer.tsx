'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolGPTContextCard from './SchoolGPTContextCard';
import { useAmbientAICore } from './core/AmbientIntelligenceCore';
import { useContextRegistry } from './context/ContextRegistry';
import { adaptContextToUI } from './core/PresentationAdapter';
import SchoolGPTMessage from './SchoolGPTMessage';
import type { SchoolGPTRole } from './context/types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  screenName?: string;
}

const loadingMessages = [
  "Analyzing ecosystem telemetry...",
  "Consulting SchoolGPT knowledge graph...",
  "Formatting connected response...",
];

const experienceCards: { role: SchoolGPTRole; title: string; icon: string; bg: string; border: string; desc: string; portalHref: string }[] = [
  {
    role: 'parent',
    title: 'Parent Experience',
    icon: '👨‍👩‍👧',
    bg: 'bg-emerald-50/80 hover:bg-emerald-100/80',
    border: 'border-emerald-200/80',
    desc: "Track your child's day, transport, attendance and communication.",
    portalHref: '/parent',
  },
  {
    role: 'teacher',
    title: 'Teacher Experience',
    icon: '👩‍🏫',
    bg: 'bg-indigo-50/80 hover:bg-indigo-100/80',
    border: 'border-indigo-200/80',
    desc: 'Manage classrooms, identify students needing attention and automate routine work.',
    portalHref: '/teacher',
  },
  {
    role: 'admin',
    title: 'School Administration',
    icon: '🏫',
    bg: 'bg-amber-50/80 hover:bg-amber-100/80',
    border: 'border-amber-200/80',
    desc: 'Monitor operations, transport, analytics and campus safety.',
    portalHref: '/admin',
  },
  {
    role: 'student',
    title: 'Student Experience',
    icon: '🎓',
    bg: 'bg-sky-50/80 hover:bg-sky-100/80',
    border: 'border-sky-200/80',
    desc: 'Homework, learning support, attendance and daily school life.',
    portalHref: '/student',
  },
];

const productQuestions = [
  'What can SchoolGPT do?',
  'Show me a connected school day.',
  'How does live bus tracking work?',
  'How do teachers save time?',
  'Why is this better than WhatsApp groups?',
  'How does SchoolGPT use AI?',
];

export default function SchoolGPTDrawer({
  isOpen,
  onClose,
  screenName = 'AI Product Guide',
}: DrawerProps) {
  const router = useRouter();
  const { context, setContext } = useContextRegistry();
  const { conversation, ask, isLoading, resetConversation } = useAmbientAICore();
  const [inputVal, setInputVal] = useState('');
  const [loadingIdx, setLoadingIdx] = useState(0);

  const uiProps = adaptContextToUI(context);
  const isLanding = context.role === 'landing';
  const isDemo = isLanding && context.isDemoMode;

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

  const handleSelectDemoRole = (demoRole: SchoolGPTRole) => {
    setContext({ isDemoMode: true, demoRole });
  };

  const handleNavigatePortal = (href: string) => {
    onClose();
    router.push(href);
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
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, x: '100%' }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="w-screen max-w-lg bg-white/95 backdrop-blur-xl border-l border-slate-200/90 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-indigo-50/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-display text-lg font-black flex items-center justify-center shadow-md">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-sm font-black text-slate-900">{uiProps.greeting}</h3>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">{uiProps.contextBanner}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {conversation.length > 0 && (
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-all"
                    title="Clear Conversation"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Context Card for Authenticated / Demo Mode */}
            {!isLanding && (
              <div className="px-5 pt-3">
                <SchoolGPTContextCard
                  screenName={screenName}
                  studentName={context.studentName || 'Aarav Sharma'}
                  classNameLabel={`Class ${context.classGrade || '8'}${context.classSection || 'A'}`}
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* LANDING PAGE STATE: Unselected / Welcome Mode */}
              {isLanding && !isDemo && conversation.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-2xl">
                    <h4 className="font-display text-sm font-extrabold text-indigo-950">
                      Your AI companion for the connected school ecosystem.
                    </h4>
                    <p className="text-xs text-indigo-700 font-medium mt-1">
                      How would you like to explore ShikshaSetu? Select an experience below or ask what SchoolGPT can do.
                    </p>
                  </div>

                  {/* 4 Role Selection Cards */}
                  <div>
                    <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                      Explore Experiences
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {experienceCards.map((card) => (
                        <div
                          key={card.role}
                          onClick={() => handleSelectDemoRole(card.role)}
                          className={`p-3.5 rounded-2xl border ${card.border} ${card.bg} cursor-pointer transition-all hover:scale-[1.02] shadow-2xs flex flex-col justify-between group`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xl">{card.icon}</span>
                              <span className="text-[10px] font-extrabold text-slate-500 group-hover:text-indigo-600">
                                Try Demo &rarr;
                              </span>
                            </div>
                            <h6 className="font-display text-xs font-extrabold text-slate-900">
                              {card.title}
                            </h6>
                            <p className="text-[10px] text-slate-600 font-medium leading-relaxed mt-1">
                              {card.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Questions */}
                  <div>
                    <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                      Suggested Product Questions
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {productQuestions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSend(q)}
                          className="px-3.5 py-2 rounded-full border border-slate-200/90 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-900 text-xs font-extrabold transition-all shadow-2xs active:scale-95 text-left flex items-center gap-1.5"
                        >
                          <span>• {q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DEMO MODE: Role Selected on Landing Page */}
              {isLanding && isDemo && conversation.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      <span className="text-xs font-extrabold text-emerald-900">
                        {uiProps.contextBanner}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setContext({ isDemoMode: false, demoRole: undefined })}
                      className="text-[10px] font-extrabold text-emerald-800 underline hover:text-emerald-950"
                    >
                      Change Experience
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Try asking any of these contextual questions in Demo Mode:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uiProps.suggestions.map((sug) => (
                      <button
                        key={sug.prompt}
                        type="button"
                        onClick={() => handleSend(sug.prompt)}
                        className={`p-3 rounded-2xl border ${sug.bg} text-left transition-all hover:scale-[1.02] shadow-2xs active:scale-95 flex items-start gap-2.5`}
                      >
                        <span className="text-base shrink-0">{sug.icon}</span>
                        <div>
                          <p className="text-xs font-extrabold">{sug.title}</p>
                          <p className="text-[10px] opacity-80 mt-0.5 line-clamp-1">{sug.prompt}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CONVERSATION MESSAGES */}
              {conversation.map((msg) => (
                <SchoolGPTMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  sources={msg.aiResponse?.evidence.map((e) => e.label)}
                />
              ))}

              {/* LOADING INDICATOR */}
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

            {/* ENTER PORTAL CTAs & INPUT BAR */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-3">
              {/* ENTER PORTAL ACTION BAR FOR LANDING PAGE */}
              {isLanding && (
                <div className="space-y-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Want the full experience?
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => handleNavigatePortal('/parent')}
                      className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition-all text-center shadow-xs active:scale-95"
                    >
                      Parent Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigatePortal('/teacher')}
                      className="px-2.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] transition-all text-center shadow-xs active:scale-95"
                    >
                      Teacher Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigatePortal('/admin')}
                      className="px-2.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] transition-all text-center shadow-xs active:scale-95"
                    >
                      Admin Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigatePortal('/student')}
                      className="px-2.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[11px] transition-all text-center shadow-xs active:scale-95"
                    >
                      Student Portal
                    </button>
                  </div>
                </div>
              )}

              {/* INPUT BAR */}
              <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
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

