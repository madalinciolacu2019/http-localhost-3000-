'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Trophy, Flag, History, Zap, ArrowRight, Gauge } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

const teams = [
  { id: 1, name: 'Ferrari', color: '#E10600', base: 'Maranello, Italy', titles: 16, drivers: ['Leclerc', 'Sainz'], car: 'SF-24', description: 'The most successful and iconic team in F1 history. Red is not just a color, it is a passion.' },
  { id: 2, name: 'Red Bull Racing', color: '#0600EF', base: 'Milton Keynes, UK', titles: 6, drivers: ['Verstappen', 'Perez'], car: 'RB20', description: 'Defined by innovation and relentless speed. Breaking the dominance through engineering excellence.' },
  { id: 3, name: 'Mercedes-AMG', color: '#27F4D2', base: 'Brackley, UK', titles: 8, drivers: ['Hamilton', 'Russell'], car: 'W15', description: 'The Silver Arrows. A legacy of precision, reliability, and unparalleled performance streaks.' },
  { id: 4, name: 'McLaren', color: '#FF8700', base: 'Woking, UK', titles: 8, drivers: ['Norris', 'Piastri'], car: 'MCL38', description: 'Papaya pride. Combining a rich history of legends with a futuristic vision for racing.' },
  { id: 5, name: 'Aston Martin', color: '#006F62', base: 'Silverstone, UK', titles: 0, drivers: ['Alonso', 'Stroll'], car: 'AMR24', description: 'British luxury meets high-speed ambition. Building a new era of racing pedigree.' },
];

const TeamCard = ({ team }: { team: typeof teams[0] }) => {
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onMouseEnter={() => { setIsHovered(true); playSound('click'); }}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative glass p-10 rounded-3xl border-white/5 hover:border-white/10 transition-all duration-700 overflow-hidden"
    >
      {/* Team Color Accent */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 group-hover:opacity-30 transition-all duration-700"
        style={{ backgroundColor: team.color }}
      />
      <div 
        className="absolute top-0 left-0 w-full h-[4px] transition-all duration-700 group-hover:h-[8px]"
        style={{ backgroundColor: team.color }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-4">
            <div className="p-4 glass rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
              <Shield size={32} style={{ color: team.color }} />
            </div>
            <div>
              <h3 className="font-orbitron text-4xl font-black italic">{team.name}</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">{team.base}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-white/30 uppercase block mb-1">Titles</span>
            <span className="font-orbitron text-3xl font-black text-racing-red">{team.titles}</span>
          </div>
        </div>

        <p className="text-white/60 text-sm mb-12 leading-relaxed max-w-2xl">{team.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass p-6 rounded-2xl border-white/5 bg-carbon-black/30">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-white/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Current Lineup</span>
            </div>
            <div className="flex gap-4">
              {team.drivers.map((d, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-orbitron text-xs font-bold">{d}</span>
                  <div className="w-12 h-[2px] mt-1" style={{ backgroundColor: team.color }} />
                </div>
              ))}
            </div>
          </div>
          <div className="glass p-6 rounded-2xl border-white/5 bg-carbon-black/30">
            <div className="flex items-center gap-2 mb-4">
              <Gauge size={14} className="text-white/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Current Chassis</span>
            </div>
            <span className="font-orbitron text-xl font-black italic text-white/80">{team.car}</span>
          </div>
        </div>

        <button 
          className="btn-racing !bg-transparent border border-white/10 hover:!bg-white group/btn flex items-center justify-center gap-4 w-full md:w-auto"
          onClick={() => playSound('engine-rev')}
        >
          <span className="group-hover/btn:text-black">ENTER GARAGE</span>
          <ArrowRight size={18} className="group-hover/btn:translate-x-2 group-hover/btn:text-black transition-all" />
        </button>
      </div>
    </motion.div>
  );
};

const TeamsPage = () => {
  return (
    <main className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-racing-red"></span>
            <span className="font-orbitron text-racing-red font-bold tracking-[0.3em] text-xs uppercase">The Constructors</span>
          </div>
          <h1 className="font-orbitron text-6xl md:text-8xl font-black mb-6">THE TEAMS</h1>
          <p className="text-white/40 max-w-2xl italic font-light">Explore the engineering powerhouses behind the world's fastest racing machines.</p>
        </header>

        {/* Teams List */}
        <div className="flex flex-col gap-12">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>

        {/* Engineering Teaser */}
        <div className="mt-32 p-20 glass rounded-[3rem] border-white/5 bg-[radial-gradient(circle_at_bottom_left,rgba(225,6,0,0.05),transparent)] text-center">
          <Zap size={48} className="text-racing-red mx-auto mb-8 animate-pulse" />
          <h3 className="font-orbitron text-4xl font-black mb-6 italic">NEXT-GEN AERODYNAMICS</h3>
          <p className="text-white/40 max-w-2xl mx-auto mb-10 text-sm leading-relaxed">We don't just build cars; we sculpt the wind. Learn about the technological breakthroughs that define the current era of Formula 1.</p>
          <button className="btn-racing">EXPLORE TECH DEPT</button>
        </div>
      </div>
    </main>
  );
};

export default TeamsPage;
