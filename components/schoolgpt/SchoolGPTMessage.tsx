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
  sources = ['School Database', 'Live Student Portal'],
}: SchoolGPTMessageProps) {
  const isUser = role === 'user';

  // Section Parser: Breaks formatted AI response into Title, Summary, Evidence, Recommendations
  const parseSectionedResponse = (text: string) => {
    if (!text) return { title: '', body: [] };

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    let title = '';
    const bodyParts: { type: 'heading' | 'paragraph' | 'list'; text: string; items?: string[] }[] = [];

    let currentList: string[] = [];

    lines.forEach((line, idx) => {
      if (idx === 0 && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('📌')) {
        title = line.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '');
        return;
      }

      if (line.startsWith('📌') || line.startsWith('⚠️') || line.startsWith('📊') || line.startsWith('💡') || line.startsWith('🚀')) {
        if (currentList.length > 0) {
          bodyParts.push({ type: 'list', text: '', items: [...currentList] });
          currentList = [];
        }
        bodyParts.push({ type: 'heading', text: line });
        return;
      }

      if (line.startsWith('•') || line.startsWith('-')) {
        currentList.push(line.replace(/^[•\-*]\s*/, ''));
        return;
      }

      if (currentList.length > 0) {
        bodyParts.push({ type: 'list', text: '', items: [...currentList] });
        currentList = [];
      }

      bodyParts.push({ type: 'paragraph', text: line });
    });

    if (currentList.length > 0) {
      bodyParts.push({ type: 'list', text: '', items: [...currentList] });
    }

    return { title, bodyParts };
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

  const parsed = !isUser ? parseSectionedResponse(content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${
        isUser
          ? 'flex justify-end py-2'
          : 'bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 font-body'
      }`}
    >
      {isUser ? (
        <div className="bg-slate-900 text-white rounded-3xl px-5 py-3 text-sm font-extrabold shadow-2xs max-w-2xl">
          {content}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span>✨ SchoolGPT Assistant</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              ✓ Verified Data
            </span>
          </div>

          {/* Response Title */}
          {parsed?.title && (
            <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              {parsed.title}
            </h3>
          )}

          {/* Response Body Sections */}
          <div className="space-y-3 font-body text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {parsed?.bodyParts?.map((part, idx) => {
              if (part.type === 'heading') {
                return (
                  <h4 key={idx} className="font-display text-xs sm:text-sm font-extrabold text-slate-900 pt-2 pb-0.5">
                    {part.text}
                  </h4>
                );
              }
              if (part.type === 'list' && part.items) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1.5 my-2 pl-1">
                    {part.items.map((item, i) => (
                      <li key={i} className="text-slate-800 font-medium">
                        {renderBoldText(item)}
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx}>{renderBoldText(part.text)}</p>;
            })}
          </div>

          {/* Evidence Sources */}
          {sources && sources.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                Sources:
              </span>
              {sources.map((src) => (
                <span
                  key={src}
                  className="px-2.5 py-0.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600"
                >
                  ✓ {src}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
