'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ConceptMindMap, MindMapSection } from '@/lib/mindmap/types';
import ConceptSectionCard from './ConceptSectionCard';
import D3MindMapCanvas from './D3MindMapCanvas';

interface VisualMindMapCanvasProps {
  mindMap: ConceptMindMap;
  onExportPdf?: () => void;
  className?: string;
}

export default function VisualMindMapCanvas({
  mindMap,
  onExportPdf,
  className = '',
}: VisualMindMapCanvasProps) {
  const [viewMode, setViewMode] = useState<'poster' | 'interactive'>('interactive');
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardCoordinates, setCardCoordinates] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const focusedSection = useMemo(() => {
    return mindMap.sections.find((s) => s.id === focusedSectionId) || null;
  }, [mindMap.sections, focusedSectionId]);

  const relatedSectionIds = useMemo(() => {
    if (!focusedSection) return new Set<string>();
    return new Set(focusedSection.relatedSectionIds);
  }, [focusedSection]);

  // Recalculate card coordinates for SVG relationship lines
  const updateCoordinates = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const coords: Record<string, { x: number; y: number; width: number; height: number }> = {};

    mindMap.sections.forEach((sec) => {
      const el = document.getElementById(`section-card-${sec.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        coords[sec.id] = {
          x: (rect.left - containerRect.left) / zoom,
          y: (rect.top - containerRect.top) / zoom,
          width: rect.width / zoom,
          height: rect.height / zoom,
        };
      }
    });

    setCardCoordinates(coords);
  };

  useEffect(() => {
    if (viewMode === 'poster') {
      updateCoordinates();
      const handleResize = () => updateCoordinates();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mindMap, zoom, viewMode]);

  const handleZoomIn = () => setZoom((prev) => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.7, Math.round((prev - 0.1) * 10) / 10));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`flex flex-col h-full bg-[#FAFAF9] border border-slate-200 rounded-3xl overflow-hidden shadow-xs ${className}`}>
      {/* ── 1. TOP CONTROL BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-white border-b border-slate-200 z-20">
        {/* Toggle Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'interactive'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            🌌 Interactive Canvas
          </button>
          <button
            onClick={() => setViewMode('poster')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'poster'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            📋 Revision Sheet
          </button>
        </div>

        {/* Telemetry Status Indicator */}
        {mindMap.telemetry && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
            {mindMap.telemetry.fallbackUsed ? (
              <span className="flex items-center gap-1.5 text-amber-700 font-bold" title={mindMap.telemetry.fallbackReason || 'Deterministic engine active'}>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                ⚙️ Regex Parser ({mindMap.telemetry.nodeCount} nodes &bull; {((mindMap.telemetry.totalMs || 0) / 1000).toFixed(1)}s)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold" title={`AI Latency: ${mindMap.telemetry.aiCallMs}ms, Deduplicated: ${mindMap.telemetry.duplicateNodesRemoved}`}>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                ⚡ AI Synthesized ({mindMap.telemetry.nodeCount} nodes &bull; {((mindMap.telemetry.totalMs || 0) / 1000).toFixed(1)}s)
              </span>
            )}
          </div>
        )}

        {/* Viewport Zoom & Actions */}
        <div className="flex items-center gap-2">
          {viewMode === 'poster' && (
            <>
              {/* Search & Filter */}
              <div className="relative w-48 mr-2">
                <span className="absolute left-2.5 top-2 text-slate-400 text-[10px]">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter concepts..."
                  className="w-full pl-6 pr-6 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white font-medium"
                />
              </div>

              {focusedSectionId && (
                <button
                  onClick={() => setFocusedSectionId(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-display text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Reset Focus</span>
                  <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded">✕</span>
                </button>
              )}

              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-mono font-bold text-slate-700">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.7}
                  className="px-2.5 py-1 hover:bg-white rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                  title="Zoom Out"
                >
                  −
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 hover:bg-white rounded-lg transition-all"
                  title="Reset Zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 1.5}
                  className="px-2.5 py-1 hover:bg-white rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
              </div>
            </>
          )}

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-display text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>📄 Export A4 Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. VIEWPORT ── */}
      {viewMode === 'interactive' ? (
        <div className="flex-1 p-6 bg-[#08080c] overflow-hidden">
          <D3MindMapCanvas
            mindMap={mindMap}
            onSelectConceptForRevision={(concept) => {
              setSearchQuery(concept);
              setViewMode('poster');
            }}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 sm:p-8 relative bg-[#F8F8F6]">
          <div
            ref={containerRef}
            id="mindmap-poster-sheet"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
            className="max-w-5xl mx-auto bg-[#FAFAF8] border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm relative space-y-6"
          >
            {/* ── POSTER HEADER BANNER ── */}
            <div className="border-b-2 border-slate-900 pb-4 space-y-2 text-left relative">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-widest">
                    {mindMap.subject}
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold">
                    Class {mindMap.grade} &bull; Visual Revision Poster
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {mindMap.sections.length} Semantic Concept Areas
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {mindMap.title}
              </h1>
              <p className="font-body text-xs sm:text-sm text-slate-600 max-w-3xl font-medium leading-relaxed">
                {mindMap.summary}
              </p>
            </div>

            {/* ── SVG RELATIONSHIP CONNECTORS ── */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible opacity-30">
              {mindMap.relationships.map((rel, idx) => {
                const from = cardCoordinates[rel.fromSectionId];
                const to = cardCoordinates[rel.toSectionId];
                if (!from || !to) return null;

                const x1 = from.x + from.width / 2;
                const y1 = from.y + from.height;
                const x2 = to.x + to.width / 2;
                const y2 = to.y;

                const isHighlighted =
                  focusedSectionId &&
                  (focusedSectionId === rel.fromSectionId || focusedSectionId === rel.toSectionId);

                return (
                  <path
                    key={idx}
                    d={`M ${x1} ${y1} C ${x1} ${y1 + 30}, ${x2} ${y2 - 30}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isHighlighted ? '#1e293b' : '#94a3b8'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={isHighlighted ? 'none' : '4 4'}
                  />
                );
              })}
            </svg>

            {/* ── EDITORIAL CONCEPT POSTER GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 relative z-10">
              {mindMap.sections.map((section) => {
                const isFocused = focusedSectionId === section.id;
                const isDimmed =
                  Boolean(focusedSectionId) &&
                  !isFocused &&
                  !relatedSectionIds.has(section.id);

                const isFullSpan = section.layoutSpan === 'full';

                return (
                  <div
                    key={section.id}
                    className={isFullSpan ? 'md:col-span-2' : 'md:col-span-1'}
                  >
                    <ConceptSectionCard
                      section={section}
                      isFocused={isFocused}
                      isDimmed={isDimmed}
                      searchQuery={searchQuery}
                      onSelect={(id) => {
                        setFocusedSectionId((prev) => (prev === id ? null : id));
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* ── FOOTER ── */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>ShikshaSetu Academic Concept Maps &bull; Verified Syllabus</span>
              <span>Click any concept to isolate dependencies</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
