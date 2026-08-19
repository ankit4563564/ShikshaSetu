'use client';

import React from 'react';
import type { MindMapSection, MindMapItem, ConceptAccentColor, TableStructure } from '@/lib/mindmap/types';
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
  formulaBorder: string;
}> = {
  blue: {
    border: 'border-l-blue-600 border-slate-300',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    headerText: 'text-blue-950',
    formulaBg: 'bg-blue-50/70',
    formulaBorder: 'border-blue-200',
  },
  green: {
    border: 'border-l-emerald-600 border-slate-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerText: 'text-emerald-950',
    formulaBg: 'bg-emerald-50/70',
    formulaBorder: 'border-emerald-200',
  },
  orange: {
    border: 'border-l-amber-600 border-slate-300',
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
    headerText: 'text-amber-950',
    formulaBg: 'bg-amber-50/70',
    formulaBorder: 'border-amber-200',
  },
  purple: {
    border: 'border-l-purple-600 border-slate-300',
    badge: 'bg-purple-100 text-purple-900 border-purple-200',
    headerText: 'text-purple-950',
    formulaBg: 'bg-purple-50/70',
    formulaBorder: 'border-purple-200',
  },
  red: {
    border: 'border-l-rose-600 border-slate-300',
    badge: 'bg-rose-100 text-rose-900 border-rose-200',
    headerText: 'text-rose-950',
    formulaBg: 'bg-rose-50/70',
    formulaBorder: 'border-rose-200',
  },
  teal: {
    border: 'border-l-teal-600 border-slate-300',
    badge: 'bg-teal-100 text-teal-900 border-teal-200',
    headerText: 'text-teal-950',
    formulaBg: 'bg-teal-50/70',
    formulaBorder: 'border-teal-200',
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

function RenderTableView({ table }: { table?: TableStructure }) {
  if (!table || !table.headers || table.headers.length === 0) return null;
  return (
    <div className="overflow-x-auto my-2 rounded-xl border border-slate-200 shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-[11px]">
        <thead className="bg-slate-100">
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} className="px-2.5 py-1.5 text-left font-bold text-slate-800 tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {table.rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-2.5 py-1.5 text-slate-700 font-medium">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders nested MindMapItem children recursively with type-aware formatting.
 * Handles process (algorithm steps), formula, table, and concept items at any depth.
 */
function NestedChildren({
  items,
  accent,
  searchQuery,
  depth = 0,
}: {
  items: MindMapItem[];
  accent: typeof ACCENT_STYLES.blue;
  searchQuery?: string;
  depth?: number;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`mt-1.5 pl-3 ${depth === 0 ? 'ml-2 border-l-2' : 'ml-1 border-l'} border-slate-200 space-y-1.5`}>
      {items.map((child) => (
        <div key={child.id} className="text-xs space-y-1">
          {child.type === 'process' ? (
            <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-950 uppercase tracking-wider">
                <span>⚡</span>
                <span>{highlightMatch(child.title || child.content, searchQuery)}</span>
              </div>
              {child.details && (
                <div className="space-y-1 pl-1.5 border-l-2 border-indigo-300">
                  {child.details.split('\n').filter(Boolean).map((step, sIdx) => (
                    <div key={sIdx} className="text-[11px] text-slate-800 font-medium pl-2 leading-relaxed">
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : child.type === 'formula' ? (
            <div className={`p-2.5 rounded-lg border ${accent.formulaBg} ${accent.formulaBorder}`}>
              <div className="text-center overflow-x-auto py-0.5">
                <FormulaRenderer latex={child.content} />
              </div>
              {child.details && (
                <p className="text-[10px] text-slate-600 text-center mt-1">
                  {highlightMatch(child.details, searchQuery)}
                </p>
              )}
            </div>
          ) : child.type === 'table' ? (
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-[11px] text-slate-800">📊 {child.title || 'Table'}</span>
              <RenderTableView table={child.table} />
            </div>
          ) : (
            <div className="flex items-start gap-1.5 font-medium text-slate-800">
              <span className="text-indigo-500 font-bold shrink-0 mt-0.5">↳</span>
              <div className="flex-1">
                <span className="font-bold text-slate-900">{highlightMatch(child.title || child.content, searchQuery)}</span>
                {child.details && child.details !== child.content && (
                  <p className="text-[11px] text-slate-600 font-normal mt-0.5 leading-relaxed">
                    {highlightMatch(child.details, searchQuery)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recursive grandchildren */}
          {child.children && child.children.length > 0 && (
            <NestedChildren items={child.children} accent={accent} searchQuery={searchQuery} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
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
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
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
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border mb-1 ${accent.badge}`}>
            {section.importance === 'high' || section.importance === 'critical' ? '★ High Priority' : 'Core Concept'}
          </span>
          <h3 className={`font-display text-base font-black tracking-tight leading-snug ${accent.headerText}`}>
            {highlightMatch(section.title, searchQuery)}
          </h3>
        </div>
        {section.items.length > 0 && (
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
            {section.items.length} pts
          </span>
        )}
      </div>

      {section.summary && (
        <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">
          {highlightMatch(section.summary, searchQuery)}
        </p>
      )}

      <div className="space-y-2.5">
        {section.items.map((item) => (
          <div key={item.id} className="text-xs leading-relaxed">
            {item.type === 'formula' ? (
              <div className={`p-3 rounded-xl border ${accent.formulaBg} ${accent.formulaBorder} space-y-1.5`}>
                <div className="text-center overflow-x-auto py-0.5">
                  <FormulaRenderer latex={item.content} />
                </div>
                {item.details && (
                  <p className="text-[11px] text-slate-700 text-center font-medium border-t border-slate-200/60 pt-1.5">
                    {highlightMatch(item.details, searchQuery)}
                  </p>
                )}
                {(item.unit || item.condition) && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] font-bold">
                    {item.unit && (
                      <span className="px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700 font-mono">
                        SI Unit: {item.unit}
                      </span>
                    )}
                    {item.condition && (
                      <span className="px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-200">
                        ⚖️ {item.condition}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : item.type === 'diagram' ? (
              <MiniDiagramRenderer
                diagramType={item.diagramType || 'process-flow'}
                data={item.diagramData}
                accentColor={section.accentColor}
              />
            ) : item.type === 'table' ? (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[11px] text-slate-800">📊 {item.title || 'Table'}</span>
                <RenderTableView table={item.table} />
              </div>
            ) : item.type === 'warning' ? (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
                <span className="shrink-0 text-sm">⚠️</span>
                <div>
                  <strong className="text-[11px] font-bold block uppercase tracking-wider text-rose-800">Exam Trap</strong>
                  <p className="text-[11px] font-medium leading-normal">{highlightMatch(item.content, searchQuery)}</p>
                </div>
              </div>
            ) : item.type === 'condition' ? (
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-2">
                <span className="shrink-0 text-xs mt-0.5">⚖️</span>
                <div>
                  <strong className="text-[10px] font-bold block uppercase tracking-wider text-amber-800">Condition</strong>
                  <p className="text-[11px] font-medium leading-normal">{highlightMatch(item.content, searchQuery)}</p>
                </div>
              </div>
            ) : item.type === 'process' ? (
              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-950 uppercase tracking-wider">
                  <span>⚡</span>
                  <span>{highlightMatch(item.title || item.content, searchQuery)}</span>
                </div>
                {item.details && (
                  <div className="space-y-1.5 pl-1.5 border-l-2 border-indigo-300">
                    {item.details.split('\n').filter(Boolean).map((step, sIdx) => (
                      <div key={sIdx} className="text-[11px] text-slate-800 font-medium pl-2 leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : item.type === 'example' ? (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                <strong className="text-[10px] font-bold block uppercase tracking-wider text-emerald-800">Solved Example</strong>
                <p className="text-[11px] font-medium mt-0.5 leading-normal">{highlightMatch(item.content, searchQuery)}</p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-slate-700">
                <span className="text-slate-400 font-black shrink-0 mt-0.5">•</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 leading-snug">{highlightMatch(item.title || item.content, searchQuery)}</p>
                  {item.details && item.details !== item.content && (
                    <p className="text-[11px] text-slate-600 font-normal mt-0.5 leading-relaxed">
                      {highlightMatch(item.details, searchQuery)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {item.children && item.children.length > 0 && (
              <NestedChildren items={item.children} accent={accent} searchQuery={searchQuery} />
            )}
          </div>
        ))}
      </div>

      {section.relatedSectionIds.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Connected to {section.relatedSectionIds.length} concepts</span>
          <span className="text-slate-500 font-bold">Inspect ↗</span>
        </div>
      )}
    </div>
  );
}
