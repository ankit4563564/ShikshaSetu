'use client';

import { motion } from 'framer-motion';

interface SchoolGPTMessageProps {
  role: 'user' | 'assistant';
  content: string;
  userQuery?: string;
  sources?: string[];
  confidence?: 'HIGH' | 'MEDIUM' | 'GENERAL' | 'LIMITED';
}

export default function SchoolGPTMessage({
  role,
  content,
  sources = ['School Telemetry Database', 'Live Student Portal'],
  confidence = 'HIGH',
}: SchoolGPTMessageProps) {
  const isUser = role === 'user';

  const confidenceBadge = {
    HIGH: { label: 'Verified Source (High Confidence)', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    MEDIUM: { label: 'Knowledge Engine (Medium Confidence)', style: 'bg-sky-50 text-sky-800 border-sky-200' },
    GENERAL: { label: 'General Knowledge', style: 'bg-purple-50 text-purple-800 border-purple-200' },
    LIMITED: { label: 'Offline Fallback Context', style: 'bg-amber-50 text-amber-800 border-amber-200' },
  };

  // Helper to format bold markdown text, lists, and line breaks cleanly
  const renderFormattedContent = (text: string) => {
    if (!text) return null;

    const paragraphs = text.split('\n\n');
    return paragraphs.map((para, i) => {
      // Check for bullet points or lists
      if (para.includes('\n•') || para.includes('\n-') || para.startsWith('•') || para.startsWith('-')) {
        const lines = para.split('\n');
        return (
          <ul key={i} className="list-disc list-inside space-y-1 my-2 font-medium text-slate-800">
            {lines.map((line, idx) => {
              const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
              if (!cleanLine) return null;
              return <li key={idx}>{renderBoldText(cleanLine)}</li>;
            })}
          </ul>
        );
      }

      return (
        <p key={i} className="leading-relaxed font-medium my-2 text-slate-800 text-xs sm:text-sm">
          {renderBoldText(para)}
        </p>
      );
    });
  };

  const renderBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full py-3 ${
        isUser
          ? 'border-b border-slate-100'
          : 'bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 sm:p-6 my-3 shadow-2xs'
      }`}
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
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
            <span className="font-display text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <span>{isUser ? 'User Request' : 'SchoolGPT Adaptive Assistant'}</span>
            </span>
            {!isUser && confidence && (
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${confidenceBadge[confidence].style}`}>
                ● {confidenceBadge[confidence].label}
              </span>
            )}
          </div>

          {/* Message View */}
          {isUser ? (
            <p className="font-display text-sm font-extrabold text-slate-900 leading-relaxed">
              {content}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
                {renderFormattedContent(content)}
              </div>

              {/* Verified Sources Chips */}
              {sources && sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Verified Evidence Sources &amp; Telemetry
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((src) => (
                      <span
                        key={src}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
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
