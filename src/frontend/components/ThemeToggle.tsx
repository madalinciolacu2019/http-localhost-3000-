'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';

export default function ThemeToggle() {
  const { playSound } = useSound();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Dynamic Day/Night Sync
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    
    // Check if next race is a night race
    import('@/shared/lib/f1Calendar').then(({ getNextRace }) => {
      const nextRace = getNextRace();
      if (nextRace?.isNightRace) {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        // Force night theme in UI
        document.documentElement.classList.add('force-night-race');
      } else if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    });
  }, []);

  const toggleTheme = () => {
    playSound('gear-shift');
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass p-2.5 rounded-full border border-white/5 hover:border-racing-red/40 hover:bg-racing-red/10 transition-all text-white/50 hover:text-white flex items-center justify-center relative cursor-pointer group"
      title={theme === 'dark' ? 'Switch to Trackside Light Theme' : 'Switch to Carbon Dark Theme'}
    >
      <div className="relative w-4 h-4">
        {theme === 'dark' ? (
          <Sun size={16} className="absolute inset-0 text-pit-yellow transition-transform duration-500 rotate-0 scale-100 group-hover:rotate-45" />
        ) : (
          <Moon size={16} className="absolute inset-0 text-blue-400 transition-transform duration-500 rotate-0 scale-100 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
}
