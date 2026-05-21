'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/paddock-club');
  }, [router]);

  return (
    <div className="min-h-screen bg-carbon-black flex items-center justify-center font-orbitron text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-racing-red border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] tracking-[0.2em] text-white/50 uppercase">Transferring to Paddock Club Dashboard...</span>
      </div>
    </div>
  );
}
