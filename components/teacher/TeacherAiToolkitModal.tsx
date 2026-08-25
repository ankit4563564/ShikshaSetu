'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateLessonPlanAction,
  generateDifferentiatedMaterialAction,
  draftTeacherParentMessageAction,
  generateExitTicketAction,
  publishExitTicketAction,
  analyzeExitTicketResultsAction,
  explainConceptDifferentlyAction,
  type LessonPlanResult,
  type DifferentiatedMaterialResult,
  type ExitTicketDraft,
  type ExitTicketAnalysisResult,
  type ExplainConceptDifferentlyResult,
} from '@/app/actions/teacherAiActions';

export type ToolkitTab = 'lesson' | 'differentiation' | 'exit_ticket' | 'explain_differently' | 'parent_message';

interface TeacherAiToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  defaultSection?: string;
  initialTab?: ToolkitTab;
  initialStudentName?: string;
  initialParentName?: string;
  initialTopic?: string;
}

export default function TeacherAiToolkitModal({
  isOpen,
  onClose,
  defaultGrade = '8',
  defaultSection = 'A',
  initialTab = 'lesson',
  initialStudentName = 'Aarav Sharma',
  initialParentName = 'Sunita Sharma',
  initialTopic = 'Fractions & Decimals',
}: TeacherAiToolkitModalProps) {
  const [activeTab, setActiveTab] = useState<ToolkitTab>(initialTab);

  // 1. Lesson Plan State
  const [lessonTopic, setLessonTopic] = useState(initialTopic);
  const [lessonSubject, setLessonSubject] = useState('Mathematics');
  const [lessonDuration, setLessonDuration] = useState(45);
  const [lessonResult, setLessonResult] = useState<LessonPlanResult | null>(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  // 2. Differentiation State
  const [diffTopic, setDiffTopic] = useState(initialTopic);
  const [diffSubject, setDiffSubject] = useState('Mathematics');
  const [diffResult, setDiffResult] = useState<DifferentiatedMaterialResult | null>(null);
  const [isGeneratingDiff, setIsGeneratingDiff] = useState(false);

  // 3. Exit Ticket State
  const [exitTopic, setExitTopic] = useState(initialTopic);
  const [exitSubject, setExitSubject] = useState('Mathematics');
  const [exitTicketDraft, setExitTicketDraft] = useState<ExitTicketDraft | null>(null);
  const [isGeneratingExit, setIsGeneratingExit] = useState(false);
  const [isPublishingExit, setIsPublishingExit] = useState(false);
  const [exitPublished, setExitPublished] = useState(false);
  const [exitAnalysis, setExitAnalysis] = useState<ExitTicketAnalysisResult | null>(null);
  const [isAnalyzingExit, setIsAnalyzingExit] = useState(false);

  // 4. Explain Differently State
  const [explainTopic, setExplainTopic] = useState(initialTopic);
  const [explainSubject, setExplainSubject] = useState('Mathematics');
  const [explainResult, setExplainResult] = useState<ExplainConceptDifferentlyResult | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // 5. Parent Message State
  const [msgStudentName, setMsgStudentName] = useState(initialStudentName);
  const [msgParentName, setMsgParentName] = useState(initialParentName);
  const [msgTopic, setMsgTopic] = useState(`${initialTopic} Performance Update`);
  const [msgTone, setMsgTone] = useState<'positive' | 'gentle_reminder' | 'support_needed' | 'formal'>('positive');
  const [msgDraft, setMsgDraft] = useState<string | null>(null);
  const [isDraftingMsg, setIsDraftingMsg] = useState(false);

  // Notification Toast
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('✓ Copied to clipboard!');
  };

  // Handlers
  const handleGenerateLesson = async () => {
    if (!lessonTopic.trim()) return;
    setIsGeneratingLesson(true);
    try {
      const res = await generateLessonPlanAction({
        grade: defaultGrade,
        subject: lessonSubject,
        topic: lessonTopic,
        durationMinutes: lessonDuration,
      });
      if (res.success && res.lessonPlan) {
        setLessonResult(res.lessonPlan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleGenerateDiff = async () => {
    if (!diffTopic.trim()) return;
    setIsGeneratingDiff(true);
    try {
      const res = await generateDifferentiatedMaterialAction({
        grade: defaultGrade,
        subject: diffSubject,
        topic: diffTopic,
      });
      if (res.success && res.material) {
        setDiffResult(res.material);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingDiff(false);
    }
  };

  const handleGenerateExitTicket = async () => {
    if (!exitTopic.trim()) return;
    setIsGeneratingExit(true);
    setExitPublished(false);
    setExitAnalysis(null);
    try {
      const res = await generateExitTicketAction({
        grade: defaultGrade,
        subject: exitSubject,
        topic: exitTopic,
      });
      if (res.success && res.exitTicket) {
        setExitTicketDraft(res.exitTicket);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingExit(false);
    }
  };

  const handlePublishExitTicket = async () => {
    if (!exitTicketDraft) return;
    setIsPublishingExit(true);
    try {
      const res = await publishExitTicketAction({
        ...exitTicketDraft,
        section: defaultSection,
      });
      if (res.success) {
        setExitPublished(true);
        showToast(`🎉 Exit Ticket published to Class ${defaultGrade}${defaultSection}!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishingExit(false);
    }
  };

  const handleAnalyzeExitResults = async () => {
    setIsAnalyzingExit(true);
    try {
      const res = await analyzeExitTicketResultsAction(exitTopic);
      if (res.success && res.analysis) {
        setExitAnalysis(res.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingExit(false);
    }
  };

  const handleExplainDifferently = async () => {
    if (!explainTopic.trim()) return;
    setIsExplaining(true);
    try {
      const res = await explainConceptDifferentlyAction(explainSubject, explainTopic);
      if (res.success && res.explanation) {
        setExplainResult(res.explanation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDraftMessage = async () => {
    if (!msgStudentName.trim() || !msgTopic.trim()) return;
    setIsDraftingMsg(true);
    try {
      const res = await draftTeacherParentMessageAction({
        studentName: msgStudentName,
        parentName: msgParentName,
        topic: msgTopic,
        tone: msgTone,
      });
      if (res.success && res.draft) {
        setMsgDraft(res.draft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDraftingMsg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-sm">
              ✨
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-black text-slate-900">
                Teacher AI Toolkit
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pedagogical intelligence &amp; formative checks • Class {defaultGrade}{defaultSection}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Toolkit Nav Tabs */}
        <div className="flex border-b border-slate-100 px-5 pt-3 gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'exit_ticket', label: 'AI Exit Ticket', icon: '⭐' },
            { id: 'explain_differently', label: 'Explain Differently', icon: '🧠' },
            { id: 'lesson', label: '45-Min Lesson Plan', icon: '📖' },
            { id: 'differentiation', label: 'Differentiated Tiers', icon: '🎯' },
            { id: 'parent_message', label: 'Parent Message', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ToolkitTab)}
              className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {feedbackToast && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-in fade-in">
              {feedbackToast}
            </div>
          )}

          {/* ══ TAB: AI EXIT TICKET ══ */}
          {activeTab === 'exit_ticket' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Subject
                  </label>
                  <select
                    value={exitSubject}
                    onChange={(e) => setExitSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science &amp; Physics</option>
                    <option value="English">English Literature</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Topic for Quick 3-Min Check
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={exitTopic}
                      onChange={(e) => setExitTopic(e.target.value)}
                      placeholder="e.g. Equivalent Fractions, Newton's 2nd Law..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateExitTicket}
                      disabled={isGeneratingExit || !exitTopic.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isGeneratingExit ? 'Generating...' : 'Generate Exit Ticket ⭐'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Exit Ticket Questions Preview */}
              {exitTicketDraft && (
                <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100">
                    <div>
                      <span className="text-[10px] font-mono font-extrabold text-indigo-700 uppercase tracking-wide">
                        Exit Ticket Draft • {exitTicketDraft.durationMinutes} Minutes
                      </span>
                      <h4 className="font-display text-sm font-black text-slate-900">
                        {exitTicketDraft.subject}: {exitTicketDraft.topic}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePublishExitTicket}
                        disabled={isPublishingExit || exitPublished}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer flex items-center gap-1.5 ${
                          exitPublished
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                        }`}
                      >
                        <span>{exitPublished ? '✓ Published to Class' : '🚀 Approve & Publish'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAnalyzeExitResults}
                        disabled={isAnalyzingExit}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                      >
                        {isAnalyzingExit ? 'Analyzing...' : '📊 View Class Understanding'}
                      </button>
                    </div>
                  </div>

                  {/* Question Cards */}
                  <div className="space-y-2.5">
                    {exitTicketDraft.questions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs">
                            Q{idx + 1}. {q.question}
                          </span>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[9px] font-bold text-slate-500 uppercase">
                            {q.type.replace('_', ' ')}
                          </span>
                        </div>

                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded-xl border text-[11px] font-medium ${
                                  opt === q.correctAnswer
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                {opt === q.correctAnswer ? '✓ ' : ''}{opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* AI Understanding Diagnostics View */}
                  {exitAnalysis && (
                    <div className="p-4 bg-gradient-to-r from-emerald-50/80 via-white to-white border border-emerald-200/80 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📊</span>
                          <h5 className="font-display text-xs font-black text-slate-900 uppercase tracking-wide">
                            Class Understanding Analysis ({exitAnalysis.totalResponses} Responses)
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          {exitAnalysis.strongUnderstandingPct}% Concept Mastery
                        </span>
                      </div>

                      {/* Progress Distribution Bar */}
                      <div className="space-y-1">
                        <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                          <div
                            style={{ width: `${exitAnalysis.strongUnderstandingPct}%` }}
                            className="bg-emerald-500"
                            title={`Strong: ${exitAnalysis.strongUnderstandingPct}%`}
                          />
                          <div
                            style={{ width: `${exitAnalysis.needsPracticePct}%` }}
                            className="bg-amber-400"
                            title={`Needs Practice: ${exitAnalysis.needsPracticePct}%`}
                          />
                          <div
                            style={{ width: `${exitAnalysis.needsSupportPct}%` }}
                            className="bg-rose-400"
                            title={`Needs Support: ${exitAnalysis.needsSupportPct}%`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold pt-0.5">
                          <span className="text-emerald-700">🟢 {exitAnalysis.strongUnderstandingPct}% Strong</span>
                          <span className="text-amber-700">🟡 {exitAnalysis.needsPracticePct}% Needs Practice</span>
                          <span className="text-rose-700">🔴 {exitAnalysis.needsSupportPct}% Needs Support</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="font-extrabold text-slate-500 uppercase text-[9px] block">AI Teaching Insight:</span>
                          <p className="text-slate-800 font-medium">{exitAnalysis.teachingInsight}</p>
                        </div>
                        <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                          <span className="font-extrabold text-indigo-700 uppercase text-[9px] block">Recommended Next Step:</span>
                          <p className="text-indigo-950 font-bold">{exitAnalysis.recommendedNextStep}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: EXPLAIN THIS DIFFERENTLY ══ */}
          {activeTab === 'explain_differently' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Subject
                  </label>
                  <select
                    value={explainSubject}
                    onChange={(e) => setExplainSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science &amp; Physics</option>
                    <option value="English">English Literature</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Concept to Explain Differently
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={explainTopic}
                      onChange={(e) => setExplainTopic(e.target.value)}
                      placeholder="e.g. Fractions, Photosynthesis, Ohm's Law..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleExplainDifferently}
                      disabled={isExplaining || !explainTopic.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isExplaining ? 'Thinking...' : 'Explain Differently 🧠'}
                    </button>
                  </div>
                </div>
              </div>

              {explainResult && (
                <div className="space-y-3.5 pt-3 border-t border-slate-100 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-extrabold text-slate-900">
                      Alternative Perspective: {explainResult.topic}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(explainResult, null, 2))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      📋 Copy All
                    </button>
                  </div>

                  {/* Simple Explanation */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 flex items-center gap-1">
                      <span>💡</span>
                      <span>Simple Student-Friendly Explanation</span>
                    </span>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {explainResult.simpleExplanation}
                    </p>
                  </div>

                  {/* Real-Life Analogy */}
                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800 flex items-center gap-1">
                      <span>🍕</span>
                      <span>Relatable Real-Life Analogy</span>
                    </span>
                    <p className="text-xs text-amber-950 font-medium leading-relaxed">
                      {explainResult.analogy}
                    </p>
                  </div>

                  {/* Example */}
                  <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-800 flex items-center gap-1">
                      <span>📐</span>
                      <span>Worked Example to Show Class</span>
                    </span>
                    <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                      {explainResult.example}
                    </p>
                  </div>

                  {/* Quick Check Question */}
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 flex items-center gap-1">
                      <span>❓</span>
                      <span>Quick Check Question (Ask the Class)</span>
                    </span>
                    <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                      {explainResult.quickCheckQuestion}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: 45-MIN LESSON PLANNER ══ */}
          {activeTab === 'lesson' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Subject
                  </label>
                  <select
                    value={lessonSubject}
                    onChange={(e) => setLessonSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science &amp; Physics</option>
                    <option value="English">English Literature</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Lesson Topic
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={lessonTopic}
                      onChange={(e) => setLessonTopic(e.target.value)}
                      placeholder="e.g. Algebraic Identities, Photosynthesis..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateLesson}
                      disabled={isGeneratingLesson || !lessonTopic.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isGeneratingLesson ? 'Generating...' : 'Generate Plan ✨'}
                    </button>
                  </div>
                </div>
              </div>

              {lessonResult && (
                <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-sm font-extrabold text-slate-900">
                        {lessonResult.subject}: {lessonResult.topic} ({lessonResult.totalDurationMinutes} min)
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">Class {lessonResult.grade} Structured Lesson</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(lessonResult, null, 2))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      📋 Copy Plan
                    </button>
                  </div>

                  <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 block">
                      Learning Objectives:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 font-medium">
                      {lessonResult.learningObjectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    {lessonResult.sections.map((sec, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {idx + 1}. {sec.title}
                          </span>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-indigo-700">
                            ⏱️ {sec.durationMinutes} min
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">{sec.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="font-extrabold text-slate-500 block text-[9px] uppercase">Teacher Action:</span>
                            <span className="text-slate-800">{sec.teacherAction}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="font-extrabold text-slate-500 block text-[9px] uppercase">Student Action:</span>
                            <span className="text-slate-800">{sec.studentAction}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200/70 rounded-2xl text-xs space-y-1">
                    <span className="font-extrabold text-emerald-800 text-[10px] uppercase tracking-wide block">
                      Exit Assessment Check:
                    </span>
                    <p className="text-emerald-950 font-medium">{lessonResult.assessmentCheck}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: DIFFERENTIATED TEACHING ══ */}
          {activeTab === 'differentiation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Subject
                  </label>
                  <select
                    value={diffSubject}
                    onChange={(e) => setDiffSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science &amp; Physics</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Topic to Differentiate
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={diffTopic}
                      onChange={(e) => setDiffTopic(e.target.value)}
                      placeholder="e.g. Electric Circuits, Linear Equations..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateDiff}
                      disabled={isGeneratingDiff || !diffTopic.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isGeneratingDiff ? 'Generating...' : 'Generate 3 Tiers ✨'}
                    </button>
                  </div>
                </div>
              </div>

              {diffResult && (
                <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🟡</span>
                        <h5 className="font-display text-xs font-black text-amber-900 uppercase tracking-wide">
                          Tier 1: Support Level
                        </h5>
                      </div>
                      <p className="text-[11px] text-amber-800 font-medium">{diffResult.supportLevel.scaffolding}</p>
                      <div className="space-y-1 pt-1">
                        <span className="text-[9px] font-extrabold uppercase text-amber-700 block">Practice Tasks:</span>
                        {diffResult.supportLevel.practiceTasks.map((t, i) => (
                          <p key={i} className="text-[11px] text-slate-800 bg-white p-2 rounded-xl border border-amber-100">
                            • {t}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🟢</span>
                        <h5 className="font-display text-xs font-black text-indigo-900 uppercase tracking-wide">
                          Tier 2: Standard Level
                        </h5>
                      </div>
                      <p className="text-[11px] text-indigo-800 font-medium">{diffResult.standardLevel.coreConcept}</p>
                      <div className="space-y-1 pt-1">
                        <span className="text-[9px] font-extrabold uppercase text-indigo-700 block">Practice Tasks:</span>
                        {diffResult.standardLevel.practiceTasks.map((t, i) => (
                          <p key={i} className="text-[11px] text-slate-800 bg-white p-2 rounded-xl border border-indigo-100">
                            • {t}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🟣</span>
                        <h5 className="font-display text-xs font-black text-purple-900 uppercase tracking-wide">
                          Tier 3: Challenge Level
                        </h5>
                      </div>
                      <p className="text-[11px] text-purple-800 font-medium">{diffResult.challengeLevel.extensionTopic}</p>
                      <div className="space-y-1 pt-1">
                        <span className="text-[9px] font-extrabold uppercase text-purple-700 block">Extension Tasks:</span>
                        {diffResult.challengeLevel.higherOrderTasks.map((t, i) => (
                          <p key={i} className="text-[11px] text-slate-800 bg-white p-2 rounded-xl border border-purple-100">
                            • {t}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: PARENT MESSAGE DRAFTER ══ */}
          {activeTab === 'parent_message' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={msgStudentName}
                    onChange={(e) => setMsgStudentName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Tone
                  </label>
                  <select
                    value={msgTone}
                    onChange={(e) => setMsgTone(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="positive">🌟 Positive Recognition</option>
                    <option value="support_needed">🤝 Support / Revision Needed</option>
                    <option value="gentle_reminder">⏰ Gentle Submission Reminder</option>
                    <option value="formal">📄 Formal Academic Update</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Message Topic / Subject Matter
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={msgTopic}
                      onChange={(e) => setMsgTopic(e.target.value)}
                      placeholder="e.g. Mathematics chapter performance, attendance follow-up..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleDraftMessage}
                      disabled={isDraftingMsg || !msgTopic.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isDraftingMsg ? 'Drafting...' : 'Draft Message ✨'}
                    </button>
                  </div>
                </div>
              </div>

              {msgDraft && (
                <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                      Review Draft Message (Teacher Decision Authority):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msgDraft)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      📋 Copy Draft
                    </button>
                  </div>

                  <textarea
                    value={msgDraft}
                    onChange={(e) => setMsgDraft(e.target.value)}
                    rows={6}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 leading-relaxed focus:outline-none focus:border-indigo-600"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
