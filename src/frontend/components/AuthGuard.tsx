'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/frontend/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const PUBLIC_ROUTES = ['/auth', '/privacy', '/terms'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/api/');

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicRoute) {
      router.push('/auth');
    }
  }, [user, loading, pathname, router, isPublicRoute]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-racing-red border-t-transparent rounded-full mb-6 animate-pulse"
        />
        <h2 className="font-orbitron text-xs font-black tracking-[0.3em] text-white italic animate-pulse">
          SYNCHRONIZING TELEMETRY SESSION...
        </h2>
      </main>
    );
  }

  if (!user && !isPublicRoute) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-racing-red border-t-transparent rounded-full mb-6"
        />
        <h2 className="font-orbitron text-xs font-black tracking-[0.3em] text-white italic animate-pulse">
          REDIRECTING TO PADDOCK GATE...
        </h2>
      </main>
    );
  }

  return <>{children}</>;
}
