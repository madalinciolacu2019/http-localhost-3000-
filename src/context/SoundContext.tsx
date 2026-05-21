'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';

type SoundType = 'engine-rev' | 'gear-shift' | 'pit-stop' | 'click' | 'ambient';

interface SoundContextType {
  playSound: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sounds = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Preload sounds
    const soundUrls: Record<SoundType, string> = {
      'engine-rev': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      'gear-shift': 'https://assets.mixkit.co/active_storage/sfx/2565/2565-preview.mp3',
      'pit-stop': 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
      'click': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      'ambient': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    };

    Object.entries(soundUrls).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      sounds.current[name] = audio;
    });
  }, []);

  const playSound = (type: SoundType) => {
    const audio = sounds.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Browser might block audio until first interaction
      });
    }
  };

  return (
    <SoundContext.Provider value={{ playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
