'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SchoolGPTMessageProps {
  role: 'user' | 'assistant';
  content: string;
  contextTag?: string;
  onActionPrompt?: (prompt: string) => void;
}

export default function SchoolGPTMessage({
  role,
  content,
  contextTag = 'Based on Class 8A data',
  onActionPrompt,
}: SchoolGPTMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  // Clean raw markdown and technical prefixes
  const cleanAndParseText = (raw: string) => {
    // 1. Remove internal verification blocks, divider lines, and tags
    let cleaned = raw
      .replace(/─{3,}/g, '')
      .replace(/(?:📌|⚠️|📊|💡|🚀|📈)?\s*\*?\*?(?:Based on verified sources|Not included in current records|Using available portal information|General Pedagogical Knowledge|SchoolGPT Core|LLM Core|Retriever).*?(?:\n|$)/gi, '')
      .replace(/(?:📈|📌|📊|💡|🚀)\s*(?:OBSERVATION|EVIDENCE|REASONING|SUGGESTED NEXT STEP):?/gi, '')
      .replace(/(?:📈|📌|📊|💡|🚀)/g, '');

    const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);

    return lines.map((line, idx) => {
      // Clean bold markers inside the line
      const renderFormattedLine = (str: string) => {
        const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return parts.map((part, pIdx) => {
          if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*') && part.length > 2)) {
            const inner = part.replace(/^\*+|\*+$/g, '');
            return (
              <strong key={pIdx} className="font-bold text-[#102A43]">
                {inner}
              </strong>
            );
          }
          return part;
        });
      };

      // Bullet list item
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const itemText = line.replace(/^[•\-*]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-[#102A43]/85 leading-relaxed pl-1">
            <span className="text-[#2563EB] font-bold mt-0.5">•</span>
            <span>{renderFormattedLine(itemText)}</span>
          </div>
        );
      }

      // Heading or emphasized section
      if (line.startsWith('###') || (line.endsWith(':') && line.length < 45 && !line.includes('.'))) {
        const headingText = line.replace(/^###\s*/, '').replace(/^\*+|\*+$/g, '');
        return (
          <h5 key={idx} className="font-display text-xs sm:text-sm font-bold text-[#102A43] pt-1">
            {headingText}
          </h5>
        );
      }

      return (
        <p key={idx} className="text-xs sm:text-[13px] text-[#102A43]/85 leading-relaxed font-normal">
          {renderFormattedLine(line)}
        </p>
      );
    });
  };

  // Derive precise contextual action buttons
  const getContextualActionChips = (text: string) => {
    const lower = text.toLowerCase();
    const actions: { label: string; prompt: string; isCopy?: boolean }[] = [];

    if (lower.includes('parent') || lower.includes('dear mr') || lower.includes('warm regards') || lower.includes('message to')) {
      actions.push({ label: copied ? 'Copied ✓' : 'Copy Text', prompt: '', isCopy: true });
      actions.push({ label: 'Send via WhatsApp', prompt: 'Format this as a WhatsApp message for parents.' });
    } else if (lower.includes('teach') || lower.includes('fraction') || lower.includes('next topic') || lower.includes('concept')) {
      actions.push({ label: 'Explain Differently', prompt: 'Explain this concept differently with a simple visual analogy.' });
      actions.push({ label: 'Create Quick Check', prompt: 'Create a 3-question quick check for this concept.' });
    } else if (lower.includes('attention') || lower.includes('struggl') || lower.includes('support')) {
      actions.push({ label: 'View Students', prompt: 'Show detailed support breakdown for these students.' });
      actions.push({ label: 'Create Support Plan', prompt: 'Draft a 10-minute intervention support plan for struggling students.' });
    } else if (lower.includes('class') && (lower.includes('doing') || lower.includes('perform') || lower.includes('average'))) {
      actions.push({ label: 'View Classroom', prompt: 'Summarize classroom performance across subjects.' });
      actions.push({ label: 'Compare Subjects', prompt: 'Compare Mathematics vs Science progress for Class 8A.' });
    } else {
      actions.push({ label: 'Explain Differently', prompt: 'Explain this in simpler terms with practical examples.' });
      actions.push({ label: 'Next Best Step', prompt: 'What is the immediate next action recommended?' });
    }

    return actions.slice(0, 2);
  };

  const handleCopyText = (text: string) => {
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actionChips = !isUser ? getContextualActionChips(content) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {isUser ? (
        <div className="bg-[#102A43] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-sm font-medium max-w-[85%] sm:max-w-md shadow-2xs">
          {content}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-4 sm:p-5 text-left max-w-[95%] sm:max-w-lg shadow-2xs space-y-3">
          {/* Formatted Natural Content */}
          <div className="space-y-2">
            {cleanAndParseText(content)}
          </div>

          {/* Contextual Action Buttons */}
          {actionChips.length > 0 && (
            <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
              {actionChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    if (chip.isCopy) {
                      handleCopyText(content);
                    } else if (onActionPrompt) {
                      onActionPrompt(chip.prompt);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] text-[11px] font-bold transition-colors cursor-pointer border border-[#2563EB]/20 flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                  {!chip.isCopy && <span>&rarr;</span>}
                </button>
              ))}
            </div>
          )}

          {/* Subtle Trust Line */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-[#102A43]/50 font-medium">
            <span className="flex items-center gap-1 text-[#16A085]">
              <span>✓</span>
              <span>{contextTag.startsWith('✓') ? contextTag.slice(1).trim() : contextTag}</span>
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
