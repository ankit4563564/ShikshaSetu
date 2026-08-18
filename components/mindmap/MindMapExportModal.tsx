'use client';

import React, { useState, useRef } from 'react';
import type { ConceptMindMap } from '@/lib/mindmap/types';
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

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const element = printSheetRef.current;
      if (!element) throw new Error('Print container unavailable');

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: [8, 8, 8, 8],
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
      };

      await html2pdf().set(opt).from(element).save();
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('[MindMapExportModal] PDF generation failed:', err);
      // Fallback: Trigger standard browser print
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
              High-resolution 1-page A4 study sheet with formulas and diagrams
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
            A4 Page Orientation
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
              <div className="text-lg mb-1">📄 Landscape (Recommended)</div>
              <span className="text-[10px] font-normal text-slate-500">
                Wide 3-column revision poster layout
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
              <div className="text-lg mb-1">📑 Portrait</div>
              <span className="text-[10px] font-normal text-slate-500">
                Standard notebook 2-column layout
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
            <span className="font-bold text-slate-900">{mindMap.sections.length} Colored Sections</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Format:</span>
            <span className="font-bold text-indigo-700">Vector A4 PDF ({orientation})</span>
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
                <span>Generating A4 PDF...</span>
              </>
            ) : exportSuccess ? (
              <span>✓ Downloaded!</span>
            ) : (
              <span>Download PDF Revision Sheet</span>
            )}
          </button>
        </div>
      </div>

      {/* ── OFF-SCREEN DEDICATED HIGH-DPI PRINT RENDER CONTAINER ── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div
          ref={printSheetRef}
          style={{ width: orientation === 'landscape' ? '1120px' : '794px' }}
          className="bg-white p-8 space-y-6 text-slate-900 font-sans"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-extrabold uppercase">
                  {mindMap.subject}
                </span>
                <span className="text-xs font-bold text-slate-700">Class {mindMap.grade} Revision Sheet</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">{mindMap.title}</h1>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">{mindMap.summary}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-indigo-700 block">ShikshaSetu Revision Master</span>
              <span className="text-[9px] text-slate-400 font-mono">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={`grid gap-4 ${orientation === 'landscape' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {mindMap.sections.map((sec) => (
              <ConceptSectionCard key={sec.id} section={sec} />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-3 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>© ShikshaSetu Educational Concept Maps &bull; Verified Academic Syllabus</span>
            <span>Page 1 of 1 &bull; Single-Sheet Revision</span>
          </div>
        </div>
      </div>
    </div>
  );
}
