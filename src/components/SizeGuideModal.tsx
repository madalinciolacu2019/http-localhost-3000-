'use client';

import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export default function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
  const { playSound } = useSound();
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  if (!isOpen) return null;

  const sizingData: Record<string, { size: string; chest: string; length: string; sleeve?: string }[]> = {
    apparel: [
      { size: 'S', chest: unit === 'cm' ? '92-97 cm' : '36-38 in', length: unit === 'cm' ? '68 cm' : '26.8 in', sleeve: unit === 'cm' ? '20 cm' : '7.9 in' },
      { size: 'M', chest: unit === 'cm' ? '98-103 cm' : '39-41 in', length: unit === 'cm' ? '70 cm' : '27.6 in', sleeve: unit === 'cm' ? '21 cm' : '8.3 in' },
      { size: 'L', chest: unit === 'cm' ? '104-109 cm' : '41-43 in', length: unit === 'cm' ? '72 cm' : '28.3 in', sleeve: unit === 'cm' ? '22 cm' : '8.7 in' },
      { size: 'XL', chest: unit === 'cm' ? '110-115 cm' : '43-45 in', length: unit === 'cm' ? '74 cm' : '29.1 in', sleeve: unit === 'cm' ? '23 cm' : '9.1 in' },
    ],
    gloves: [
      { size: 'S', chest: unit === 'cm' ? '18-19 cm (Width)' : '7.0-7.5 in (Width)', length: unit === 'cm' ? '20 cm' : '7.9 in' },
      { size: 'M', chest: unit === 'cm' ? '19-20 cm (Width)' : '7.5-8.0 in (Width)', length: unit === 'cm' ? '21 cm' : '8.3 in' },
      { size: 'L', chest: unit === 'cm' ? '20-21 cm (Width)' : '8.0-8.5 in (Width)', length: unit === 'cm' ? '22 cm' : '8.7 in' },
      { size: 'XL', chest: unit === 'cm' ? '21-22 cm (Width)' : '8.5-9.0 in (Width)', length: unit === 'cm' ? '23 cm' : '9.1 in' },
    ]
  };

  const isGloves = category.toLowerCase().includes('glove');
  const rows = isGloves ? sizingData.gloves : sizingData.apparel;

  const handleUnitToggle = (newUnit: 'cm' | 'in') => {
    playSound('click');
    setUnit(newUnit);
  };

  const handleClose = () => {
    playSound('click');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass w-full max-w-md rounded-2xl border-white/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ruler size={16} className="text-racing-red" />
            <h3 className="font-orbitron font-black text-sm tracking-wider text-white">SIZE GUIDE</h3>
          </div>
          <button 
            onClick={handleClose} 
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Units switch */}
        <div className="p-6 pb-2 flex justify-between items-center">
          <span className="text-[10px] text-white/40 font-orbitron uppercase tracking-widest">Select metric standard</span>
          <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg">
            {(['cm', 'in'] as const).map(u => (
              <button
                key={u}
                onClick={() => handleUnitToggle(u)}
                className={`px-3 py-1 font-orbitron text-[9px] font-black uppercase rounded-md transition-all ${
                  unit === u 
                    ? 'bg-racing-red text-white shadow-[0_0_10px_rgba(225,6,0,0.3)]' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {u === 'cm' ? 'Metric (CM)' : 'Imperial (IN)'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6">
          <table className="w-full text-left font-orbitron text-[10px]">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase">
                <th className="py-2.5">Size</th>
                <th className="py-2.5">{isGloves ? 'Palm Circumference' : 'Chest Circumference'}</th>
                <th className="py-2.5">Length</th>
                {!isGloves && <th className="py-2.5">Sleeve</th>}
              </tr>
            </thead>
            <tbody className="text-white/80 font-mono">
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="py-3 font-orbitron font-black text-white text-xs">{row.size}</td>
                  <td className="py-3">{row.chest}</td>
                  <td className="py-3">{row.length}</td>
                  {!isGloves && <td className="py-3">{row.sleeve}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-6 text-[9px] text-white/30 leading-relaxed uppercase tracking-wider font-orbitron border-t border-white/5 pt-4">
            ℹ️ Tip: If you are between sizes, we recommend ordering one size up for a more relaxed trackside fit.
          </div>
        </div>
      </div>
    </div>
  );
}
