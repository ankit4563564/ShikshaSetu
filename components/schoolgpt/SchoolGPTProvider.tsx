'use client';

import React, { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ContextRegistryProvider } from './context/ContextRegistry';
import { AmbientIntelligenceCoreProvider } from './core/AmbientIntelligenceCore';
import SchoolGPTOrb from './SchoolGPTOrb';
import SchoolGPTDrawer from './SchoolGPTDrawer';

import { useContextRegistry } from './context/ContextRegistry';

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

function ContextPathSync() {
  const pathname = usePathname();
  const { setContext } = useContextRegistry();

  React.useEffect(() => {
    if (pathname.includes('/parent')) {
      setContext({ role: 'parent', studentName: 'Aarav Sharma', classGrade: '8', classSection: 'A', isDemoMode: false });
    } else if (pathname.includes('/teacher')) {
      setContext({ role: 'teacher', studentName: 'Aarav Sharma', classGrade: '8', classSection: 'A', isDemoMode: false });
    } else if (pathname.includes('/student')) {
      setContext({ role: 'student', studentName: 'Aarav Sharma', classGrade: '8', classSection: 'A', isDemoMode: false });
    } else if (pathname.includes('/admin')) {
      setContext({ role: 'admin', isDemoMode: false });
    } else if (pathname.includes('/driver')) {
      setContext({ role: 'driver', isDemoMode: false });
    } else if (pathname.includes('/gate')) {
      setContext({ role: 'gate', isDemoMode: false });
    } else if (pathname.includes('/vendor')) {
      setContext({ role: 'vendor', isDemoMode: false });
    } else {
      setContext({ role: 'landing', studentName: undefined, classGrade: undefined, classSection: undefined, isDemoMode: false, demoRole: undefined });
    }
  }, [pathname, setContext]);

  return null;
}

export function SchoolGPTProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const getRoleFromPath = () => {
    if (pathname.includes('/parent')) return 'parent';
    if (pathname.includes('/teacher')) return 'teacher';
    if (pathname.includes('/student')) return 'student';
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/driver')) return 'driver';
    if (pathname.includes('/gate')) return 'gate';
    if (pathname.includes('/vendor')) return 'vendor';
    return 'landing';
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
    if (pathname === '/' || pathname === '' || pathname === '/landing') return 'AI Product Guide';
    if (pathname.includes('/parent')) return 'Parent Portal';
    if (pathname.includes('/student')) return 'Student Workspace';
    if (pathname.includes('/admin')) return 'Admin Workspace';
    if (pathname.includes('/driver')) return 'Driver Telemetry';
    if (pathname.includes('/gate')) return 'Gate Protocol';
    if (pathname.includes('/teacher')) return 'Teacher Workspace';
    return 'AI Product Guide';
  };

  const currentRole = getRoleFromPath();

  return (
    <ContextRegistryProvider
      initialContext={{
        role: currentRole as any,
        module: getModuleFromPath() as any,
        studentName: currentRole === 'landing' ? undefined : 'Aarav Sharma',
        classGrade: currentRole === 'landing' ? undefined : '8',
        classSection: currentRole === 'landing' ? undefined : 'A',
      }}
    >
      <ContextPathSync />
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
            screenName={getScreenName()}
          />
        </SchoolGPTContext.Provider>
      </AmbientIntelligenceCoreProvider>
    </ContextRegistryProvider>
  );
}
