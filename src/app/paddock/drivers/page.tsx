'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Flag, Search, Filter, ArrowRight, User, Hash, Globe, ChevronRight } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

const drivers = [
  { id: 1, name: 'Lewis Hamilton', team: 'Ferrari', championships: 7, wins: 105, poles: 104, nationality: 'British', number: 44, status: 'Active', image: "/assets/drivers/hamilton.png" },
  { id: 2, name: 'Max Verstappen', team: 'Red Bull', championships: 4, wins: 71, poles: 48, nationality: 'Dutch', number: 1, status: 'Active', image: "/assets/drivers/verstappen.png" },
  { id: 3, name: 'Charles Leclerc', team: 'Ferrari', championships: 0, wins: 8, poles: 27, nationality: 'Monegasque', number: 16, status: 'Active', image: "/assets/drivers/leclerc.png" },
  { id: 4, name: 'Lando Norris', team: 'McLaren', championships: 0, wins: 11, poles: 16, nationality: 'British', number: 4, status: 'Active', image: "/assets/drivers/norris.png" },
  { id: 5, name: 'Fernando Alonso', team: 'Aston Martin', championships: 2, wins: 32, poles: 22, nationality: 'Spanish', number: 14, status: 'Active', image: "/assets/drivers/alonso.png" },
  { id: 6, name: 'Ayrton Senna', team: 'McLaren', championships: 3, wins: 41, poles: 65, nationality: 'Brazilian', number: 12, status: 'Legend', image: "/assets/drivers/senna.png" },
  { id: 7, name: 'Michael Schumacher', team: 'Ferrari', championships: 7, wins: 91, poles: 68, nationality: 'German', number: 5, status: 'Legend', image: "/assets/drivers/schumacher.png" },
];

const StatCounter = ({ value, label, icon: Icon }: { value: number, label: string, icon: any }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    let timer = setInterval(() => {
      start += Math.ceil(end / 20);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className="text-racing-red" />
        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-orbitron text-2xl font-black">{count}</div>
    </div>
  );
};

const DriverCard = ({ driver }: { driver: typeof drivers[0] }) => {
  const { playSound } = useSound();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative glass rounded-2xl border-white/5 hover:border-racing-red/50 transition-all duration-500 overflow-hidden flex flex-col"
    >
      {/* Background Number */}
      <div className="absolute top-10 -right-5 font-orbitron text-9xl font-black text-white/5 group-hover:text-racing-red/10 transition-colors pointer-events-none italic z-0">
        #{driver.number}
      </div>

      {/* Driver Image Container */}
      <div className="relative h-64 overflow-hidden bg-black/40">
        <img 
          src={driver.image} 
          alt={driver.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
          style={{ objectPosition: 'center 20%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-black to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-racing-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Nationality Pill */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
          <Globe size={10} className="text-racing-red" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-white">{driver.nationality}</span>
        </div>

        {/* Status Pill */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 ${
          driver.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-racing-red/20 text-racing-red'
        }`}>
          {driver.status}
        </div>
      </div>

      <div className="p-8 relative z-10 flex-1 flex flex-col">
        <div className="mb-6">
          <h3 className="font-orbitron text-3xl font-black mb-1 group-hover:text-racing-red transition-colors leading-tight">
            {driver.name.split(' ')[0]}<br/>{driver.name.split(' ')[1]}
          </h3>
          <p className="font-orbitron text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase">{driver.team}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6 mb-6">
          <StatCounter value={driver.championships} label="Titles" icon={Trophy} />
          <StatCounter value={driver.wins} label="Wins" icon={Medal} />
          <StatCounter value={driver.poles} label="Poles" icon={Hash} />
        </div>

        <div className="mt-auto">
          <button 
            className="flex items-center gap-2 text-[10px] font-orbitron font-bold uppercase tracking-widest text-racing-red hover:text-white transition-colors group/btn"
            onClick={() => playSound('gear-shift')}
          >
            VIEW CAREER DATA <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DriversPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  return (
    <main className="pt-32 pb-20 px-6 min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.05),transparent)]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-[1px] bg-racing-red"></span>
              <span className="font-orbitron text-racing-red font-bold tracking-[0.3em] text-xs uppercase">Hall of Fame</span>
            </div>
            <h1 className="font-orbitron text-6xl md:text-8xl font-black mb-6">THE DRIVERS</h1>
            <p className="text-white/40 italic font-light">Comparing the legends of the past with the champions of today.</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                type="text" 
                placeholder="Search drivers..." 
                className="glass pl-12 pr-6 py-3 rounded-full border-white/10 focus:border-racing-red/50 outline-none font-orbitron text-[10px] uppercase tracking-widest w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex glass rounded-full p-1 border-white/10">
              {['All', 'Active', 'Legend'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-full font-orbitron text-[8px] font-bold uppercase transition-all ${
                    filter === f ? 'bg-racing-red text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Driver Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {drivers
            .filter(d => 
              (filter === 'All' || d.status === filter) &&
              (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.team.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
        </div>

        {/* Comparison Feature Teaser */}
        <div className="mt-32 glass p-12 rounded-3xl border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(225,6,0,0.03),transparent)] group-hover:translate-x-full transition-transform duration-1000" />
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex -space-x-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-24 h-24 rounded-full border-4 border-carbon-black bg-white/5 flex items-center justify-center glass shadow-2xl">
                  <User size={40} className="text-white/20" />
                </div>
              ))}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-orbitron text-2xl font-black mb-2">DRIVER COMPARISON TOOL</h3>
              <p className="text-white/40 text-sm max-w-xl">Analyze head-to-head statistics across eras. From Senna vs Schumacher to Verstappen vs Hamilton.</p>
            </div>
            <a href="/paddock/comparison" className="btn-racing">LAUNCH SIMULATOR</a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DriversPage;
