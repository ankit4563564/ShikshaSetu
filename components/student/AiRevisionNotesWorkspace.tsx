'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateRevisionNotesAction,
  explainConceptSimplyAction,
  generateRevisionQuizAction,
  saveRevisionNoteAction,
  getSavedRevisionNotesAction,
  deleteSavedRevisionNoteAction,
  type RevisionNoteData,
  type ExplainConceptResult,
  type RevisionQuizQuestion,
} from '@/app/actions/revisionNotesActions';

const PRESET_TOPICS: Record<string, string[]> = {
  Mathematics: [
    'Fractions & Decimals',
    'Linear Equations in One Variable',
    'Algebraic Expressions & Identities',
    'Squares & Square Roots',
    'Mensuration & Area',
  ],
  Science: [
    'Photosynthesis & Plant Nutrition',
    'Electricity & Electric Circuits',
    'Light: Reflection & Refraction',
    'Cell — Structure & Functions',
    'Force and Pressure',
  ],
  English: [
    'Tenses & Subject-Verb Agreement',
    'Direct & Indirect Speech',
    'Active and Passive Voice',
    'Reading Comprehension Strategies',
  ],
  'Social Studies': [
    'The Indian Constitution & Preamble',
    'Resources & Sustainable Development',
    'Understanding Secularism',
    'Tribals, Dikus and Golden Age',
  ],
};

interface AiRevisionNotesWorkspaceProps {
  initialSubject?: string;
  initialTopic?: string;
  onAskTutor?: (context: { topic: string; subject: string; concept?: string; actionType?: string }) => void;
}

export default function AiRevisionNotesWorkspace({
  initialSubject = 'Mathematics',
  initialTopic = 'Fractions & Decimals',
  onAskTutor,
}: AiRevisionNotesWorkspaceProps) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [customNotes, setCustomNotes] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Active Note State
  const [currentNotes, setCurrentNotes] = useState<RevisionNoteData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Concept Explanation State
  const [activeConceptExplanation, setActiveConceptExplanation] = useState<ExplainConceptResult | null>(null);
  const [isExplainingConcept, setIsExplainingConcept] = useState(false);

  // Quiz State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<RevisionQuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Shortened bullet mode
  const [isShortenedMode, setIsShortenedMode] = useState(false);

  // Saved Notes Library Modal
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [savedNotesList, setSavedNotesList] = useState<RevisionNoteData[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Generate Notes on initial load or on topic change
  const handleGenerateNotes = async (subj = selectedSubject, top = selectedTopic, notes = customNotes) => {
    setIsGenerating(true);
    setIsShortenedMode(false);
    setIsQuizOpen(false);
    setQuizSubmitted(false);
    setActiveConceptExplanation(null);
    setIsSaved(false);

    try {
      const res = await generateRevisionNotesAction({
        subject: subj,
        topic: top,
        grade: '8',
        customNotes: notes.trim() || undefined,
      });

      if (res.success && res.notes) {
        setCurrentNotes(res.notes);
      }
    } catch (err) {
      console.error('Failed to generate revision notes:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerateNotes(selectedSubject, selectedTopic);
  }, [selectedSubject, selectedTopic]);

  const handleExplainConcept = async (concept: string) => {
    if (!currentNotes) return;
    setIsExplainingConcept(true);
    try {
      const res = await explainConceptSimplyAction(concept, currentNotes.title, currentNotes.subject);
      if (res.success && res.result) {
        setActiveConceptExplanation(res.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplainingConcept(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!currentNotes) return;
    setIsGeneratingQuiz(true);
    setIsQuizOpen(true);
    setQuizSubmitted(false);
    setUserAnswers({});

    try {
      const notesSummary = `${currentNotes.keyIdea}. Definitions: ${currentNotes.definitions.map((d) => `${d.term}: ${d.definition}`).join('. ')}. Example: ${currentNotes.example}. Common Mistake: ${currentNotes.commonMistake}`;
      const res = await generateRevisionQuizAction(currentNotes.title, notesSummary);
      if (res.success && res.questions) {
        setQuizQuestions(res.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNotes) return;
    const res = await saveRevisionNoteAction(currentNotes);
    if (res.success) {
      setIsSaved(true);
      showToast('✓ Saved to your Revision Library!');
    }
  };

  const handleOpenLibrary = async () => {
    const res = await getSavedRevisionNotesAction();
    if (res.success) {
      setSavedNotesList(res.notes);
    }
    setIsLibraryOpen(true);
  };

  const handleDeleteSavedNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSavedRevisionNoteAction(id);
    setSavedNotesList((prev) => prev.filter((n) => n.id !== id));
    showToast('Note removed from library');
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const isMathFractions = selectedTopic.toLowerCase().includes('fraction');

  return (
    <div className="space-y-6 font-body text-slate-900 pb-12">
      {/* ── Top Controls / Context Banner Bar ── */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-xs font-black">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-black text-slate-900">
                  AI Revision Notes
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold">
                  ✦ RECOMMENDED FOR YOU
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isMathFractions
                  ? 'Your recent check showed that Equivalent Fractions needs a 5-minute visual review.'
                  : `Structured revision prepared for Class 8 ${selectedSubject} &middot; ${selectedTopic}`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleOpenLibrary}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>📁</span>
              <span>My Saved Notes</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-indigo-200/80"
            >
              <span>{isCustomMode ? '📂 Preset Topics' : '✏️ Paste Notes'}</span>
            </button>
          </div>
        </div>

        {/* Preset Selector vs Custom Input */}
        {!isCustomMode ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    const newSubj = e.target.value;
                    setSelectedSubject(newSubj);
                    const firstTopic = PRESET_TOPICS[newSubj]?.[0] || 'Core Chapter';
                    setSelectedTopic(firstTopic);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  {Object.keys(PRESET_TOPICS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Chapter / Topic
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {(PRESET_TOPICS[selectedSubject] || []).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleGenerateNotes(selectedSubject, selectedTopic)}
                    disabled={isGenerating}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isGenerating ? 'Synthesizing...' : 'Revise Topic ✨'}
                  </button>
                </div>
              </div>
            </div>

            {/* SchoolMitra Context Provenance Strip */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-3">
                <span className="font-bold text-indigo-700 flex items-center gap-1">
                  <span>✦</span>
                  <span>SchoolMitra revision prepared from:</span>
                </span>
                <span>✓ Class 8 {selectedSubject} syllabus</span>
                <span>✓ Selected chapter core</span>
                <span>✓ Recent learning activity</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Class 8 &middot; CBSE / NCERT aligned</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                placeholder="Subject (e.g. Physics, Chemistry)"
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
              <input
                type="text"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                placeholder="Chapter / Topic Title"
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={3}
              placeholder="Paste your classroom notes, textbook summary, or specific questions here for grounded revision..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={() => handleGenerateNotes(selectedSubject, selectedTopic, customNotes)}
              disabled={isGenerating || !selectedTopic.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? 'Extracting Notes...' : 'Generate Grounded Notes ✨'}
            </button>
          </div>
        )}
      </section>

      {/* ── Toast Alert ── */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs rounded-2xl text-center shadow-xs animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* ── Active Revision Notes View ── */}
      {isGenerating ? (
        <div className="bg-white/90 rounded-3xl p-10 border border-indigo-100 text-center space-y-4 shadow-sm backdrop-blur-xl animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white mx-auto flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-500/25">
            ✨
          </div>
          <div>
            <p className="font-display text-base font-black text-slate-900">
              Synthesizing key revision concepts for {selectedTopic}...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Extracting core formulas, high-yield definitions, and common exam traps.
            </p>
          </div>
        </div>
      ) : currentNotes ? (
        <div className="space-y-6">
          {/* Header & Quick Action Bar */}
          <div className="bg-white/90 rounded-3xl p-6 border border-slate-200/80 shadow-sm backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full inline-block mb-2">
                {currentNotes.subject} &middot; Class {currentNotes.grade || '8'} Digital Notebook
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentNotes.title}
              </h1>
            </div>

            {/* Revision Action Tools */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartQuiz}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs transition shadow-md shadow-purple-500/20 cursor-pointer flex items-center gap-2"
              >
                <span>🧠</span>
                <span>Quiz Me</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsShortenedMode(!isShortenedMode)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                  isShortenedMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>⚡</span>
                <span>{isShortenedMode ? 'Full Notebook' : '1-Min Cheat Sheet'}</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveNote}
                disabled={isSaved}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{isSaved ? '✓ Saved' : '💾 Save Note'}</span>
              </motion.button>
            </div>
          </div>

          {/* Shortened Cheat-Sheet Mode */}
          {isShortenedMode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-amber-50/90 to-amber-100/50 rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚡</span>
                <h3 className="font-display text-sm font-black text-amber-950 uppercase tracking-wider">
                  1-Minute Quick Recap Cheat Sheet
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-amber-950 font-medium">
                <li className="flex items-start gap-2.5 bg-white/70 p-3 rounded-2xl border border-amber-200/60">
                  <span className="font-extrabold text-amber-800 shrink-0">• Key Idea:</span>
                  <span className="font-bold text-slate-900">{currentNotes.keyIdea}</span>
                </li>
                {currentNotes.formulaOrEquation && (
                  <li className="flex items-start gap-2.5 bg-white/70 p-3 rounded-2xl border border-amber-200/60">
                    <span className="font-extrabold text-amber-800 shrink-0">• Formula:</span>
                    <span className="font-mono bg-slate-900 text-emerald-400 font-bold px-2.5 py-1 rounded-lg text-xs">
                      {currentNotes.formulaOrEquation}
                    </span>
                  </li>
                )}
                {currentNotes.rememberThis.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 bg-white/70 p-3 rounded-2xl border border-amber-200/60">
                    <span className="font-extrabold text-amber-800 shrink-0">• Point {i + 1}:</span>
                    <span className="text-slate-800">{r}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2.5 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  <span className="font-extrabold text-rose-700 shrink-0">• Avoid Trap:</span>
                  <span className="font-semibold text-rose-900">{currentNotes.commonMistake}</span>
                </li>
              </ul>
            </motion.div>
          ) : (
            /* Standard Full Structured Notes View */
            <div className="space-y-5">
              {/* 🔑 Key Idea Hero Card */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-3xl p-6 sm:p-7 shadow-md shadow-indigo-500/20 space-y-2.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔑</span>
                  <h3 className="font-display text-[11px] font-black uppercase tracking-widest text-indigo-200">
                    The Big Core Idea
                  </h3>
                </div>
                <p className="text-base sm:text-lg font-black text-white leading-relaxed">
                  {currentNotes.keyIdea}
                </p>
              </div>

              {/* 📌 Interactive Important Concepts Chips */}
              <div className="bg-white/90 rounded-3xl p-6 border border-slate-200/80 shadow-sm backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📌</span>
                    <h3 className="font-display text-xs font-black text-slate-900 uppercase tracking-wider">
                      Important Concepts
                    </h3>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Tap any concept for instant breakdown
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {currentNotes.importantConcepts.map((concept) => (
                    <motion.button
                      key={concept}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleExplainConcept(concept)}
                      className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/90 hover:border-indigo-300 text-xs font-extrabold text-slate-800 hover:text-indigo-700 transition cursor-pointer flex items-center gap-2 group shadow-2xs"
                    >
                      <span>{concept}</span>
                      <span className="text-[11px] text-indigo-500 font-bold">✨</span>
                    </motion.button>
                  ))}
                </div>

                {/* Instant Concept Explainer Drawer */}
                {isExplainingConcept && (
                  <div className="p-4 bg-indigo-50/70 rounded-2xl text-xs text-indigo-700 font-bold animate-pulse border border-indigo-100">
                    SchoolMitra is preparing simple explanation and real-life analogy...
                  </div>
                )}
                {activeConceptExplanation && !isExplainingConcept && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white rounded-2xl border border-purple-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                      <span className="font-display text-xs font-black text-purple-950 uppercase flex items-center gap-2">
                        <span>💡</span>
                        <span>Concept Focus: {activeConceptExplanation.concept}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveConceptExplanation(null)}
                        className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-slate-900 font-medium leading-relaxed">
                      {activeConceptExplanation.simpleExplanation}
                    </p>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                      <span className="font-extrabold block text-[10px] uppercase text-amber-800 mb-1">🍕 Real-Life Analogy:</span>
                      {activeConceptExplanation.analogy}
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                      <span className="font-extrabold block text-[10px] uppercase text-emerald-800 mb-1">❓ Quick Check:</span>
                      {activeConceptExplanation.checkQuestion}
                    </div>

                    {onAskTutor && (
                      <button
                        type="button"
                        onClick={() => onAskTutor({
                          topic: currentNotes.title,
                          subject: currentNotes.subject,
                          concept: activeConceptExplanation.concept,
                          actionType: 'explain',
                        })}
                        className="text-xs font-extrabold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        Ask SchoolMitra for more examples &rarr;
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              {/* 📖 Important Definitions */}
              <div className="bg-white/90 rounded-3xl p-6 border border-slate-200/80 shadow-sm backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  <h3 className="font-display text-xs font-black text-slate-900 uppercase tracking-wider">
                    Core Definitions
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentNotes.definitions.map((def, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                      <span className="text-xs font-black text-indigo-900 block">{def.term}</span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{def.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ⚡ Remember This & 🧮 Formula Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white/90 rounded-3xl p-6 border border-slate-200/80 shadow-sm backdrop-blur-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <h3 className="font-display text-xs font-black text-slate-900 uppercase tracking-wider">
                      Exam High-Yield Pointers
                    </h3>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                    {currentNotes.rememberThis.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-emerald-600 font-black mt-0.5">✓</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/90 rounded-3xl p-6 border border-slate-200/80 shadow-sm backdrop-blur-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧮</span>
                    <h3 className="font-display text-xs font-black text-slate-900 uppercase tracking-wider">
                      Essential Formula / Rule
                    </h3>
                  </div>
                  {currentNotes.formulaOrEquation ? (
                    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-400 font-mono text-sm sm:text-base font-bold text-center tracking-wider overflow-x-auto shadow-inner">
                      {currentNotes.formulaOrEquation}
                    </div>
                  ) : (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 font-medium italic text-center">
                      Conceptual chapter: master definition rules, steps, and classifications.
                    </div>
                  )}
                </div>
              </div>

              {/* 💡 Worked Example & ⚠️ Common Mistake */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-emerald-50/80 rounded-3xl p-6 border border-emerald-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <h3 className="font-display text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Step-by-Step Worked Example
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-emerald-100">
                    {currentNotes.example}
                  </p>
                </div>

                <div className="bg-rose-50/80 rounded-3xl p-6 border border-rose-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <h3 className="font-display text-xs font-black text-rose-950 uppercase tracking-wider">
                      Common Exam Pitfall to Avoid
                    </h3>
                  </div>
                  <p className="text-xs text-rose-950 font-semibold leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-rose-100">
                    {currentNotes.commonMistake}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══ QUIZ ME / CONCEPT CHECK COMPONENT ══ */}
          {isQuizOpen && (
            <div className="p-6 bg-white rounded-3xl border border-purple-200 shadow-lg space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧠</span>
                  <div>
                    <h3 className="font-display text-sm font-black text-slate-900">
                      Quick Concept Check: {currentNotes.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      3 targeted diagnostic questions generated from this chapter
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuizOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {isGeneratingQuiz ? (
                <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
                  SchoolMitra is generating diagnostic questions...
                </div>
              ) : quizQuestions.length > 0 ? (
                <div className="space-y-4">
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        Q{idx + 1}. {q.question}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isSelected = userAnswers[q.id] === opt;
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={quizSubmitted}
                              onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                              className={`p-2.5 rounded-xl text-left text-xs font-medium border transition cursor-pointer ${
                                quizSubmitted
                                  ? isCorrect
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                                    : isSelected
                                    ? 'bg-rose-100 border-rose-300 text-rose-950 font-bold'
                                    : 'bg-white border-slate-200 text-slate-500 opacity-60'
                                  : isSelected
                                  ? 'bg-purple-600 border-purple-600 text-white font-bold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700">
                          <span className="font-bold text-indigo-700">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(userAnswers).length < quizQuestions.length}
                      className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition shadow-sm disabled:opacity-40 cursor-pointer"
                    >
                      Submit Check &amp; Evaluate Understanding &rarr;
                    </button>
                  ) : (
                    /* AI Evaluation & Next Action Recommendation */
                    <div className="p-5 bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white rounded-2xl border border-purple-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
                        <div>
                          <span className="text-xs font-extrabold text-purple-950 block">
                            Concept Mastery: {calculateScore()} / {quizQuestions.length} Correct
                          </span>
                          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                            {calculateScore() === quizQuestions.length
                              ? '🎉 Perfect understanding! You are ready for the next topic.'
                              : '💡 Looks like this concept needs another look before moving to applications.'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          calculateScore() === quizQuestions.length
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {calculateScore() === quizQuestions.length ? 'Mastery Achieved' : 'Needs Practice'}
                        </span>
                      </div>

                      {/* Next Action recommendation */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                        <span className="text-xs text-slate-600 font-medium">
                          {calculateScore() === quizQuestions.length
                            ? 'Next recommended chapter: Linear Equations in One Variable'
                            : 'Recommended: Review the common mistakes and worked examples above.'}
                        </span>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {calculateScore() < quizQuestions.length && onAskTutor && (
                            <button
                              type="button"
                              onClick={() => onAskTutor({
                                topic: currentNotes.title,
                                subject: currentNotes.subject,
                                actionType: 'hint',
                              })}
                              className="px-3.5 py-2 bg-white border border-purple-200 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-50 cursor-pointer"
                            >
                              💡 Ask Mitra for Help
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={handleStartQuiz}
                            className="px-3.5 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 cursor-pointer"
                          >
                            Retake Check 🔄
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {/* ── SAVED NOTES LIBRARY MODAL ── */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-lg">📁</span>
                <h3 className="font-display text-sm font-black text-slate-900">
                  My Revision Notes Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-2.5">
              {savedNotesList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No saved revision notes yet. Click &quot;💾 Save Note&quot; on any topic!
                </div>
              ) : (
                savedNotesList.map((note) => (
                  <div
                    key={note.id || note.title}
                    onClick={() => {
                      setCurrentNotes(note);
                      setSelectedSubject(note.subject);
                      setSelectedTopic(note.title);
                      setIsLibraryOpen(false);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-indigo-50/70 rounded-2xl border border-slate-200/80 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 block">
                        {note.subject}
                      </span>
                      <h4 className="font-display text-xs font-extrabold text-slate-900">
                        {note.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 group-hover:text-indigo-600 font-bold">
                        Open &rarr;
                      </span>
                      <button
                        type="button"
                        onClick={(e) => note.id && handleDeleteSavedNote(note.id, e)}
                        className="text-slate-300 hover:text-rose-500 text-xs p-1 cursor-pointer"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
