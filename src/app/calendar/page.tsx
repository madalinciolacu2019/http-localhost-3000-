'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/frontend/components/Navbar';
import Footer from '@/frontend/components/Footer';
import { f1Races, getNextRace, parseLocalDate } from '@/shared/lib/f1Calendar';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CloudRain, Thermometer, Flag, Moon } from 'lucide-react';

export default function CalendarPage() {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const nextRace = getNextRace(now) || f1Races[0];
  const nextRaceStart = parseLocalDate(nextRace.startDate, "00:00:00");
  const timeDiff = nextRaceStart.getTime() - now.getTime();
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-carbon-black pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-racing-red/5 skew-x-[-15deg] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          {/* Header & Live Countdown */}
          <div className="glass border border-white/10 rounded-3xl p-8 md:p-12 bg-black/60 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-racing-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
              <div>
                <h1 className="font-orbitron text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-4">
                  SEASON <span className="text-racing-red">CALENDAR</span>
                </h1>
                <div className="flex items-center gap-3 text-white/60">
                  <Flag size={20} className="text-racing-red" />
                  <span className="font-mono uppercase tracking-widest text-sm">Next Grand Prix: {nextRace.name}</span>
                </div>
              </div>

              {/* Countdown Timer */}
              {timeDiff > 0 && (
                <div className="flex gap-4">
                  {[
                    { label: 'Days', value: days },
                    { label: 'Hours', value: hours },
                    { label: 'Mins', value: minutes },
                    { label: 'Secs', value: seconds },
                  ].map((unit, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="glass bg-black/80 border border-white/10 rounded-xl w-16 h-16 flex items-center justify-center shadow-[0_0_15px_rgba(225,6,0,0.15)] mb-2">
                        <span className="font-orbitron font-black text-2xl text-white">{unit.value.toString().padStart(2, '0')}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">{unit.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Races Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {f1Races.map((race) => {
              const raceStart = parseLocalDate(race.startDate, "00:00:00");
              const isPast = raceStart < now;
              const isNext = race.round === nextRace.round;

              return (
                <motion.div
                  key={race.round}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`glass p-6 rounded-2xl border transition-all duration-300 ${isNext ? 'border-racing-red shadow-[0_0_30px_rgba(225,6,0,0.15)] bg-racing-red/5' : isPast ? 'border-white/5 bg-black/40 opacity-60' : 'border-white/10 hover:border-white/20 bg-black/60'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-orbitron text-4xl font-black text-white/10 italic">
                      {race.round.toString().padStart(2, '0')}
                    </span>
                    {race.isNightRace && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <Moon size={12} className="text-blue-400" />
                        <span className="text-[9px] font-mono text-white/60 uppercase">Night Race</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-orbitron text-xl font-bold text-white mb-1 uppercase tracking-tight">{race.name}</h3>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <MapPin size={16} className="text-racing-red" />
                      <span className="truncate">{race.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <Calendar size={16} className="text-racing-red" />
                      <span>{new Date(race.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(race.endDate).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Thermometer size={14} className="text-pit-yellow" />
                        <span className="text-xs font-mono text-white/50">{race.trackTemp}°C Track</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CloudRain size={14} className="text-blue-400" />
                        <span className="text-xs font-mono text-white/50">{race.chanceOfRain}% Rain</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
