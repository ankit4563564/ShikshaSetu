'use client';

import React, { useState, useRef, useMemo } from 'react';
import type { ConceptMindMap, MindMapSection } from '@/lib/mindmap/types';
import ConceptSectionCard from './ConceptSectionCard';

interface MindMapExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mindMap: ConceptMindMap;
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

  // Group sections into discrete A4 pages (e.g. 3-4 sections per page in landscape)
  const pagedSections = useMemo(() => {
    const perPage = orientation === 'landscape' ? 4 : 3;
    const pages: MindMapSection[][] = [];
    const total = mindMap.sections.length;

    for (let i = 0; i < total; i += perPage) {
      pages.push(mindMap.sections.slice(i, i + perPage));
    }
    return pages.length > 0 ? pages : [mindMap.sections];
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
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
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
              Export Revision Concept Sheet
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-resolution A4 study poster with formulas, diagrams &amp; zero clipped cards
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 flex items-center justify-center"
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
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                orientation === 'landscape'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-lg mb-1">📄 Landscape (Wide 3-Col)</div>
              <span className="text-[10px] font-normal text-slate-500">
                Recommended &bull; {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                orientation === 'portrait'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-lg mb-1">📑 Portrait (Notebook 2-Col)</div>
              <span className="text-[10px] font-normal text-slate-500">
                Standard &bull; {Math.ceil(mindMap.sections.length / 3)} Pages
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Summary Info */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Chapter Title:</span>
            <span className="font-bold text-slate-900">{mindMap.title}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Total Concept Areas:</span>
            <span className="font-bold text-slate-900">{mindMap.sections.length} Coherent Sections</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Calculated PDF Pages:</span>
            <span className="font-extrabold text-indigo-700">
              {totalPages} {totalPages === 1 ? 'Page (Single Sheet)' : `Pages (Dynamic Pagination)`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
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
                <span>Rendering High-Res PDF...</span>
              </>
            ) : exportSuccess ? (
              <span>✓ Downloaded!</span>
            ) : (
              <span>Download A4 PDF ({totalPages} {totalPages === 1 ? 'Page' : 'Pages'})</span>
            )}
          </button>
        </div>
      </div>

      {/* ── OFF-SCREEN DEDICATED PAGINATED PRINT CONTAINER ── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div
          ref={printSheetRef}
          style={{ width: orientation === 'landscape' ? '1120px' : '794px' }}
          className="bg-white text-slate-900 font-sans"
        >
          {pagedSections.map((pageSections, pIdx) => {
            const pageNum = pIdx + 1;
            const isLastPage = pageNum === totalPages;

            return (
              <div
                key={pIdx}
                style={{
                  minHeight: orientation === 'landscape' ? '760px' : '1080px',
                  pageBreakAfter: isLastPage ? 'auto' : 'always',
                  breakAfter: isLastPage ? 'auto' : 'page',
                }}
                className="p-8 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Page Header */}
                  <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-extrabold uppercase">
                          {mindMap.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          Class {mindMap.grade} &bull; Revision Sheet
                        </span>
                      </div>
                      <h1 className="text-2xl font-black text-slate-900">
                        {mindMap.title} {totalPages > 1 ? `(Part ${pageNum})` : ''}
                      </h1>
                      {pageNum === 1 && (
                        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                          {mindMap.summary}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-indigo-700 block">
                        ShikshaSetu Revision Master
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Cards Grid for this page */}
                  <div
                    className={`grid gap-4 ${
                      orientation === 'landscape' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
                    }`}
                  >
                    {pageSections.map((sec) => (
                      <ConceptSectionCard key={sec.id} section={sec} />
                    ))}
                  </div>
                </div>

                {/* Dynamic Page Footer */}
                <div className="border-t border-slate-200 pt-3 mt-4 flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>© ShikshaSetu Educational Concept Maps &bull; Verified Academic Syllabus</span>
                  <span className="font-bold text-slate-600">
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
