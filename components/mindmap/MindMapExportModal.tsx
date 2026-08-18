'use client';

import React, { useState, useRef, useMemo } from 'react';
import type { ConceptMindMap, MindMapSection } from '@/lib/mindmap/types';
import ConceptSectionCard from './ConceptSectionCard';

interface MindMapExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mindMap: ConceptMindMap;
}

/**
 * Calculates height-balanced A4 page bins to ensure zero empty or single-card overflow pages.
 */
function packSectionsIntoA4Pages(sections: MindMapSection[], orientation: 'landscape' | 'portrait'): MindMapSection[][] {
  if (sections.length === 0) return [[]];

  // Weights: base card = 100, full span = 180, formulas/steps = +30 each
  const getWeight = (sec: MindMapSection) => {
    let w = sec.layoutSpan === 'full' ? 180 : 100;
    if (sec.formulas && sec.formulas.length > 0) w += sec.formulas.length * 30;
    if (sec.items && sec.items.length > 3) w += (sec.items.length - 3) * 15;
    return w;
  };

  const maxPageCapacity = orientation === 'landscape' ? 420 : 500;
  const pages: MindMapSection[][] = [];
  let currentPage: MindMapSection[] = [];
  let currentWeight = 0;

  for (const sec of sections) {
    const w = getWeight(sec);
    if (currentPage.length > 0 && currentWeight + w > maxPageCapacity && currentPage.length >= (orientation === 'landscape' ? 3 : 2)) {
      pages.push(currentPage);
      currentPage = [sec];
      currentWeight = w;
    } else {
      currentPage.push(sec);
      currentWeight += w;
    }
  }

  if (currentPage.length > 0) {
    // If the last page has only 1 item and previous page exists, merge if reasonable
    if (currentPage.length === 1 && pages.length > 0 && pages[pages.length - 1].length <= 3) {
      pages[pages.length - 1].push(currentPage[0]);
    } else {
      pages.push(currentPage);
    }
  }

  return pages.length > 0 ? pages : [sections];
}

export default function MindMapExportModal({
  isOpen,
  onClose,
  mindMap,
}: MindMapExportModalProps) {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const printSheetRef = useRef<HTMLDivElement>(null);

  // Calculate balanced A4 pages
  const pagedSections = useMemo(() => {
    return packSectionsIntoA4Pages(mindMap.sections, orientation);
  }, [mindMap.sections, orientation]);

  const totalPages = pagedSections.length;

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const element = printSheetRef.current;
      if (!element) throw new Error('Print container unavailable');

      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: [6, 6, 6, 6],
        filename: `${mindMap.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-revision-sheet.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: orientation,
        },
        pagebreak: { mode: ['css'] },
      };

      await html2pdf().set(opt).from(element).save();
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('[MindMapExportModal] PDF generation error, using browser print:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-xl font-extrabold text-slate-900">
              Export Revision Poster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-resolution vector A4 study poster with balanced pages and zero clipped cards
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Orientation Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            A4 Page Layout &amp; Orientation
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                orientation === 'landscape'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-2xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-lg mb-1">📄 Landscape (Wide 2/3-Col)</div>
              <span className="text-[10px] font-normal text-slate-500">
                Recommended &bull; {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                orientation === 'portrait'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-2xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-lg mb-1">📑 Portrait (Notebook 2-Col)</div>
              <span className="text-[10px] font-normal text-slate-500">
                Standard &bull; {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
              </span>
            </button>
          </div>
        </div>

        {/* Summary Info */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Chapter Title:</span>
            <span className="font-bold text-slate-900">{mindMap.title}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Concept Areas:</span>
            <span className="font-bold text-slate-900">{mindMap.sections.length} Atomic Sections</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Calculated PDF Pages:</span>
            <span className="font-extrabold text-indigo-700">
              {totalPages} {totalPages === 1 ? 'Page (Single Sheet)' : `Pages (Balanced Layout)`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Rendering PDF Poster...</span>
              </>
            ) : exportSuccess ? (
              <span>✓ Download Complete!</span>
            ) : (
              <span>Download A4 PDF ({totalPages} {totalPages === 1 ? 'Page' : 'Pages'})</span>
            )}
          </button>
        </div>
      </div>

      {/* ── OFF-SCREEN DEDICATED HIGH-DPI A4 PRINT CONTAINER ── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div
          ref={printSheetRef}
          style={{ width: orientation === 'landscape' ? '1080px' : '760px' }}
          className="bg-white text-slate-900 font-sans"
        >
          {pagedSections.map((pageSections, pIdx) => {
            const pageNum = pIdx + 1;
            const isLastPage = pageNum === totalPages;

            return (
              <div
                key={pIdx}
                style={{
                  boxSizing: 'border-box',
                  pageBreakAfter: isLastPage ? 'auto' : 'always',
                  breakAfter: isLastPage ? 'auto' : 'page',
                }}
                className={`p-6 bg-white flex flex-col justify-between ${
                  !isLastPage ? 'html2pdf__page-break' : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Page Header */}
                  <div className="border-b-2 border-slate-900 pb-2.5 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-extrabold uppercase">
                          {mindMap.subject}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700">
                          Class {mindMap.grade} &bull; Visual Revision Poster
                        </span>
                      </div>
                      <h1 className="text-xl font-black text-slate-900">
                        {mindMap.title} {totalPages > 1 ? `(Page ${pageNum}/${totalPages})` : ''}
                      </h1>
                      {pageNum === 1 && (
                        <p className="text-[10px] text-slate-600 mt-0.5 max-w-3xl leading-snug">
                          {mindMap.summary}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-extrabold text-indigo-700 block">
                        ShikshaSetu Revision Master
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Cards Grid for this page */}
                  <div className="grid grid-cols-2 gap-3">
                    {pageSections.map((sec) => {
                      const isFull = sec.layoutSpan === 'full' && pageSections.length <= 3;
                      return (
                        <div key={sec.id} className={isFull ? 'col-span-2' : 'col-span-1'}>
                          <ConceptSectionCard section={sec} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Page Footer */}
                <div className="border-t border-slate-200 pt-2 mt-4 flex justify-between text-[8px] text-slate-400 font-mono">
                  <span>© ShikshaSetu Academic Concept Maps &bull; Verified Syllabus</span>
                  <span className="font-bold text-slate-700">
                    Page {pageNum} of {totalPages}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
