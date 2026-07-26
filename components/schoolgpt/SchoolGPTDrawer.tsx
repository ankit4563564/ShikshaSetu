'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolGPTContextCard from './SchoolGPTContextCard';
import SchoolGPTDynamicEngine from './SchoolGPTDynamicEngine';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  screenName?: string;
  role?: string;
  studentName?: string;
  classNameLabel?: string;
}

const friendlyLoadingSteps = [
  'Understanding classroom context…',
  'Gathering learning updates & attendance…',
  'Preparing helpful insights…',
];

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

export default function SchoolGPTDrawer({
  isOpen,
  onClose,
  screenName = 'Your Classroom',
  role = 'Teacher',
  studentName = 'Aarav Sharma',
  classNameLabel = 'Class 8A',
}: DrawerProps) {
  const [activeIntent, setActiveIntent] = useState<'STUDENT_REPORT' | 'CLASS_ANALYTICS' | 'TIMELINE' | 'ACTION' | 'SEARCH'>('STUDENT_REPORT');
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTriggerQuery = (queryText: string) => {
    setInputVal(queryText);
    setIsLoading(true);
    setLoadingIdx(0);

    const q = queryText.toLowerCase();
    let nextIntent: 'STUDENT_REPORT' | 'CLASS_ANALYTICS' | 'TIMELINE' | 'ACTION' | 'SEARCH' = 'STUDENT_REPORT';

    if (q.includes('help') || q.includes('attention') || q.includes('check')) nextIntent = 'ACTION';
    else if (q.includes('class') || q.includes('performing') || q.includes('8a')) nextIntent = 'CLASS_ANALYTICS';
    else if (q.includes('timeline') || q.includes('today') || q.includes('bus')) nextIntent = 'TIMELINE';
    else if (q.includes('report') || q.includes('child') || q.includes('doing')) nextIntent = 'STUDENT_REPORT';

    const interval = setInterval(() => {
      setLoadingIdx((prev) => {
        if (prev >= friendlyLoadingSteps.length - 1) {
          clearInterval(interval);
          setIsLoading(false);
          setActiveIntent(nextIntent);
          return prev;
        }
        return prev + 1;
      });
    }, 250);
  };

  const suggestions = role === 'Parent' ? parentSuggestions : teacherSuggestions;

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

          {/* Drawer / Mobile Bottom Sheet Container */}
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

              {/* Pinned Input Bar */}
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
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:bg-white font-medium shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => inputVal.trim() && handleTriggerQuery(inputVal)}
                    className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition-all active:scale-95 shrink-0"
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
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold transition-all active:scale-95"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Friendly Animated Loading State */}
              {isLoading ? (
                <div className="p-8 bg-slate-50 border border-slate-200/80 rounded-3xl text-center space-y-3 my-4">
                  <div className="flex justify-center items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="font-body text-xs font-bold text-slate-700">
                    {friendlyLoadingSteps[loadingIdx]}
                  </p>
                </div>
              ) : (
                /* Dynamic Response Display */
                <SchoolGPTDynamicEngine
                  intent={activeIntent}
                  queryText={inputVal}
                  onSelectAction={(actionText) => handleTriggerQuery(actionText)}
                />
              )}
            </div>

            {/* Simple Footer */}
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
