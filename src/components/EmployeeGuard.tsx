'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function EmployeeGuard({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/paddock-pass');
      } else if (role !== 'CEO' && role !== 'EMPLOYEE') {
        router.push('/paddock-pass');
      }
    }
  }, [user, role, loading, router]);

  if (loading || (!user && !loading) || (role !== 'CEO' && role !== 'EMPLOYEE')) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-racing-red border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
