'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DomainContext, SchoolGPTRole, SchoolGPTModule } from './types';

interface ContextRegistryValue {
  context: DomainContext;
  setContext: (updates: Partial<DomainContext>) => void;
  resetContext: () => void;
}

const defaultContext: DomainContext = {
  role: 'landing',
  module: 'general',
};

const ContextRegistryContext = createContext<ContextRegistryValue | undefined>(undefined);

export function ContextRegistryProvider({
  children,
  initialContext,
}: {
  children: React.ReactNode;
  initialContext?: Partial<DomainContext>;
}) {
  const [context, setContextState] = useState<DomainContext>({
    ...defaultContext,
    ...initialContext,
  });

  const setContext = useCallback((updates: Partial<DomainContext>) => {
    setContextState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetContext = useCallback(() => {
    setContextState(defaultContext);
  }, []);

  return (
    <ContextRegistryContext.Provider value={{ context, setContext, resetContext }}>
      {children}
    </ContextRegistryContext.Provider>
  );
}

export function useContextRegistry() {
  const ctx = useContext(ContextRegistryContext);
  if (!ctx) {
    return {
      context: defaultContext,
      setContext: () => {},
      resetContext: () => {},
    };
  }
  return ctx;
}
