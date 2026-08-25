'use client';

import React from 'react';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface Student {
  studentId: string;
  displayName: string;
  grade?: string | null;
  section?: string | null;
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
export function ParentStudentHeader({
  activeStudent,
  currentStudents,
  selectedStudentId,
  onStudentChange,
  isLoading = false,
  rightActions,
}: ParentStudentHeaderProps) {
  const gradeSection = `Class ${activeStudent?.grade || '8'}${activeStudent?.section || 'A'}`;

  return (
    <header className="parent-portal-header bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 px-4 py-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 font-display text-lg font-black text-white shadow-md shadow-indigo-500/20">
            {activeStudent?.displayName.split(' ').map((n) => n[0]).join('') || 'S'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 border-white shadow-xs">
            <span className="text-[8px] font-black text-white">✓</span>
          </div>
        </div>
        <div className="space-y-0.5">
          {currentStudents.length > 1 ? (
            <div className="relative inline-block">
              <select
                value={activeStudent?.studentId || ''}
                onChange={(e) => onStudentChange(e.target.value)}
                disabled={isLoading}
                className="bg-transparent font-display text-base font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl cursor-pointer border border-transparent hover:border-slate-200/80 py-0.5 px-1.5 transition-all disabled:opacity-50 appearance-none pr-6"
              >
                {currentStudents.map((child) => (
                  <option key={child.studentId} value={child.studentId}>
                    {child.displayName} ({child.grade || '8'}{child.section || 'A'})
                  </option>
                ))}
              </select>
              <svg className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : (
            <h2 className="font-display text-base font-black leading-tight text-slate-900">
              {activeStudent?.displayName || 'Student'}
            </h2>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">{gradeSection}</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">Live Campus Sync</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {rightActions}
        <SignOutButton
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-700 font-display text-xs font-bold transition-all border border-rose-200/60 shadow-2xs cursor-pointer"
          title="Sign Out"
        >
          <span>🚪</span>
          <span className="hidden sm:inline">Sign Out</span>
        </SignOutButton>
      </div>
    </header>
  );
}
