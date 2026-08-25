'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainHomeworkAction, type HomeworkAiHelpResult } from '@/app/actions/parentAiActions';

interface Homework {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  submittedAt: string | null;
  isSubmitted: boolean;
  description?: string;
  feedback?: string;
}

interface ParentHomeworkTabProps {
  homework: Homework[];
  studentName: string;
  isLoading?: boolean;
  isEnabled?: boolean;
  onSendMessage?: () => void;
}

export function ParentHomeworkTab({
  homework = [],
  studentName = 'Student',
  isLoading = false,
  isEnabled = true,
  onSendMessage,
}: ParentHomeworkTabProps) {
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [expandedHwId, setExpandedHwId] = useState<string | null>(null);

  // AI Helper States
  const [activeAiHwId, setActiveAiHwId] = useState<string | null>(null);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiHelpCache, setAiHelpCache] = useState<Record<string, HomeworkAiHelpResult>>({});

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const pendingHomework = useMemo(() => {
    return homework.filter((h) => !h.isSubmitted);
  }, [homework]);

  const completedHomework = useMemo(() => {
    return homework.filter((h) => h.isSubmitted);
  }, [homework]);

  const displayedList = useMemo(() => {
    if (filter === 'pending') return pendingHomework;
    if (filter === 'completed') return completedHomework;
    return homework;
  }, [filter, pendingHomework, completedHomework, homework]);

  const handleAskAiHelp = async (hw: Homework) => {
    if (activeAiHwId === hw.id) {
      setActiveAiHwId(null);
      return;
    }

    setActiveAiHwId(hw.id);

    if (aiHelpCache[hw.id]) return;

    setAiLoadingId(hw.id);
    try {
      const res = await explainHomeworkAction({
        title: hw.title,
        subject: hw.subject,
        instructions: hw.description,
      });

      if (res.success && res.help) {
        setAiHelpCache((prev) => ({ ...prev, [hw.id]: res.help! }));
      }
    } catch (err) {
      console.error('Failed to get homework AI help:', err);
    } finally {
      setAiLoadingId(null);
    }
  };

  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-extrabold text-deep-teal">
            Homework for {studentName}
          </h3>
          <p className="font-body text-xs text-deep-teal/50">
            View submitted and pending homework assignments.
          </p>
        </div>
        <div className="rounded-2xl border border-deep-teal/10 bg-white p-6 shadow-sm text-center py-10">
          <p className="font-body text-sm text-deep-teal/40 italic">
            🔒 Homework updates are hidden because this preference is disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-extrabold text-deep-teal">
              Homework &amp; Assignments
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-deep-teal/10 text-deep-teal font-extrabold text-[10px] uppercase tracking-wider">
              {pendingHomework.length} Pending
            </span>
          </div>
          <p className="font-body text-xs text-deep-teal/60 font-medium mt-0.5">
            Active class assignments and submission tracker for {studentName}.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'pending', label: `Pending (${pendingHomework.length})` },
            { id: 'completed', label: `Completed (${completedHomework.length})` },
            { id: 'all', label: `All (${homework.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-deep-teal text-white shadow-xs'
                  : 'bg-white border border-deep-teal/10 text-deep-teal/60 hover:text-deep-teal hover:border-deep-teal/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {onSendMessage && (
          <button
            onClick={onSendMessage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-deep-teal/15 text-deep-teal text-xs font-bold hover:bg-deep-teal/5 transition-all shadow-2xs"
          >
            <span>💬</span>
            <span className="hidden sm:inline">Ask Teacher</span>
          </button>
        )}
      </div>

      {/* Homework Cards List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="rounded-3xl border border-deep-teal/10 bg-white p-8 text-center space-y-2 shadow-2xs">
            <div className="text-3xl">🎉</div>
            <h4 className="font-display text-sm font-bold text-deep-teal">
              {filter === 'pending'
                ? 'All Caught Up!'
                : 'No homework recorded in this category'}
            </h4>
            <p className="font-body text-xs text-deep-teal/50 max-w-xs mx-auto">
              {filter === 'pending'
                ? `${studentName} has no pending homework due right now.`
                : 'Assignments will appear here when posted by subject teachers.'}
            </p>
          </div>
        ) : (
          displayedList.map((hw) => {
            const isDueSoon = !hw.isSubmitted && hw.dueDate <= todayStr;
            const isExpanded = expandedHwId === hw.id;
            const isAiOpen = activeAiHwId === hw.id;
            const aiHelp = aiHelpCache[hw.id];
            const isAiLoading = aiLoadingId === hw.id;

            return (
              <motion.div
                key={hw.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl border bg-white p-5 shadow-xs transition-all space-y-3 ${
                  isDueSoon
                    ? 'border-amber-300 bg-amber-50/15'
                    : hw.isSubmitted
                    ? 'border-emerald-200/80 bg-emerald-50/10'
                    : 'border-deep-teal/10 hover:border-deep-teal/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold mt-0.5 shrink-0 shadow-2xs ${
                        hw.isSubmitted
                          ? 'bg-emerald-100 text-emerald-700'
                          : isDueSoon
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-deep-teal/5 text-deep-teal'
                      }`}
                    >
                      {hw.isSubmitted ? '✓' : '📚'}
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-deep-teal/50 font-mono">
                          {hw.subject}
                        </span>
                        {isDueSoon && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-white animate-pulse">
                            Due Today
                          </span>
                        )}
                        {hw.isSubmitted && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Submitted
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-sm font-bold text-deep-teal">
                        {hw.title}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display text-xs font-bold text-deep-teal/70">
                      Due: {new Date(hw.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {hw.submittedAt && (
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        Submitted: {new Date(hw.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Instructions & Feedback Accordion */}
                {hw.description && (
                  <div className="pt-1">
                    <button
                      onClick={() => setExpandedHwId(isExpanded ? null : hw.id)}
                      className="text-[11px] font-bold text-deep-teal/60 hover:text-deep-teal flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide instructions ▲' : 'View instructions ▼'}</span>
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-3 rounded-2xl bg-paper border border-deep-teal/10 text-xs text-deep-teal/80 space-y-1.5"
                      >
                        <p className="font-semibold text-deep-teal">{hw.description}</p>
                        {hw.feedback && (
                          <div className="pt-2 border-t border-deep-teal/10">
                            <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                              Teacher Feedback:
                            </span>
                            <p className="text-xs text-emerald-800 font-medium">{hw.feedback}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Action Buttons Bar ── */}
                <div className="flex items-center justify-between pt-2 border-t border-deep-teal/5">
                  <button
                    type="button"
                    onClick={() => handleAskAiHelp(hw)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all shadow-2xs ${
                      isAiOpen
                        ? 'bg-deep-teal text-white'
                        : 'bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100'
                    }`}
                  >
                    <span>✨</span>
                    <span>{isAiOpen ? 'Hide Study Helper' : 'AI Study Helper for Parents'}</span>
                  </button>

                  {onSendMessage && (
                    <button
                      type="button"
                      onClick={onSendMessage}
                      className="text-xs font-bold text-deep-teal/60 hover:text-deep-teal hover:underline flex items-center gap-1"
                    >
                      Ask teacher about this →
                    </button>
                  )}
                </div>

                {/* ── Expandable AI Helper Panel ── */}
                <AnimatePresence>
                  {isAiOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 to-emerald-50/60 border border-teal-300/60 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-900 font-mono">
                          💡 How to Guide {studentName.split(' ')[0]} at Home
                        </span>
                        <span className="text-[9px] text-teal-700 font-semibold">
                          Learning assistance (No cheating)
                        </span>
                      </div>

                      {isAiLoading ? (
                        <div className="space-y-2 py-2">
                          <div className="h-3.5 bg-teal-200/50 rounded animate-pulse w-full" />
                          <div className="h-3.5 bg-teal-200/50 rounded animate-pulse w-4/5" />
                        </div>
                      ) : aiHelp ? (
                        <div className="space-y-3 text-xs">
                          {/* Simplified Concept */}
                          <div className="space-y-0.5">
                            <span className="font-bold text-teal-950 block">Simple Explanation:</span>
                            <p className="text-teal-900/90 leading-relaxed font-medium">
                              {aiHelp.simplifiedConcept}
                            </p>
                          </div>

                          {/* Guiding Hints */}
                          {aiHelp.guidingHints && aiHelp.guidingHints.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-bold text-teal-950 block">🔑 Guiding Steps to Suggest:</span>
                              <ul className="space-y-1 text-teal-900/90 font-medium list-disc list-inside">
                                {aiHelp.guidingHints.map((hint, i) => (
                                  <li key={i}>{hint}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Check Questions */}
                          {aiHelp.checkQuestions && aiHelp.checkQuestions.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-bold text-teal-950 block">❓ 2 Quick Check Questions for You to Ask:</span>
                              <div className="space-y-1 pl-1">
                                {aiHelp.checkQuestions.map((q, i) => (
                                  <div key={i} className="p-2 rounded-xl bg-white/70 border border-teal-200 text-teal-950 font-semibold">
                                    "{q}"
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
