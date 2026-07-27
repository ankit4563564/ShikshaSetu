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
    <header className="parent-portal-header bg-white/90 backdrop-blur-xl border-b border-deep-teal/10 px-4 py-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-deep-teal/5 font-display text-sm font-bold text-deep-teal border border-deep-teal/10">
          {activeStudent?.displayName.split(' ').map((n) => n[0]).join('') || 'NA'}
        </div>
        <div>
          {currentStudents.length > 1 ? (
            <div className="relative inline-block">
              <select
                value={activeStudent?.studentId || ''}
                onChange={(e) => onStudentChange(e.target.value)}
                disabled={isLoading}
                className="bg-transparent font-display text-base font-extrabold text-deep-teal outline-none focus:ring-2 focus:ring-deep-teal/20 rounded cursor-pointer border border-transparent hover:border-deep-teal/10 py-0.5 px-1 transition-all disabled:opacity-50"
                style={{ appearance: 'auto' }}
              >
                {currentStudents.map((child) => (
                  <option key={child.studentId} value={child.studentId}>
                    {child.displayName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <h2 className="font-display text-base font-extrabold leading-tight text-deep-teal px-1">
              {activeStudent?.displayName || 'Student'}
            </h2>
          )}
          <p className="font-body text-[10px] text-deep-teal/60 font-semibold px-1 mt-0.5">
            Grade 8A &middot; Ms. Mehra
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-[10px] uppercase tracking-wider">
          📱 Parent Mobile App
        </span>
        {rightActions}
      </div>
    </header>
  );
}
