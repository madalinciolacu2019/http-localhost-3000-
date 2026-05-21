'use client';

import React from 'react';
import { DriverComparisonTool } from '@/components/DriverComparisonTool';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ComparisonPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-6">
        <Link 
          href="/paddock/drivers" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 font-orbitron text-xs tracking-widest"
        >
          <ChevronLeft size={16} /> BACK TO DRIVERS
        </Link>
        
        <DriverComparisonTool />
      </div>
      
      {/* Background Grid Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ 
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
    </main>
  );
}
