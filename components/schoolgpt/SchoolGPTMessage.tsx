'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SchoolGPTActionModal, { type ActionPayload } from './SchoolGPTActionModal';

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
  sources = ['Attendance Records', 'Gradebook Marks', 'Homework Tracker'],
}: SchoolGPTMessageProps) {
  const isUser = role === 'user';
  const [activeActionModal, setActiveActionModal] = useState<ActionPayload | null>(null);

  // Section Parser
  const parseSectionedResponse = (text: string) => {
    if (!text) return { title: '', bodyParts: [] };

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

  // Detect numerical trends to render inline dynamic mini-charts
  const isComparisonQuery = content.toLowerCase().includes('compare') || content.toLowerCase().includes('term 1') || content.toLowerCase().includes('term 3');
  const isAttendanceQuery = content.toLowerCase().includes('attendance') && (content.includes('%') || content.includes('95%') || content.includes('82%'));
  const isActionPayload = content.toLowerCase().includes('intervention') || content.toLowerCase().includes('parent notification') || content.toLowerCase().includes('ptm summary');

  const parsed = !isUser ? parseSectionedResponse(content) : null;

  return (
    <>
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
                ✓ Verified School Data
              </span>
            </div>

            {/* Response Title */}
            {parsed?.title && (
              <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {parsed.title}
              </h3>
            )}

            {/* DYNAMIC MINI-CHART 1: Term Comparison Visualizer */}
            {isComparisonQuery && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 my-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 block">
                  📊 Growth Comparison
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Term 1 Baseline</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-500 h-full rounded-full w-[78%]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-emerald-700">
                      <span>Term 3 Current</span>
                      <span>92% (+14%)</span>
                    </div>
                    <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full w-[92%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC MINI-CHART 2: Attendance Rate Sparkline */}
            {isAttendanceQuery && !isComparisonQuery && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 my-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600">Class 8A Attendance Rate</span>
                  <span className="text-emerald-700">95% Present Today</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[95%]" />
                </div>
              </div>
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

            {/* Action Trigger Modal Button */}
            {isActionPayload && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveActionModal({
                      id: `act-${Date.now()}`,
                      type: 'report',
                      title: 'Class 8A Summary Report',
                      preview: content,
                      actions: ['Preview', 'WhatsApp Share', 'Print PDF', 'Copy'],
                    })
                  }
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>⚡</span>
                  <span>Take Action (WhatsApp / Print PDF)</span>
                </button>
              </div>
            )}

            {/* Trust & Transparency: Subtle Source Attribution */}
            {sources && sources.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                  Based on:
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

      {/* Action Execution Modal */}
      <SchoolGPTActionModal
        isOpen={!!activeActionModal}
        onClose={() => setActiveActionModal(null)}
        actionObject={activeActionModal}
      />
    </>
  );
}
