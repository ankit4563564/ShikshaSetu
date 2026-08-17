'use client';

import { useState } from 'react';
import { generateHomeworkDraftAction, HomeworkDraftResult, HomeworkQuestion } from '@/app/actions/teacherAiActions';
import { publishHomeworkAssignmentAction } from '@/app/actions/homeworkActions';

interface AiHomeworkModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onPublished?: () => void;
  readonly defaultGrade?: string;
  readonly defaultSection?: string;
}

export default function AiHomeworkModal({ isOpen, onClose, onPublished, defaultGrade, defaultSection }: AiHomeworkModalProps) {
  // Input Form State
  const [grade, setGrade] = useState(defaultGrade || '8');
  const [section, setSection] = useState(defaultSection || 'A');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Linear Equations');
  const [lessonNotes, setLessonNotes] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Generation & Draft State
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<HomeworkDraftResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    const res = await generateHomeworkDraftAction({
      grade,
      subject,
      topic,
      lessonNotes,
      difficulty,
    });

    setIsGenerating(false);

    if (res.success && res.draft) {
      setDraft(res.draft);
    } else {
      setError(res.error || 'Failed to generate homework draft.');
    }
  };

  const handleQuestionChange = (index: number, updatedQuestion: string) => {
    if (!draft) return;
    const updatedQuestions = [...draft.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], question: updatedQuestion };
    setDraft({ ...draft, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (index: number) => {
    if (!draft) return;
    const updatedQuestions = draft.questions.filter((_, i) => i !== index);
    setDraft({ ...draft, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    if (!draft) return;
    const newQ: HomeworkQuestion = {
      question: 'New question description...',
      type: 'short_answer',
      difficulty: 'medium',
      marks: 5,
    };
    setDraft({ ...draft, questions: [...draft.questions, newQ] });
  };

  const handlePublish = async () => {
    if (!draft) return;
    setIsPublishing(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', draft.title);
    formData.append('subject', draft.subject);
    formData.append('grade', draft.grade || grade);
    formData.append('section', section);
    formData.append('instructions', draft.instructions);

    const res = await publishHomeworkAssignmentAction(formData);
    setIsPublishing(false);

    if (res.success) {
      setSuccessMessage(`Published homework to ${res.count} students!`);
      setTimeout(() => {
        setSuccessMessage(null);
        setDraft(null);
        onClose();
        if (onPublished) onPublished();
      }, 1500);
    } else {
      setError(res.error || 'Failed to publish homework assignment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] font-extrabold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              AI Homework Assistant
            </span>
            <h3 className="font-display text-lg font-black text-slate-900 mt-1">
              {draft ? 'Review & Edit Assignment Draft' : 'Generate Homework from Lesson Notes'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
              ⚠️ {error}
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              ✓ {successMessage}
            </div>
          )}

          {/* STAGE 1: INPUT LESSON NOTES */}
          {!draft && (
            <form onSubmit={handleGenerateDraft} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold bg-white"
                  >
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Linear Equations"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Today's Class / Lesson Notes</label>
                <textarea
                  rows={5}
                  value={lessonNotes}
                  onChange={(e) => setLessonNotes(e.target.value)}
                  placeholder="Paste or type class summary, formulas covered, or key concepts taught today..."
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Difficulty:</span>
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                        difficulty === d ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating Draft...' : '✨ Generate Draft with AI'}
                </button>
              </div>
            </form>
          )}

          {/* STAGE 2: TEACHER REVIEW & EDIT DRAFT */}
          {draft && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignment Title</label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-black text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructions</label>
                  <textarea
                    rows={2}
                    value={draft.instructions}
                    onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 bg-white"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-400">
                    Questions ({draft.questions.length})
                  </h4>
                  <button
                    onClick={handleAddQuestion}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-3">
                  {draft.questions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Q{idx + 1} ({q.marks} Marks)</span>
                        <button
                          onClick={() => handleDeleteQuestion(idx)}
                          className="text-[10px] font-bold text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  ← Back to Input
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-black transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {isPublishing ? 'Publishing...' : '✓ Publish Homework'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
