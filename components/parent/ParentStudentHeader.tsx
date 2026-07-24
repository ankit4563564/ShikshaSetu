'use client';

import { motion, AnimatePresence } from 'framer-motion';

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
}

export function ParentStudentHeader({
  activeStudent,
  currentStudents,
  selectedStudentId,
  onStudentChange,
  isLoading = false,
}: ParentStudentHeaderProps) {
  return (
    <header className="parent-portal-header bg-white/80 backdrop-blur-xl border-b border-white/70 px-5 py-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-deep-teal/5 font-display text-sm font-bold text-deep-teal border border-deep-teal/5">
          {activeStudent?.displayName.split(' ').map(n => n[0]).join('') || 'NA'}
        </div>
        <div>
          {currentStudents.length > 1 ? (
            <div className="relative inline-block">
              <select
                value={activeStudent?.studentId || ''}
                onChange={(e) => onStudentChange(e.target.value)}
                disabled={isLoading}
                className="bg-transparent font-display text-md font-extrabold text-deep-teal outline-none focus:ring-1 focus:ring-deep-teal/15 rounded pr-6 cursor-pointer border border-transparent hover:border-deep-teal/10 py-0.5 px-1.5 transition-all disabled:opacity-50"
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
            <h2 className="font-display text-md font-extrabold leading-tight text-deep-teal px-1.5">
              {activeStudent?.displayName || 'Student'}
            </h2>
          )}
          <p className="font-body text-[10px] text-deep-teal/50 font-medium px-1.5 mt-0.5">
            Grade 8A &middot; Ms. Mehra
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-[10px] uppercase tracking-wider">
          📱 Parent Mobile App
        </span>
      </div>
    </header>
  );
}
