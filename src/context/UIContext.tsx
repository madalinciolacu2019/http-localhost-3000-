'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UIContextType {
  raceMode: boolean;
  setRaceMode: (mode: boolean) => void;
  isRaceCenterVisible: boolean;
  setIsRaceCenterVisible: (visible: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [raceMode, setRaceMode] = useState(false);
  const [isRaceCenterVisible, setIsRaceCenterVisible] = useState(false);

  // Persistence
  useEffect(() => {
    const stored = localStorage.getItem('apex_race_mode');
    if (stored === 'true') {
      setRaceMode(true);
      setIsRaceCenterVisible(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('apex_race_mode', raceMode.toString());
  }, [raceMode]);

  return (
    <UIContext.Provider value={{ 
      raceMode, 
      setRaceMode, 
      isRaceCenterVisible, 
      setIsRaceCenterVisible 
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
