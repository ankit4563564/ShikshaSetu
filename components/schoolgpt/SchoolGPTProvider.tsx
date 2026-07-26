'use client';

import React, { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ContextRegistryProvider } from './context/ContextRegistry';
import { AmbientIntelligenceCoreProvider } from './core/AmbientIntelligenceCore';
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

  const getRoleFromPath = () => {
    if (pathname.includes('/parent')) return 'parent';
    if (pathname.includes('/student')) return 'student';
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/driver')) return 'driver';
    if (pathname.includes('/gate')) return 'gate';
    if (pathname.includes('/vendor')) return 'vendor';
    return 'teacher';
  };

  const getModuleFromPath = () => {
    if (pathname.includes('attendance')) return 'attendance';
    if (pathname.includes('marks')) return 'marks';
    if (pathname.includes('homework')) return 'homework';
    if (pathname.includes('growth')) return 'growth';
    if (pathname.includes('ptm')) return 'ptm';
    if (pathname.includes('parent')) return 'safety';
    return 'general';
  };

  const getScreenName = () => {
    if (pathname === '/' || pathname === '') return 'AI Assistant';
    if (pathname.includes('/parent')) return 'Parent Portal';
    if (pathname.includes('/student')) return 'Student Workspace';
    if (pathname.includes('/admin')) return 'Admin Workspace';
    if (pathname.includes('/driver')) return 'Driver Telemetry';
    if (pathname.includes('/gate')) return 'Gate Protocol';
    if (pathname.includes('/teacher')) return 'Teacher Workspace';
    return 'AI Assistant';
  };

  return (
    <ContextRegistryProvider
      initialContext={{
        role: getRoleFromPath() as any,
        module: getModuleFromPath() as any,
        studentName: 'Aarav Sharma',
        classGrade: '8',
        classSection: 'A',
      }}
    >
      <AmbientIntelligenceCoreProvider>
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
            screenName={getScreenName()}
          />

          {/* Global Intelligence Side Drawer */}
          <SchoolGPTDrawer
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            role={getRoleFromPath() as any}
            studentId="stu-aarav"
            classGrade="8"
            classSection="A"
          />
        </SchoolGPTContext.Provider>
      </AmbientIntelligenceCoreProvider>
    </ContextRegistryProvider>
  );
}
