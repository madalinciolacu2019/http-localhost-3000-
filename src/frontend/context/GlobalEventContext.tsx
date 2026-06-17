'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSound } from '@/frontend/context/SoundContext';

interface GlobalEventContextType {
  isOverheat: boolean;
  toggleOverheat: (state: boolean) => void;
}

const GlobalEventContext = createContext<GlobalEventContextType | undefined>(undefined);

export function GlobalEventProvider({ children }: { children: React.ReactNode }) {
  const [isOverheat, setIsOverheat] = useState(false);
  const { playSound } = useSound();

  const toggleOverheat = (state: boolean) => {
    setIsOverheat(state);
    if (state) {
      playSound('scanner'); // Can be a warning alarm if we had one
    } else {
      playSound('success');
    }
  };

  return (
    <GlobalEventContext.Provider value={{ isOverheat, toggleOverheat }}>
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
