'use client';

import { type ReactNode } from 'react';
import { DemoProvider } from './DemoContext';

export default function DemoShell({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      {children}
    </DemoProvider>
  );
}
