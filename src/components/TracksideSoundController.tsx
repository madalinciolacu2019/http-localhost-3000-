'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sliders, Radio, Wind, Users, Zap, Minimize2, Maximize2, X } from 'lucide-react';

type AudioChannel = {
  id: string;
  label: string;
  icon: React.ElementType;
  url: string;
  defaultVolume: number;
  color: string;
};

const ENGINE_V6_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
const ENGINE_V10_URL = 'https://assets.mixkit.co/active_storage/sfx/2681/2681-preview.mp3';

const CHANNELS: AudioChannel[] = [
  { 
    id: 'engine', 
    label: 'V6 Turbo Hybrid Idle', 
    icon: Zap, 
    url: ENGINE_V6_URL, 
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
  const [isV10, setIsV10] = useState(false);
  const [pitRadioActive, setPitRadioActive] = useState(false);
  const [pitRadioText, setPitRadioText] = useState('');
  
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

  const playClickBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const toggleEngineType = () => {
    playClickBeep();
    const nextIsV10 = !isV10;
    setIsV10(nextIsV10);

    const engineAudio = audioRefs.current['engine'];
    if (engineAudio) {
      const wasPlaying = !engineAudio.paused;
      engineAudio.pause();
      engineAudio.src = nextIsV10 ? ENGINE_V10_URL : ENGINE_V6_URL;
      engineAudio.load();
      if (wasPlaying && isPlaying) {
        engineAudio.play().catch(() => {});
      }
    }
  };

  // Sync master play/pause actions
  const toggleMasterPlayback = () => {
    playClickBeep();
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

  const playPitRadio = (text: string) => {
    playClickBeep();
    setPitRadioActive(true);
    setPitRadioText(text);

    // 1. Synthesize Walkie-Talkie Radio beep/chirp using Web Audio API
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }

    // 2. Browser Speech Synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.pitch = 0.8;
      utterance.rate = 1.05;
      utterance.volume = volumes['radio'] !== undefined ? volumes['radio'] : 0.5;

      utterance.onend = () => {
        // Play static turn-off chirp
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc2.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(440, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
          
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          
          osc2.start();
          osc2.stop(ctx.currentTime + 0.08);
        } catch (e) {}
        
        setPitRadioActive(false);
      };

      utterance.onerror = () => {
        setPitRadioActive(false);
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 150);
    } else {
      setTimeout(() => {
        setPitRadioActive(false);
      }, 1500);
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
            onClick={() => { playClickBeep(); setIsOpen(true); }}
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
            className="glass w-[340px] rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl bg-carbon-black/95 max-h-[85vh] overflow-y-auto"
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
                onClick={() => { playClickBeep(); setIsOpen(false); }}
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

            {/* Engine Type Calibration Selection */}
            <div className="px-4 pb-3 pt-3 border-b border-white/5 bg-black/30 flex items-center justify-between gap-2">
              <span className="font-orbitron text-[9px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                <Zap size={10} className="text-pit-yellow" />
                ENGINE SELECTOR:
              </span>
              <button
                onClick={toggleEngineType}
                className={`py-1 px-3 rounded-lg font-orbitron text-[8.5px] font-black tracking-wider uppercase transition-all border ${
                  isV10 
                    ? 'bg-pit-yellow/15 border-pit-yellow text-pit-yellow shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                    : 'bg-racing-red/15 border-racing-red text-racing-red shadow-[0_0_10px_rgba(225,6,0,0.25)]'
                }`}
              >
                {isV10 ? 'CLASSIC V10 SCREAM' : 'MODERN V6 HYBRID'}
              </button>
            </div>

            {/* Mixer Channel Array */}
            <div className="p-4 space-y-4 border-b border-white/5">
              {CHANNELS.map((channel) => {
                const currentVol = volumes[channel.id] ?? channel.defaultVolume;
                const IconComponent = channel.icon as any;
                
                let labelText = channel.label;
                if (channel.id === 'engine') {
                  labelText = isV10 ? 'V10 Classic Engine Scream' : 'V6 Turbo Hybrid Idle';
                }

                return (
                  <div key={channel.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="flex items-center gap-1.5 font-orbitron font-bold text-white/80">
                        <IconComponent size={10} style={{ color: channel.color }} />
                        {labelText}
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

            {/* Pit Radio Soundboard Grid */}
            <div className="p-4 bg-black/40 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-orbitron text-[9px] font-black text-white/60 tracking-wider uppercase flex items-center gap-1">
                  <Radio size={10} className="text-racing-red" />
                  PIT RADIO TRANSMITTER
                </span>
                {pitRadioActive ? (
                  <span className="flex items-center gap-1 text-[8px] font-mono text-racing-red animate-pulse font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-racing-red" />
                    LIVE
                  </span>
                ) : (
                  <span className="text-[8px] font-mono text-white/30 uppercase">STANDBY</span>
                )}
              </div>

              {pitRadioActive && (
                <div className="bg-racing-red/10 border border-racing-red/20 rounded-xl p-2.5 font-mono text-[9px] text-racing-red flex items-center justify-between gap-2 overflow-hidden shadow-[inset_0_0_10px_rgba(225,6,0,0.15)] animate-pulse">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Radio size={10} className="shrink-0" />
                    <span className="truncate italic font-bold">"{pitRadioText}"</span>
                  </div>
                  <div className="flex gap-0.5 items-end h-3 shrink-0">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['20%', '100%', '20%'] }}
                        transition={{ repeat: Infinity, duration: 0.3 + i * 0.1 }}
                        className="w-0.5 bg-racing-red"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Box Box Box', quote: 'Box Box Box, confirm pitstop entry.' },
                  { label: 'Leave Me Alone', quote: 'Leave me alone, I know what I am doing!' },
                  { label: 'No Michael No', quote: 'No Michael No, that was so not right!' },
                  { label: 'GP2 Engine', quote: 'GP2 engine, GP2. Argh!' },
                  { label: 'Tires Are Dead', quote: 'Bono, my tires are dead!' },
                  { label: 'Hammer Time', quote: 'Lewis, it is Hammer Time!' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => playPitRadio(item.quote)}
                    className="p-2 glass border border-white/5 rounded-xl text-left hover:border-racing-red/40 hover:bg-white/5 transition-all text-white/70 hover:text-white flex flex-col justify-between h-[52px]"
                  >
                    <div className="text-[8px] font-mono text-white/30 uppercase">UPLINK CH.{idx+1}</div>
                    <div className="font-orbitron text-[9px] font-black uppercase tracking-wide leading-tight line-clamp-2">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Interactive frequency HUD bar visualization base */}
            <div className="p-3 bg-black/60 border-t border-white/5 flex items-center justify-between">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">OUTPUT SPECTRUM</span>
              <div className="flex items-center gap-0.5 h-3">
                {Array.from({ length: 24 }).map((_, i) => {
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
