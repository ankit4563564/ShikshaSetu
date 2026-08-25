'use client';

import React, { useState } from 'react';
import { submitExitTicketResponseAction } from '@/app/actions/teacherAiActions';

interface StudentExitTicketWidgetProps {
  studentId: string;
  studentName: string;
  topic?: string;
  subject?: string;
  questions?: Array<{
    id: string;
    question: string;
    type: 'multiple_choice' | 'short_answer' | 'application';
    options?: string[];
  }>;
}

export default function StudentExitTicketWidget({
  studentId,
  studentName,
  topic = 'Fractions & Decimals',
  subject = 'Mathematics',
  questions = [
    {
      id: 'q-1',
      question: 'Which of the following is equivalent to 3/4?',
      type: 'multiple_choice',
      options: ['6/8', '2/3', '5/6', '9/10'],
    },
    {
      id: 'q-2',
      question: 'What is 0.5 expressed as a fraction in simplest form?',
      type: 'multiple_choice',
      options: ['1/2', '2/5', '5/10', '1/5'],
    },
    {
      id: 'q-3',
      question: 'In one sentence, explain how you simplify a fraction.',
      type: 'short_answer',
    },
  ],
}: StudentExitTicketWidgetProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectOption = (qId: string, opt: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const handleTextChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitExitTicketResponseAction(
        'et-live-1',
        studentId,
        studentName,
        answers
      );
      if (res.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit exit ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-1.5 text-center animate-in fade-in">
        <div className="text-xl">🎉</div>
        <h4 className="font-display text-xs font-black text-emerald-900">
          Quick Check Completed!
        </h4>
        <p className="text-[11px] text-emerald-800 font-medium">
          Your answers for <strong>{topic}</strong> were submitted to your teacher.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-white to-white p-4 space-y-3.5 shadow-2xs"
    >
      <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-700 block">
              Quick Concept Check • {subject}
            </span>
            <h4 className="font-display text-xs sm:text-sm font-black text-slate-900">
              {topic}
            </h4>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 font-mono text-[9px] font-bold text-indigo-700">
          ⏱️ 2–3 mins
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={q.id} className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 block">
              {idx + 1}. {q.question}
            </label>

            {q.type === 'multiple_choice' && q.options && (
              <div className="grid grid-cols-2 gap-1.5">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`p-2 rounded-xl text-left text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type !== 'multiple_choice' && (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
                placeholder="Type your brief answer..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || Object.keys(answers).length < 2}
        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition shadow-sm active:scale-98 disabled:opacity-40 cursor-pointer"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Quick Check →'}
      </button>
    </form>
  );
}
