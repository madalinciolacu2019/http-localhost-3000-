import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import FiveRedLightsGame from '@/frontend/components/FiveRedLightsGame';

// Must be a Server Component in Next.js — no 'use client', no hooks
export default function NotFound() {
  return (
    <main className="h-screen w-full flex items-center justify-center bg-[#15151E] p-6 overflow-hidden">
      {/* Background Warning Symbol */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <AlertTriangle size={800} className="text-[#E10600]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="bg-white/3 backdrop-blur-sm border border-[#E10600]/20 p-12 rounded-[3rem]">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-[#E10600]/10 rounded-full border border-[#E10600]/30">
              <AlertTriangle size={60} className="text-[#E10600]" />
            </div>
          </div>

          <h1 className="font-orbitron text-7xl md:text-9xl font-black mb-2 italic text-white drop-shadow-[0_0_30px_rgba(225,6,0,0.5)]"
              style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>
            404
          </h1>
          <h2 className="text-2xl font-black mb-6 tracking-[0.2em] uppercase text-white"
              style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>
            OFF TRACK / DNF
          </h2>

          <div className="w-full h-[2px] bg-white/5 mb-8 overflow-hidden rounded-full">
            <div className="w-1/2 h-full bg-[#E10600] animate-[slide_3s_linear_infinite]"
                 style={{ animation: 'slide 3s linear infinite' }} />
          </div>

          <p className="text-white/40 text-sm mb-8 leading-relaxed font-light italic">
            &ldquo;Bono, my page is gone!&rdquo; <br />
            It looks like you&apos;ve exceeded track limits or suffered a mechanical failure.
          </p>

          <div className="mb-8">
            <FiveRedLightsGame />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-[#E10600] text-white font-black uppercase tracking-widest transition-all hover:bg-white hover:text-[#E10600] hover:scale-105"
              style={{ fontFamily: 'var(--font-orbitron), sans-serif', fontSize: '11px', clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
            >
              <Home size={18} />
              <span>BACK TO START</span>
            </Link>

            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-3 px-8 py-3 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-full font-black uppercase tracking-widest transition-all"
              style={{ fontFamily: 'var(--font-orbitron), sans-serif', fontSize: '10px' }}
            >
              <RotateCcw size={16} />
              <span>BROWSE MENU</span>
            </Link>
          </div>
        </div>

        {/* Status Code Grid */}
        <div className="mt-12 grid grid-cols-3 gap-8 opacity-20">
          {[
            { label: 'OIL PRESSURE', val: '0.0 BAR' },
            { label: 'BRAKE TEMP', val: 'OVERHEAT' },
            { label: 'PADDOCK CONN', val: 'LOSS' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-[8px] font-black uppercase text-white/50 mb-1"
                 style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>
                {item.label}
              </p>
              <p className="text-xs font-bold text-white"
                 style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>
                {item.val}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slide {
          from { transform: translateX(-200%); }
          to   { transform: translateX(300%); }
        }
      `}</style>
    </main>
  );
}
