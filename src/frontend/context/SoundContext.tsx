'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';

type SoundType = 'engine-rev' | 'gear-shift' | 'pit-stop' | 'click' | 'ambient' | 'scanner' | 'success' | 'error' | 'engine-start';

interface SoundContextType {
  playSound: (type: SoundType) => void;
  playRadioMessage: (text: string) => void;
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
      'scanner': 'https://assets.mixkit.co/active_storage/sfx/1653/1653-preview.mp3',
      'success': 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
      'error': 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
      'engine-start': 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3',
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

  const playRadioMessage = (text: string) => {
    // Play the real F1 "Box Box" radio audio
    try {
      const audio = new Audio('/radio.webm');
      audio.volume = 0.6;
      audio.play().catch(e => console.warn('Browser blocked audio playback', e));
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  return (
    <SoundContext.Provider value={{ playSound, playRadioMessage }}>
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

