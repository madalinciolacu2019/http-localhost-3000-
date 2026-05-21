'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Timer, TrendingUp, Cloud, History, ExternalLink, Globe, Wind } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

const tracks = [
  { id: 1, name: 'Monaco', location: 'Monte Carlo', length: '3.337 KM', record: '1:12.909 (Hamilton)', history: 'The Jewel in the Crown. Tight, twisty and extremely unforgiving.', image: '/assets/tracks/monaco.png', difficulty: 'EXTREME' },
  { id: 2, name: 'Silverstone', location: 'United Kingdom', length: '5.891 KM', record: '1:27.097 (Verstappen)', history: 'The birthplace of F1. Home to iconic corners like Maggots and Becketts.', image: '/assets/tracks/silverstone.png', difficulty: 'HIGH' },
  { id: 3, name: 'Spa-Francorchamps', location: 'Belgium', length: '7.004 KM', record: '1:46.286 (Bottas)', history: 'A majestic track in the Ardennes. Features the legendary Eau Rouge.', image: '/assets/tracks/spa.png', difficulty: 'HIGH' },
  { id: 4, name: 'Monza', location: 'Italy', length: '5.793 KM', record: '1:18.887 (Hamilton)', history: 'The Temple of Speed. High straights and heavy braking zones.', image: '/assets/tracks/monza.png', difficulty: 'MEDIUM' },
  { id: 5, name: 'Suzuka', location: 'Japan', length: '5.807 KM', record: '1:30.983 (Hamilton)', history: 'The only Figure-of-Eight track. A technical masterpiece.', image: '/assets/tracks/suzuka.png', difficulty: 'VERY HIGH' },
  { id: 6, name: 'Imola', location: 'Italy', length: '4.909 KM', record: '1:15.484 (Hamilton)', history: 'Classic old-school circuit with rapid elevation changes.', image: '/assets/tracks/imola.png', difficulty: 'HIGH' },
];

const TrackCard = ({ track }: { track: typeof tracks[0] }) => {
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => { setIsHovered(true); playSound('click'); }}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative glass p-8 rounded-2xl border-white/5 hover:border-racing-red/30 transition-all flex flex-col md:flex-row gap-8 items-center overflow-hidden"
    >
      {/* Visual Indicator */}
      <div className="absolute top-0 left-0 w-2 h-full bg-racing-red/20 group-hover:bg-racing-red transition-colors" />

      {/* Track Visual Image */}
      <div className="w-full md:w-48 aspect-square relative glass rounded-xl overflow-hidden flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(225,6,0,0.2)] transition-all duration-500">
        <img 
          src={track.image} 
          alt={track.name} 
          className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-black via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-3 right-3 flex flex-col items-end z-10">
          <div className="flex items-center gap-1 mb-1">
            <span className="w-4 h-[1px] bg-racing-red"></span>
            <span className="text-[8px] font-black text-racing-red uppercase tracking-widest">Difficulty</span>
          </div>
          <span className="text-[10px] font-orbitron font-black text-white/90">{track.difficulty}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-orbitron text-3xl font-black mb-1 group-hover:text-racing-red transition-colors">{track.name}</h3>
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Globe size={12} />
              <span className="font-bold uppercase tracking-widest">{track.location}</span>
            </div>
          </div>
          <button 
            className="p-3 glass rounded-full hover:bg-racing-red transition-all"
            onClick={() => playSound('gear-shift')}
          >
            <ExternalLink size={16} />
          </button>
        </div>

        <p className="text-white/50 text-xs mb-8 italic leading-relaxed max-w-xl">{track.history}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/30">
              <Timer size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Lap Record</span>
            </div>
            <div className="font-orbitron text-xs font-bold">{track.record}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/30">
              <TrendingUp size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Length</span>
            </div>
            <div className="font-orbitron text-xs font-bold">{track.length}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/30">
              <Cloud size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Weather</span>
            </div>
            <div className="font-orbitron text-xs font-bold">24°C / SUNNY</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/30">
              <Wind size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Grip Level</span>
            </div>
            <div className="font-orbitron text-xs font-bold text-racing-red">OPTIMAL</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TracksPage = () => {
  return (
    <main className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-racing-red"></span>
            <span className="font-orbitron text-racing-red font-bold tracking-[0.3em] text-xs uppercase">The Global Tour</span>
          </div>
          <h1 className="font-orbitron text-6xl md:text-8xl font-black mb-6">ICONIC TRACKS</h1>
          <p className="text-white/40 max-w-2xl italic font-light">From the streets of Monte Carlo to the high-speed Ardennes forest.</p>
        </header>

        {/* Tracks List */}
        <div className="space-y-8">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>

        {/* Global Map Teaser */}
        <div className="mt-32 glass p-20 rounded-3xl text-center border-racing-red/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <h3 className="font-orbitron text-3xl font-black mb-4 italic">LIVE TRACK DATA</h3>
          <p className="text-white/40 mb-10 max-w-xl mx-auto">Connect to our live telemetry system to track current race weather and sector times across the globe.</p>
          <Link href="/paddock/map" className="btn-racing inline-block no-underline">
            OPEN GLOBAL MAP
          </Link>
        </div>
      </div>
    </main>
  );
};

export default TracksPage;
