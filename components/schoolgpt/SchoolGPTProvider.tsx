'use client';

import React, { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import SchoolGPTOrb from './SchoolGPTOrb';
import SchoolGPTDrawer from './SchoolGPTDrawer';

interface SchoolGPTContextType {
  isOpen: boolean;
  openSchoolGPT: () => void;
  closeSchoolGPT: () => void;
}

const SchoolGPTContext = createContext<SchoolGPTContextType>({
  isOpen: false,
  openSchoolGPT: () => {},
  closeSchoolGPT: () => {},
});

export function useSchoolGPT() {
  return useContext(SchoolGPTContext);
}

export function SchoolGPTProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Detect current screen name from pathname
  const getScreenDetails = () => {
    if (pathname.includes('/teacher')) return { name: 'Teacher Dashboard', role: 'Teacher', classGrade: 'Class 8A', studentName: 'Priya Patel' };
    if (pathname.includes('/parent')) return { name: 'Parent Portal', role: 'Parent', classGrade: 'Class 8A', studentName: 'Aarav Sharma' };
    if (pathname.includes('/student')) return { name: 'Student Workspace', role: 'Student', classGrade: 'Class 8A', studentName: 'Aarav Sharma' };
    if (pathname.includes('/admin')) return { name: 'Admin Portal', role: 'Administrator', classGrade: 'All Classes', studentName: 'School Universe' };
    if (pathname.includes('/driver')) return { name: 'Driver Telemetry', role: 'Driver', classGrade: 'Saket Route #4', studentName: 'Aarav Sharma' };
    if (pathname.includes('/gate')) return { name: 'Gate Entry Protocol', role: 'Gate Staff', classGrade: 'Main Gate #1', studentName: 'Aarav Sharma' };
    return { name: 'ShikshaSetu OS', role: 'User', classGrade: 'Class 8A', studentName: 'Aarav Sharma' };
  };

  const details = getScreenDetails();

  return (
    <SchoolGPTContext.Provider
      value={{
        isOpen,
        openSchoolGPT: () => setIsOpen(true),
        closeSchoolGPT: () => setIsOpen(false),
      }}
    >
      {children}

      {/* Global Floating Glassmorphic AI Orb (Everywhere) */}
      <SchoolGPTOrb
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        screenName={details.name}
      />

      {/* Global Intelligence Side Drawer */}
      <SchoolGPTDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        screenName={details.name}
        role={details.role}
        studentName={details.studentName}
        classNameLabel={details.classGrade}
      />
    </SchoolGPTContext.Provider>
  );
}
