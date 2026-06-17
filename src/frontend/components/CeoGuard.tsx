'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/frontend/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export function CeoGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (role !== 'CEO') {
        router.push('/');
      } else {
        setAuthorized(true);
      }
    }
  }, [role, loading, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-carbon-black text-white p-8">
        <ShieldAlert size={48} className="text-racing-red mb-4 animate-pulse" />
        <h1 className="font-orbitron text-xl font-black uppercase tracking-widest text-racing-red">Restricted Area</h1>
        <p className="font-mono text-sm text-white/50 mt-2">Verifying Security Clearance...</p>
      </div>
    );
  }

  return <>{children}</>;
}
