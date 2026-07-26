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

const loadingSteps = [
  'Reading classroom context & active screen signals…',
  'Analyzing attendance & homework telemetry…',
  'Connecting SchoolGPT knowledge engine…',
  'Building custom intelligence workspace…',
];

export default function SchoolGPTDrawer({
  isOpen,
  onClose,
  screenName = 'Teacher Dashboard',
  role = 'Teacher',
  studentName = 'Aarav Sharma',
  classNameLabel = 'Class 8A',
}: DrawerProps) {
  const [activeIntent, setActiveIntent] = useState<'STUDENT_REPORT' | 'CLASS_ANALYTICS' | 'TIMELINE' | 'ACTION' | 'SEARCH'>('STUDENT_REPORT');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectQuery = (intent: 'STUDENT_REPORT' | 'CLASS_ANALYTICS' | 'TIMELINE' | 'ACTION' | 'SEARCH') => {
    setIsLoading(true);
    setLoadingStepIdx(0);

    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval);
          setIsLoading(false);
          setActiveIntent(intent);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
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
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Drawer / Bottom Sheet Container */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-hidden font-body"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white font-display text-sm font-black flex items-center justify-center shadow-xs">
                  ✨
                </div>
                <div>
                  <h3 className="font-display text-sm font-black text-slate-900">
                    SchoolGPT AI Operating System
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Context-Aware Intelligence Layer &bull; {screenName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Intelligence Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Context Card */}
              <SchoolGPTContextCard
                role={role}
                screenName={screenName}
                studentName={studentName}
                classNameLabel={classNameLabel}
              />

              {/* Quick Intent Triggers */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Select Intelligence Mode
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'STUDENT_REPORT', label: '👤 Student Report' },
                    { id: 'CLASS_ANALYTICS', label: '📊 Class Health' },
                    { id: 'TIMELINE', label: '⏱️ Today\'s Timeline' },
                    { id: 'ACTION', label: '🎯 Support Radar' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => handleSelectQuery(btn.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                        activeIntent === btn.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progressive Loading State */}
              {isLoading ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-3 my-6">
                  <div className="flex justify-center items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '0ms' }} />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '150ms' }} />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-900" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="font-mono text-xs font-bold text-slate-700">
                    {loadingSteps[loadingStepIdx]}
                  </p>
                </div>
              ) : (
                /* Dynamic UI Response Engine Output */
                <SchoolGPTDynamicEngine intent={activeIntent} />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live Telemetry Synchronized
              </span>
              <span className="font-mono font-bold text-[10px]">ShikshaSetu AI OS v2.0</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
