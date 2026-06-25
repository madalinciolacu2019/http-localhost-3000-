'use client';

import React, { createContext, useContext } from 'react';

interface GlobalEventContextType {}

const GlobalEventContext = createContext<GlobalEventContextType | undefined>(undefined);

export function GlobalEventProvider({ children }: { children: React.ReactNode }) {
  return (
    <GlobalEventContext.Provider value={{}}>
      {children}
    </GlobalEventContext.Provider>
  );
}

export function useGlobalEvent() {
  const context = useContext(GlobalEventContext);
  if (context === undefined) {
    throw new Error('useGlobalEvent must be used within a GlobalEventProvider');
  }
  return context;
}
