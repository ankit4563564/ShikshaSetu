'use client';

import React from 'react';
import type { MindMapSection, MindMapItem, ConceptAccentColor } from '@/lib/mindmap/types';
import FormulaRenderer from './FormulaRenderer';
import MiniDiagramRenderer from './MiniDiagramRenderer';

interface ConceptSectionCardProps {
  section: MindMapSection;
  isFocused?: boolean;
  isDimmed?: boolean;
  searchQuery?: string;
  onSelect?: (sectionId: string) => void;
  className?: string;
}

const ACCENT_STYLES: Record<ConceptAccentColor, {
  border: string;
  badge: string;
  headerText: string;
  formulaBg: string;
}> = {
  blue: {
    border: 'border-l-blue-600 border-slate-300',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    headerText: 'text-blue-950',
    formulaBg: 'bg-blue-50/70 border-blue-200',
  },
  green: {
    border: 'border-l-emerald-600 border-slate-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerText: 'text-emerald-950',
    formulaBg: 'bg-emerald-50/70 border-emerald-200',
  },
  orange: {
    border: 'border-l-amber-600 border-slate-300',
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
    headerText: 'text-amber-950',
    formulaBg: 'bg-amber-50/70 border-amber-200',
  },
  purple: {
    border: 'border-l-purple-600 border-slate-300',
    badge: 'bg-purple-100 text-purple-900 border-purple-200',
    headerText: 'text-purple-950',
    formulaBg: 'bg-purple-50/70 border-purple-200',
  },
  red: {
    border: 'border-l-rose-600 border-slate-300',
    badge: 'bg-rose-100 text-rose-900 border-rose-200',
    headerText: 'text-rose-950',
    formulaBg: 'bg-rose-50/70 border-rose-200',
  },
  teal: {
    border: 'border-l-teal-600 border-slate-300',
    badge: 'bg-teal-100 text-teal-900 border-teal-200',
    headerText: 'text-teal-950',
    formulaBg: 'bg-teal-50/70 border-teal-200',
  },
};

function highlightMatch(text: string, query?: string) {
  if (!query || !query.trim() || !text) return text;
  const parts = text.split(new RegExp(`(${query.trim()})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-slate-950 font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function ConceptSectionCard({
  section,
  isFocused = false,
  isDimmed = false,
  searchQuery = '',
  onSelect,
  className = '',
}: ConceptSectionCardProps) {
  const accent = ACCENT_STYLES[section.accentColor] || ACCENT_STYLES.blue;

  return (
    <div
      id={`section-card-${section.id}`}
      onClick={() => onSelect?.(section.id)}
      className={`relative rounded-2xl bg-white border-l-4 border-t border-r border-b p-4 sm:p-5 transition-all duration-200 cursor-pointer select-none ${
        accent.border
      } ${
        isFocused
          ? 'ring-2 ring-slate-900 shadow-md scale-[1.01]'
          : isDimmed
          ? 'opacity-25 filter grayscale-[50%]'
          : 'hover:shadow-sm hover:border-slate-400'
      } ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border mb-1.5 ${accent.badge}`}>
            {section.importance === 'high' ? '★ High Priority' : 'Core Concept'}
          </span>
          <h3 className={`font-display text-base sm:text-lg font-black tracking-tight leading-snug ${accent.headerText}`}>
            {highlightMatch(section.title, searchQuery)}
          </h3>
        </div>
        {section.items.length > 0 && (
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
            {section.items.length} points
          </span>
        )}
      </div>

      {section.summary && (
        <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">
          {highlightMatch(section.summary, searchQuery)}
        </p>
      )}

      {/* Items List */}
      <div className="space-y-2.5">
        {section.items.map((item) => (
          <div key={item.id} className="text-xs leading-relaxed">
            {item.type === 'formula' ? (
              <div className={`p-2.5 rounded-xl border ${accent.formulaBg} space-y-1`}>
                <div className="text-center overflow-x-auto py-1">
                  <FormulaRenderer latex={item.content} />
                </div>
                {item.details && (
                  <p className="text-[11px] text-slate-600 text-center font-medium border-t border-slate-200/50 pt-1">
                    {highlightMatch(item.details, searchQuery)}
                  </p>
                )}
              </div>
            ) : item.type === 'diagram' ? (
              <MiniDiagramRenderer
                diagramType={item.diagramType || 'process-flow'}
                data={item.diagramData}
                accentColor={section.accentColor}
              />
            ) : item.type === 'warning' ? (
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-1.5">
                <span className="shrink-0 text-sm">⚠️</span>
                <div>
                  <strong className="text-[11px] font-bold block uppercase tracking-wider text-rose-800">Exam Trap</strong>
                  <p className="text-[11px] font-medium">{highlightMatch(item.content, searchQuery)}</p>
                </div>
              </div>
            ) : item.type === 'condition' ? (
              <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-1.5">
                <span className="shrink-0 text-xs">⚖️</span>
                <div>
                  <strong className="text-[10px] font-bold block uppercase tracking-wider text-amber-800">Condition</strong>
                  <p className="text-[11px] font-medium">{highlightMatch(item.content, searchQuery)}</p>
                </div>
              </div>
            ) : item.type === 'example' ? (
              <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                <strong className="text-[10px] font-bold block uppercase tracking-wider text-emerald-800">Solved Example</strong>
                <p className="text-[11px] font-medium mt-0.5">{highlightMatch(item.content, searchQuery)}</p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-slate-700">
                <span className="text-slate-400 font-black shrink-0 mt-0.5">•</span>
                <p className="font-medium text-slate-800">{highlightMatch(item.content, searchQuery)}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connected Nodes Indicator */}
      {section.relatedSectionIds.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Connected to {section.relatedSectionIds.length} concepts</span>
          <span className="text-slate-500 font-bold">Inspect ↗</span>
        </div>
      )}
    </div>
  );
}
