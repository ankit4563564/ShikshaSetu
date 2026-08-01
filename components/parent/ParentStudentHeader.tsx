'use client';

import React from 'react';

interface Student {
  studentId: string;
  displayName: string;
}

interface ParentStudentHeaderProps {
  activeStudent: Student | undefined;
  currentStudents: Student[];
  selectedStudentId: string;
  onStudentChange: (studentId: string) => void;
  isLoading?: boolean;
  rightActions?: React.ReactNode;
}

export function ParentStudentHeader({
  activeStudent,
  currentStudents,
  selectedStudentId,
  onStudentChange,
  isLoading = false,
  rightActions,
}: ParentStudentHeaderProps) {
  return (
    <header className="parent-portal-header bg-white/95 backdrop-blur-xl border-b border-deep-teal/10 px-4 py-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-deep-teal to-teal-600 font-display text-lg font-bold text-white shadow-md">
            {activeStudent?.displayName.split(' ').map((n) => n[0]).join('') || 'NA'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 border-2 border-white">
            <span className="text-[8px] font-bold text-white">✓</span>
          </div>
        </div>
        <div className="space-y-0.5">
          {currentStudents.length > 1 ? (
            <div className="relative inline-block">
              <select
                value={activeStudent?.studentId || ''}
                onChange={(e) => onStudentChange(e.target.value)}
                disabled={isLoading}
                className="bg-transparent font-display text-base font-extrabold text-deep-teal outline-none focus:ring-2 focus:ring-deep-teal/20 rounded cursor-pointer border border-transparent hover:border-deep-teal/10 py-0.5 px-1 transition-all disabled:opacity-50 appearance-none pr-6"
              >
                {currentStudents.map((child) => (
                  <option key={child.studentId} value={child.studentId}>
                    {child.displayName}
                  </option>
                ))}
              </select>
              <svg className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-deep-teal/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : (
            <h2 className="font-display text-base font-extrabold leading-tight text-deep-teal">
              {activeStudent?.displayName || 'Student'}
            </h2>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-deep-teal/60 font-medium">Grade 8A · Ms. Mehra</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600">At school</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightActions}
      </div>
    </header>
  );
}
