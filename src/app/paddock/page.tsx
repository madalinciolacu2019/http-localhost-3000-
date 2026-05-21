"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Shield, Map, ArrowRight, ChevronRight, QrCode, Terminal } from "lucide-react";
import { useSound } from "@/context/SoundContext";

const paddockLinks = [
  { id: "pass", label: "VIP CREDENTIALS", icon: QrCode, href: "/paddock/pass", image: "/paddock_lounge.png", desc: "Holographic Paddock Pass Generator" },
  { id: "drivers", label: "THE DRIVERS", icon: Trophy, href: "/paddock/drivers", image: "/paddock_lounge.png", desc: "Hall of Fame & Active Champions" },
  { id: "teams", label: "THE CONSTRUCTORS", icon: Shield, href: "/paddock/teams", image: "/paddock_teams.png", desc: "Engineering & Team Heritage" },
  { id: "tracks", label: "THE CIRCUITS", icon: Map, href: "/paddock/tracks", image: "/paddock_tracks.png", desc: "Global Race Calendar & Data" },
  { id: "repos", label: "TELEMETRY REPOS", icon: Terminal, href: "/paddock/repositories", image: "/paddock_lounge.png", desc: "Open-Source GitHub Repositories" },
];

export default function PaddockPage() {
  const { playSound } = useSound ? useSound() : { playSound: () => {} };
  return (
    <main className="pt-32 pb-20 px-6 min-h-screen bg-[radial-gradient(circle_at_bottom_left,rgba(225,6,0,0.03),transparent)]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">The Paddock</h1>
          <p className="text-white/40 max-w-2xl font-light">The nerve center of Formula 1. Access detailed databases on the athletes, the machines, and the arenas.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {paddockLinks.map((link, i) => (
            <Link 
              key={link.id} 
              href={link.href}
              onClick={() => playSound && playSound('gear-shift')}
              className="group relative h-[450px] glass rounded-3xl border-white/5 overflow-hidden flex flex-col justify-end p-10 hover:border-racing-red/30 transition-all duration-500"
            >
              {/* Background Image */}
              <img 
                src={link.image} 
                alt={link.label}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-1000"
              />
              
              {/* Background Accent */}
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),transparent)] z-10" />
              <div className="absolute top-10 left-10 p-6 glass rounded-2xl bg-white/5 group-hover:bg-racing-red transition-all duration-500 z-20">
                <link.icon size={40} className="text-white group-hover:scale-110 transition-transform" />
              </div>

              {/* Content */}
              <div className="relative z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-orbitron text-3xl font-black mb-2 text-white italic">{link.label}</h3>
                <p className="text-white/40 text-xs mb-8 uppercase tracking-widest font-bold">{link.desc}</p>
                <div className="flex items-center gap-3 text-racing-red font-orbitron text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                  ENTER SECTION <ArrowRight size={14} />
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-racing-red/10 skew-x-[45deg] translate-x-12 -translate-y-12 transition-transform group-hover:translate-x-10 group-hover:-translate-y-10" />
            </Link>
          ))}
        </div>

        {/* Live Feed Teaser */}
        <div className="mt-20 glass p-8 rounded-2xl border-white/5 flex items-center justify-between gap-6 overflow-hidden relative">
          <div className="flex items-center gap-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-racing-red animate-pulse"></span>
              <span className="font-orbitron text-[10px] font-bold uppercase tracking-widest text-racing-red">Live Telemetry</span>
            </div>
            <p className="text-white/40 text-xs font-medium">Session In Progress: FP1 - Silverstone Grand Prix</p>
          </div>
          <Link 
            href="/paddock/telemetry"
            onClick={() => playSound && playSound('gear-shift')}
            className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-2 transition-colors relative z-10 no-underline"
          >
            View Live Data <ChevronRight size={14} />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-racing-red/5 to-transparent" />
        </div>
      </div>
    </main>
  );
}
