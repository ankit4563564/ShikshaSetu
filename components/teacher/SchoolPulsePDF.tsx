'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  StudentReportCardData,
  downloadReportCardsPDF,
} from '@/lib/pdf/reportCardGenerator';

export type { StudentReportCardData };

interface SchoolPulsePDFProps {
  students: StudentReportCardData[];
  teacherId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SchoolPulsePDF({
  students,
  teacherId,
  isOpen = true,
  onClose,
}: SchoolPulsePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Default: Pre-select all students for instant 1-click batch printing
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    () => new Set(students.map((s) => s.studentId))
  );

  // Update selection if students prop changes
  useEffect(() => {
    if (students.length > 0) {
      setSelectedStudents(new Set(students.map((s) => s.studentId)));
    }
  }, [students]);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleStudent = (studentId: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
    setError(null);
    setSuccessMsg(null);
  };

  const selectAll = () => {
    setSelectedStudents(new Set(students.map((s) => s.studentId)));
    setError(null);
    setSuccessMsg(null);
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
    setError(null);
    setSuccessMsg(null);
  };

  const selectedStudentsData = useMemo(() => {
    return students.filter((s) => selectedStudents.has(s.studentId));
  }, [students, selectedStudents]);

  const handleDownloadPDF = async () => {
    if (selectedStudents.size === 0) {
      setError('Please select at least one student to print report cards.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Direct vector PDF generation
      const result = downloadReportCardsPDF(selectedStudentsData);
      setSuccessMsg(`Successfully generated ${selectedStudentsData.length} report card(s) (${Math.round(result.byteLength / 1024)} KB)`);
    } catch (err: any) {
      console.error('[Report Card PDF] Generation error:', err);
      setError(err?.message || 'Unable to generate report cards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const count = selectedStudents.size;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-cards-modal-title"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 border border-slate-200/80 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* ── Modal Header ── */}
        <div className="flex items-start justify-between border-b pb-3.5 border-slate-100">
          <div>
            <h2
              id="report-cards-modal-title"
              className="font-display text-xl font-bold text-slate-900 tracking-tight"
            >
              Report Cards
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select students and generate their academic report cards.
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all cursor-pointer"
              aria-label="Close dialog"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Success Alert Banner ── */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>✓ {successMsg}</span>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Error Alert Banner ── */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Selection Control Header ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Students
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-semibold">
                {count} of {students.length} selected
              </span>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={selectAll}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* ── Compact Student Cards Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-0.5 scrollbar-thin">
            {students.map((student) => {
              const isSelected = selectedStudents.has(student.studentId);
              return (
                <button
                  key={student.studentId}
                  type="button"
                  onClick={() => toggleStudent(student.studentId)}
                  className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 mt-0.5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-display text-xs font-bold text-slate-900 truncate block">
                      {student.displayName}
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium block">
                      Class {student.grade || '8'}{student.section || 'A'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      Att: {student.attendance.percentage}% &middot; HW: {student.homework.percentage}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={count === 0 || isGenerating}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Report Cards...</span>
              </>
            ) : (
              <span>
                Download {count} Report Card{count === 1 ? '' : 's'}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleBrowserPrint}
            disabled={count === 0}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-display text-xs font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
          >
            <span>🖨️</span>
            <span>Browser Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
