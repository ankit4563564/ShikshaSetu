'use client';

import { motion } from 'framer-motion';

interface SchoolGPTMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  confidence?: 'HIGH' | 'MEDIUM' | 'GENERAL' | 'LIMITED';
}

export default function SchoolGPTMessage({ role, content, sources, confidence }: SchoolGPTMessageProps) {
  const isUser = role === 'user';

  const confidenceBadge = {
    HIGH: { label: 'High Confidence (Verified Database)', style: 'bg-emerald-50/50 text-emerald-700 border-emerald-200/50' },
    MEDIUM: { label: 'Medium Confidence (Demo Knowledge)', style: 'bg-blue-50/50 text-blue-700 border-blue-200/50' },
    GENERAL: { label: 'General Knowledge (AI Core)', style: 'bg-purple-50/50 text-purple-700 border-purple-200/50' },
    LIMITED: { label: 'Feature Integration Offline', style: 'bg-amber-50/50 text-amber-700 border-amber-200/50' },
  };

  const paragraphs = content.split('\n\n');
  const heroAnswer = paragraphs[0];
  const supportingExplanation = paragraphs.slice(1).join('\n\n');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full py-3.5 border-b border-deep-teal/[0.07] last:border-0"
    >
      <div className="flex gap-3 md:gap-3.5 items-start">
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center font-display text-sm font-semibold select-none flex-shrink-0 ring-1 ring-inset ${
            isUser ? 'bg-deep-teal/10 text-deep-teal' : 'bg-marigold/10 text-marigold border border-marigold/20'
          }`}
        >
          {isUser ? 'U' : '✨'}
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-[11px] font-black uppercase tracking-[0.14em] text-deep-teal/82">
              {isUser ? 'You' : 'SchoolGPT'}
            </span>
            {!isUser && confidence && confidenceBadge[confidence] && (
              <span className={`text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-full border ${confidenceBadge[confidence].style}`}>
                ● {confidenceBadge[confidence].label}
              </span>
            )}
          </div>

          {isUser ? (
            <p className="font-body text-xs md:text-sm text-deep-teal/95 font-semibold whitespace-pre-line leading-relaxed">
              {content}
            </p>
          ) : (
            <div className="space-y-2.5">
              <h5 className="font-display text-base md:text-[17px] font-extrabold tracking-[-0.02em] text-deep-teal/96 leading-snug">
                {heroAnswer}
              </h5>

              {supportingExplanation && (
                <p className="font-body text-xs md:text-sm text-deep-teal/78 leading-relaxed whitespace-pre-line">
                  {supportingExplanation}
                </p>
              )}

              {sources && sources.length > 0 && (
                <div className="pt-2 border-t border-deep-teal/10 mt-2.5">
                  <span className="text-[9px] font-black text-deep-teal/58 uppercase tracking-[0.14em] block mb-1.5">
                    Sources
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sources.map((src) => (
                      <span
                        key={src}
                        className="inline-flex items-center gap-1 rounded-lg border border-deep-teal/10 bg-deep-teal/[0.05] px-2.5 py-1 text-[10px] font-semibold text-deep-teal/74"
                      >
                        📁 {src}
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
