'use client';

import { motion } from 'framer-motion';

interface SchoolGPTMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  confidence?: 'HIGH' | 'MEDIUM' | 'GENERAL' | 'LIMITED';
}

export default function SchoolGPTMessage({ role, content, sources, confidence = 'HIGH' }: SchoolGPTMessageProps) {
  const isUser = role === 'user';

  const confidenceBadge = {
    HIGH: { label: 'High Confidence (Verified School Telemetry)', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    MEDIUM: { label: 'Medium Confidence (Knowledge Engine)', style: 'bg-sky-50 text-sky-800 border-sky-200' },
    GENERAL: { label: 'General Knowledge (AI Core)', style: 'bg-purple-50 text-purple-800 border-purple-200' },
    LIMITED: { label: 'Limited Offline Context', style: 'bg-amber-50 text-amber-800 border-amber-200' },
  };

  const paragraphs = content.split('\n\n');
  const heroAnswer = paragraphs[0];
  const supportingExplanation = paragraphs.slice(1).join('\n\n');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full py-4 ${isUser ? 'border-b border-slate-100' : 'bg-slate-50/50 border border-slate-200/80 rounded-3xl p-5 sm:p-6 my-3 shadow-2xs'}`}
    >
      <div className="flex gap-3.5 items-start">
        {/* Avatar */}
        <div
          className={`h-9 w-9 rounded-2xl flex items-center justify-center font-display text-xs font-black select-none shrink-0 shadow-2xs ${
            isUser ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs'
          }`}
        >
          {isUser ? 'U' : '✨'}
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          {/* Role Header & Confidence Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
            <span className="font-display text-xs font-black uppercase tracking-widest text-slate-700">
              {isUser ? 'You (Query)' : 'SchoolGPT AI Intelligence Workspace'}
            </span>
            {!isUser && confidence && (
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${confidenceBadge[confidence].style}`}>
                ● {confidenceBadge[confidence].label}
              </span>
            )}
          </div>

          {isUser ? (
            <p className="font-display text-sm font-extrabold text-slate-900 leading-relaxed">
              {content}
            </p>
          ) : (
            <div className="space-y-4">
              {/* Executive Summary Cards (Top of Response) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
                  <strong className="text-xs font-extrabold text-emerald-700 block">95% Verified</strong>
                </div>
                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Homework</span>
                  <strong className="text-xs font-extrabold text-slate-900 block">88% Submitted</strong>
                </div>
                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Participation</span>
                  <strong className="text-xs font-extrabold text-slate-900 block">High (89%)</strong>
                </div>
                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Growth</span>
                  <strong className="text-xs font-extrabold text-emerald-700 block">↗ +7% Term 3</strong>
                </div>
              </div>

              {/* Main Executive Answer */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
                <h5 className="font-display text-sm font-extrabold tracking-tight text-slate-900 leading-snug">
                  {heroAnswer}
                </h5>

                {supportingExplanation && (
                  <p className="font-body text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium pt-1 border-t border-slate-100">
                    {supportingExplanation}
                  </p>
                )}
              </div>

              {/* Perplexity-style Evidence Sources */}
              {sources && sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Verified Evidence Sources &amp; Telemetry
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((src) => (
                      <span
                        key={src}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
                      >
                        <span>📄</span>
                        <span>{src}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
