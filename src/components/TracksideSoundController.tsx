'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sliders, Radio, Wind, Users, Zap, Minimize2, Maximize2 } from 'lucide-react';

type AudioChannel = {
  id: string;
  label: string;
  icon: React.ElementType;
  url: string;
  defaultVolume: number;
  color: string;
};

const CHANNELS: AudioChannel[] = [
  { 
    id: 'engine', 
    label: 'V6 Turbo Hybrid Idle', 
    icon: Zap, 
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 
    defaultVolume: 0.4,
    color: '#E10600' 
  },
  { 
    id: 'crowd', 
    label: 'Trackside Grandstand Ambiance', 
    icon: Users, 
    url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', 
    defaultVolume: 0.25,
    color: '#3b82f6' 
  },
  { 
    id: 'radio', 
    label: 'Pitbox Radio Chatter', 
    icon: Radio, 
    url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', 
    defaultVolume: 0.3,
    color: '#fbbf24' 
  },
  { 
    id: 'steam', 
    label: 'Espresso Steam Extraction', 
    icon: Wind, 
    url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3', 
    defaultVolume: 0.2,
    color: '#22c55e' 
  }
];

export default function TracksideSoundController() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumes, setVolumes] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    CHANNELS.forEach(c => { init[c.id] = c.defaultVolume; });
    return init;
  });

  // Track real HTMLAudioElement references inside refs to persist cross-render playback seamlessly
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize Audio objects purely on the client side
  useEffect(() => {
    CHANNELS.forEach(channel => {
      const audio = new Audio(channel.url);
      audio.loop = true;
      audio.volume = isPlaying ? channel.defaultVolume : 0;
      audioRefs.current[channel.id] = audio;
    });

    return () => {
      // Cleanup loops on unmount
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  // Sync master play/pause actions
  const toggleMasterPlayback = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (nextState) {
        audio.volume = volumes[id] || 0;
        audio.play().catch(() => {
          // Soft catch if browser autoplay rules mandate stronger UI clicks
        });
      } else {
        audio.pause();
      }
    });
  };

  // Live adjustment of individual channel volumes
  const handleVolumeChange = (id: string, value: number) => {
    setVolumes(prev => ({ ...prev, [id]: value }));
    const audio = audioRefs.current[id];
    if (audio && isPlaying) {
      audio.volume = value;
      // Ensure audio plays if user moves slider up from zero
      if (audio.paused && value > 0) {
        audio.play().catch(() => {});
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[160] font-sans select-none pointer-events-auto">
      {/* Minimized Compact Node Trigger */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={`glass p-3 rounded-2xl border flex items-center gap-3 transition-all duration-300 shadow-2xl backdrop-blur-xl ${
              isPlaying 
                ? 'bg-black/90 border-racing-red shadow-[0_0_20px_rgba(225,6,0,0.4)]' 
                : 'bg-black/80 border-white/10 hover:border-white/20'
            }`}
          >
            <div className={`p-2 rounded-xl ${isPlaying ? 'bg-racing-red/20 text-racing-red animate-pulse' : 'bg-white/5 text-white/50'}`}>
              {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </div>
            <div className="text-left pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-orbitron text-[9px] font-black uppercase tracking-widest text-white">SOUNDSCAPE HUD</span>
                {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-racing-red animate-ping" />}
              </div>
              <div className="text-[8px] font-mono text-white/40 uppercase tracking-wider">
                {isPlaying ? 'Multi-Layer Loop Active' : 'Audio Mixing Inactive'}
              </div>
            </div>
            
            {/* Live Waveform Indicator animation */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-4 px-1">
                {[0.8, 0.4, 1.0, 0.6, 0.3].map((height, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ height: [`${height * 40}%`, '100%', `${height * 30}%`] }}
                    transition={{ repeat: Infinity, duration: 0.6 + idx * 0.1, ease: 'easeInOut' }}
                    className="w-0.5 bg-racing-red rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.button>
        ) : (
          /* Maximized Cinematic Telemetry Module */
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass w-[340px] rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl bg-carbon-black/95"
          >
            {/* Crimson Top Accent strip */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-racing-red to-transparent" />
            
            {/* Title header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-racing-red" />
                <span className="font-orbitron text-[10px] font-black tracking-widest text-white uppercase">TRACKSIDE SOUNDSCAPE</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Minimize2 size={12} />
              </button>
            </div>

            {/* Master Activation Block */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-b from-transparent to-black/40">
              <button
                onClick={toggleMasterPlayback}
                className={`w-full py-2.5 px-4 rounded-xl font-orbitron text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-between border ${
                  isPlaying 
                    ? 'bg-racing-red/10 border-racing-red text-racing-red shadow-[0_0_15px_rgba(225,6,0,0.3)]' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-white/70 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-racing-red animate-pulse' : 'bg-white/30'}`} />
                  {isPlaying ? 'MASTER AUDIO LIVE' : 'ACTIVATE AMBIENT AUDIO'}
                </span>
                {isPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
            </div>

            {/* Mixer Channel Array */}
            <div className="p-4 space-y-4">
              {CHANNELS.map((channel) => {
                const currentVol = volumes[channel.id] ?? channel.defaultVolume;
                const IconComponent = channel.icon as any;
                return (
                  <div key={channel.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="flex items-center gap-1.5 font-orbitron font-bold text-white/80">
                        <IconComponent size={10} style={{ color: channel.color }} />
                        {channel.label}
                      </span>
                      <span className="font-mono text-[9px] text-white/40">
                        {Math.round(currentVol * 100)}%
                      </span>
                    </div>
                    
                    <div className="relative flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={currentVol}
                        onChange={(e) => handleVolumeChange(channel.id, parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-racing-red"
                      />
                      {/* Active level dot */}
                      <span 
                        className="w-1.5 h-1.5 rounded-full shrink-0 transition-all" 
                        style={{ 
                          backgroundColor: currentVol > 0 && isPlaying ? channel.color : '#333',
                          boxShadow: currentVol > 0 && isPlaying ? `0 0 8px ${channel.color}` : 'none' 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Interactive frequency HUD bar visualization base */}
            <div className="p-3 bg-black/60 border-t border-white/5 flex items-center justify-between">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">OUTPUT SPECTRUM</span>
              <div className="flex items-center gap-0.5 h-3">
                {Array.from({ length: 24 }).map((_, i) => {
                  // Simulate equalizer frequency activation mapped to play state
                  const active = isPlaying && Math.random() > 0.3;
                  return (
                    <div 
                      key={i} 
                      className="w-1 rounded-sm transition-all duration-150"
                      style={{ 
                        height: active ? `${20 + Math.random() * 80}%` : '20%',
                        backgroundColor: active ? (i % 3 === 0 ? '#E10600' : '#fbbf24') : '#222' 
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
