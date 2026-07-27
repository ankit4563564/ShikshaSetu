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

const experienceCards: { role: SchoolGPTRole; title: string; icon: string; desc: string; portalHref: string }[] = [
  {
    role: 'parent',
    title: 'Parent Experience',
    icon: '👨‍👩‍👧',
    desc: "Track your child's day, transport, attendance and communication.",
    portalHref: '/parent',
  },
  {
    role: 'teacher',
    title: 'Teacher Experience',
    icon: '👩‍🏫',
    desc: 'Manage classrooms, identify students needing attention and automate routine work.',
    portalHref: '/teacher',
  },
  {
    role: 'admin',
    title: 'School Administration',
    icon: '🏫',
    desc: 'Monitor operations, transport, analytics and campus safety.',
    portalHref: '/admin',
  },
  {
    role: 'student',
    title: 'Student Experience',
    icon: '🎓',
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
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity"
        />

        {/* Apple Intelligence Premium Light Side Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, x: '100%' }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="w-screen max-w-lg bg-[#FAFBFF] border-l border-[#E5E7EB] shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14b8a6] text-white font-display text-lg font-black flex items-center justify-center shadow-sm">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-extrabold text-[#111827]">
                      {isLanding ? '✨ SchoolGPT' : uiProps.greeting}
                    </h3>
                    <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                  </div>
                  <p className="text-xs font-medium text-[#6B7280] mt-0.5">
                    {isLanding ? 'Your AI companion for the connected school ecosystem.' : uiProps.contextBanner}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {conversation.length > 0 && (
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#E5E7EB] text-[#6B7280] text-xs font-bold transition-all border border-[#E5E7EB]"
                    title="Clear Conversation"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 w-9 rounded-full bg-[#F8FAFC] hover:bg-[#E5E7EB] text-[#111827] font-bold text-xs flex items-center justify-center transition-all border border-[#E5E7EB]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Context Card for Authenticated / Portal Mode */}
            {!isLanding && (
              <div className="px-6 pt-4">
                <SchoolGPTContextCard
                  screenName={screenName}
                  studentName={context.studentName || 'Aarav Sharma'}
                  classNameLabel={`Class ${context.classGrade || '8'}${context.classSection || 'A'}`}
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* LANDING PAGE STATE: Unselected / Welcome Mode */}
              {isLanding && !isDemo && conversation.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Clean Light Intro Card */}
                  <div className="p-5 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm space-y-1.5">
                    <h4 className="font-display text-sm font-extrabold text-[#111827]">
                      Choose an experience or ask what SchoolGPT can do.
                    </h4>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      Step directly into any role or ask product questions to see how ambient AI connects home and campus in real time.
                    </p>
                  </div>

                  {/* 4 Role Selection Cards */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280]">
                      Explore Role Experiences
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {experienceCards.map((card) => (
                        <div
                          key={card.role}
                          onClick={() => handleSelectDemoRole(card.role)}
                          className="p-4 rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#0F766E]/50 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl">{card.icon}</span>
                              <span className="text-[11px] font-extrabold text-[#0F766E] opacity-90 group-hover:opacity-100 flex items-center gap-1">
                                Demo &rarr;
                              </span>
                            </div>
                            <h6 className="font-display text-sm font-extrabold text-[#111827]">
                              {card.title}
                            </h6>
                            <p className="text-xs text-[#6B7280] font-medium leading-relaxed mt-1">
                              {card.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Questions */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280]">
                      Suggested Product Questions
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {productQuestions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSend(q)}
                          className="px-3.5 py-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-white hover:border-[#0F766E]/40 text-[#111827] text-xs font-bold transition-all shadow-xs active:scale-95 text-left"
                        >
                          • {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DEMO MODE: Role Selected on Landing Page */}
              {isLanding && isDemo && conversation.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="p-4 bg-white border border-[#E5E7EB] rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
                      <span className="text-xs font-extrabold text-[#111827]">
                        {uiProps.contextBanner}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setContext({ isDemoMode: false, demoRole: undefined })}
                      className="text-xs font-bold text-[#0F766E] hover:underline"
                    >
                      Change Role
                    </button>
                  </div>

                  <p className="text-xs text-[#6B7280] font-medium">
                    Try asking these contextual questions in Demo Mode:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {uiProps.suggestions.map((sug) => (
                      <button
                        key={sug.prompt}
                        type="button"
                        onClick={() => handleSend(sug.prompt)}
                        className="p-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-left transition-all hover:border-[#0F766E]/50 hover:shadow-sm active:scale-95 flex items-start gap-3"
                      >
                        <span className="text-lg shrink-0">{sug.icon}</span>
                        <div>
                          <p className="text-xs font-extrabold text-[#111827]">{sug.title}</p>
                          <p className="text-[11px] text-[#6B7280] font-medium mt-0.5 line-clamp-1">{sug.prompt}</p>
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
                  className="p-4 rounded-2xl bg-white border border-[#E5E7EB] text-xs font-bold text-[#0F766E] flex items-center gap-2.5 shadow-sm"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0F766E] animate-ping" />
                  <span>{loadingMessages[loadingIdx]}</span>
                </motion.div>
              )}
            </div>

            {/* ENTER PORTAL CTAs & INPUT BAR */}
            <div className="p-5 border-t border-[#E5E7EB] bg-white space-y-4">
              {/* ENTER PORTAL ACTION BAR FOR LANDING PAGE */}
              {isLanding && (
                <div className="space-y-2.5 border-b border-[#E5E7EB] pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280]">
                      Want the full experience?
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => handleNavigatePortal('/parent')}
                      className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#0F766E] hover:text-white border border-[#E5E7EB] text-[#111827] font-bold text-xs transition-all text-center active:scale-95 shadow-xs"
                    >
                      Parent Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigatePortal('/teacher')}
                      className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#0F766E] hover:text-white border border-[#E5E7EB] text-[#111827] font-bold text-xs transition-all text-center active:scale-95 shadow-xs"
                    >
                      Teacher Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigatePortal('/admin')}
                      className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#0F766E] hover:text-white border border-[#E5E7EB] text-[#111827] font-bold text-xs transition-all text-center active:scale-95 shadow-xs"
                    >
                      Admin Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigatePortal('/student')}
                      className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#0F766E] hover:text-white border border-[#E5E7EB] text-[#111827] font-bold text-xs transition-all text-center active:scale-95 shadow-xs"
                    >
                      Student Portal
                    </button>
                  </div>
                </div>
              )}

              {/* INPUT BAR */}
              <div className="flex items-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-2 focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-[#0F766E]/10 transition-all">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
                  placeholder={uiProps.placeholder}
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-[#111827] placeholder-[#6B7280] outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSend(inputVal)}
                  disabled={isLoading || !inputVal.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d665f] text-white font-extrabold text-xs transition-all disabled:opacity-40 shadow-xs active:scale-95"
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

