'use client';

import React from 'react';
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
  contextTag = 'Using Class 8A data',
  onActionPrompt,
}: SchoolGPTMessageProps) {
  const isUser = role === 'user';

  // Format assistant text cleanly
  const renderFormattedText = (raw: string) => {
    // Remove technical tag prefixes like EVIDENCE:, OBSERVATION:, etc.
    const cleaned = raw
      .replace(/(?:📈|📌|📊|💡|🚀)\s*(?:OBSERVATION|EVIDENCE|REASONING|SUGGESTED NEXT STEP):?/gi, '')
      .replace(/(?:📈|📌|📊|💡|🚀)/g, '');

    const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);

    return lines.map((line, idx) => {
      // Bullet list item
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const itemText = line.replace(/^[•\-*]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-[#102A43]/85 leading-relaxed pl-1">
            <span className="text-[#2563EB] font-bold mt-0.5">•</span>
            <span>{itemText}</span>
          </div>
        );
      }

      // Heading or emphasized topic
      if (line.startsWith('###') || (line.endsWith(':') && line.length < 40)) {
        return (
          <h5 key={idx} className="font-display text-xs sm:text-sm font-bold text-[#102A43] pt-1">
            {line.replace(/^###\s*/, '')}
          </h5>
        );
      }

      return (
        <p key={idx} className="text-xs sm:text-[13px] text-[#102A43]/85 leading-relaxed font-normal">
          {line}
        </p>
      );
    });
  };

  // Derive quick follow-up action buttons based on content
  const getContextualActionChips = (text: string) => {
    const lower = text.toLowerCase();
    const actions: { label: string; prompt: string }[] = [];

    if (lower.includes('fraction') || lower.includes('teach') || lower.includes('concept')) {
      actions.push({ label: 'Create 5-Min Review', prompt: 'Draft a 5-minute visual lesson plan for this topic.' });
      actions.push({ label: '3 Quick Practice Questions', prompt: 'Generate 3 quick practice questions to verify mastery.' });
    } else if (lower.includes('attendance') || lower.includes('absent')) {
      actions.push({ label: 'Draft Parent Note', prompt: 'Draft a brief, encouraging note for parents.' });
      actions.push({ label: 'View Attendance Records', prompt: 'Show attendance breakdown for the past month.' });
    } else if (lower.includes('homework') || lower.includes('submission')) {
      actions.push({ label: 'Send Homework Reminder', prompt: 'Draft a polite homework reminder for students.' });
    } else {
      actions.push({ label: 'Explain Differently', prompt: 'Explain this in simpler terms for a quick review.' });
      actions.push({ label: 'Next Best Step', prompt: 'What is the immediate next action recommended?' });
    }

    return actions.slice(0, 2);
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
            {renderFormattedText(content)}
          </div>

          {/* Actionable Suggestions */}
          {actionChips.length > 0 && onActionPrompt && (
            <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
              {actionChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => onActionPrompt(chip.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] text-[11px] font-bold transition-colors cursor-pointer border border-[#2563EB]/20 flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                  <span>&rarr;</span>
                </button>
              ))}
            </div>
          )}

          {/* Subtle Trust Line */}
          <div className="pt-1.5 flex items-center justify-between text-[10px] text-[#102A43]/50 font-medium">
            <span className="flex items-center gap-1 text-[#16A085]">
              <span>✓</span>
              <span>{contextTag}</span>
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
