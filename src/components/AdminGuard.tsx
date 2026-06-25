'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role === 'CUSTOMER') {
      router.push('/');
    }
  }, [role, loading, router]);

  if (loading || role === 'CUSTOMER') {
    return <div className="p-8 text-center text-white/50 font-orbitron">Verifying Security Clearance...</div>;
  }

  return <>{children}</>;
}
