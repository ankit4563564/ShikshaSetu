'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolGPTContextCard from './SchoolGPTContextCard';
import { askSchoolGPTAction } from '@/app/actions/schoolgptActions';
import type { SchoolRole } from '@/school-brain/models/index';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  screenName?: string;
  role?: string;
  studentName?: string;
  classNameLabel?: string;
}

const teacherSuggestions = [
  'Who needs extra help today?',
  'How is my class performing?',
  'Generate today\'s parent summary.',
  'Explain attendance this week.',
  'Which students improved the most?',
];

const parentSuggestions = [
  'Explain today\'s homework.',
  'How is my child doing?',
  'Where is the school bus?',
  'What should we revise this weekend?',
  'Summarize this week\'s learning.',
];

interface ResponseItem {
  query: string;
  answer: string;
  sources: string[];
  suggestedFollowUps?: string[];
  actionObject?: any;
}

export default function SchoolGPTDrawer({
  isOpen,
  onClose,
  screenName = 'Your Classroom',
  role = 'Teacher',
  studentName = 'Aarav Sharma',
  classNameLabel = 'Class 8A',
}: DrawerProps) {
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ResponseItem[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTriggerQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isLoading) return;

    setInputVal('');
    setIsLoading(true);

    try {
      const userRole: SchoolRole = (role.toLowerCase() as SchoolRole) || 'teacher';
      const res = await askSchoolGPTAction({
        question: q,
        role: userRole,
        history: history.flatMap((item) => [
          { role: 'user', content: item.query },
          { role: 'assistant', content: item.answer },
        ]),
      });

      setHistory((prev) => [
        ...prev,
        {
          query: q,
          answer: res.text,
          sources: res.sources || ['School Telemetry Database'],
          suggestedFollowUps: res.suggestedFollowUps,
          actionObject: (res as any).actionObject,
        },
      ]);
    } catch (err) {
      console.error('[SchoolGPT Drawer] Error fetching response:', err);
      setHistory((prev) => [
        ...prev,
        {
          query: q,
          answer: 'Sorry, I encountered an error executing this request. Please try again.',
          sources: ['Error Handler'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = role === 'Parent' ? parentSuggestions : teacherSuggestions;

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    return text.split('\n\n').map((para, idx) => (
      <p key={idx} className="my-2 leading-relaxed font-medium text-slate-800 text-xs sm:text-sm">
        {para.split(/(\*\*.*?\*\*)/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} className="font-extrabold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </p>
    ));
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
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-hidden font-body"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white font-display text-sm font-black flex items-center justify-center shadow-xs">
                  ✨
                </div>
                <div>
                  <h3 className="font-display text-sm font-extrabold text-slate-900">
                    School Assistant
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    Always here to help &bull; {screenName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Natural Context Statement */}
              <SchoolGPTContextCard
                screenName={screenName}
                studentName={studentName}
                classNameLabel={classNameLabel}
              />

              {/* Input Bar */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputVal.trim()) {
                        handleTriggerQuery(inputVal);
                      }
                    }}
                    placeholder={role === 'Parent' ? 'Ask about your child...' : 'Ask about a student or class...'}
                    disabled={isLoading}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:bg-white font-medium shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => inputVal.trim() && handleTriggerQuery(inputVal)}
                    disabled={isLoading || !inputVal.trim()}
                    className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition-all active:scale-95 shrink-0 disabled:opacity-40"
                  >
                    Ask ✨
                  </button>
                </div>

                {/* Suggested Questions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Suggested Questions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleTriggerQuery(q)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl text-center space-y-3 my-4">
                  <div className="flex justify-center items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="font-body text-xs font-bold text-slate-700">
                    SchoolGPT multi-agent pipeline is executing targeted retrieval…
                  </p>
                </div>
              )}

              {/* Dynamic History Output Stream */}
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-4"
                  >
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Question</span>
                      <h4 className="font-display text-sm font-extrabold text-slate-900">{item.query}</h4>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block mb-1">
                        SchoolGPT Verified Answer
                      </span>
                      {renderFormattedText(item.answer)}
                    </div>

                    {/* Action Object Payload if Present */}
                    {item.actionObject && (
                      <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            ⚡ Action Object: {item.actionObject.type}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                            Ready
                          </span>
                        </div>
                        <h5 className="font-display text-xs font-extrabold text-white">{item.actionObject.title}</h5>
                        <p className="text-xs text-slate-300 font-mono bg-slate-800 p-2.5 rounded-xl">
                          {item.actionObject.preview}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.actionObject.actions?.map((act: string) => (
                            <button
                              key={act}
                              type="button"
                              onClick={() => alert(`Action executed: ${act}`)}
                              className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all"
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Sources */}
                    {item.sources && item.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">Sources:</span>
                        {item.sources.map((s) => (
                          <span key={s} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Follow up pills */}
                    {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 block">Suggested Follow-ups:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.suggestedFollowUps.map((fol) => (
                            <button
                              key={fol}
                              type="button"
                              onClick={() => handleTriggerQuery(fol)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200/80"
                            >
                              {fol} &rarr;
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Updated just now
              </span>
              <span className="font-bold text-slate-400">ShikshaSetu Assistant</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
