'use client';

import React from 'react';
import { Flag, Play, AlertCircle, Award } from 'lucide-react';

const tickerItems = [
  { text: "🏁 APEX FUEL STATION IS ACTIVE - PRESSURE INJECTORS CONFIRMED AT 9.0 BAR", icon: Play, color: "text-racing-red" },
  { text: "⚡ LEADERBOARD UPDATED - DRIVER 'L. HAMILTON' LEADS THE STANDINGS WITH 42,900 ERS POINTS", icon: Award, color: "text-yellow-400" },
  { text: "🚦 NEXT TRACK RACE STARTS IN 2H 14M 12S - PADDOCK CLUB ENTRANCES ARE OPEN", icon: Flag, color: "text-green-400" },
  { text: "⚠️ LOW STOCK WARNING: PIT CREW HOODIES SELLING OUT FAST - SECURE YOUR KIT NOW", icon: AlertCircle, color: "text-racing-red" },
];

export default function LedTicker() {
  return (
    <div className="w-full bg-black/90 border-y border-white/5 py-3 relative overflow-hidden backdrop-blur-md select-none shrink-0 z-30">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      
      <div className="ticker-wrap flex items-center w-full">
        <div className="ticker-content flex items-center gap-16 uppercase font-orbitron text-[9px] font-black tracking-[0.25em] text-white/60">
          {/* Double list to loop seamlessly */}
          {[...tickerItems, ...tickerItems].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3 shrink-0">
                <Icon size={12} className={item.color} />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
