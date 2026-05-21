'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

const SUPABASE_MSG = 'Authentication is not configured yet. Add your Supabase keys to .env.local to enable login.';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateUserMetadata: (metadata: Record<string, any>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check URL for handoff tokens
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const handoff = params.get('apex_handoff');
    if (handoff && !isSupabaseConfigured) {
      try {
        const decoded = JSON.parse(decodeURIComponent(handoff));
        localStorage.setItem('mock_session', JSON.stringify(decoded));
        
        // Clean URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('apex_handoff');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.error("Failed to parse handoff token", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('mock_session');
      if (stored) {
        try {
          const mockUser = JSON.parse(stored);
          setUser(mockUser);
          setSession({ user: mockUser, access_token: 'mock-token' } as any);
        } catch (e) {}
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'mock-user-id', email, user_metadata: { full_name: 'Demo Driver' } } as any;
      localStorage.setItem('mock_session', JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser, access_token: 'mock-token' } as any);
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    } catch {
      return { error: SUPABASE_MSG };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'mock-user-id', email, user_metadata: { full_name: name } } as any;
      localStorage.setItem('mock_session', JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser, access_token: 'mock-token' } as any);
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      return { error: error?.message ?? null };
    } catch {
      return { error: SUPABASE_MSG };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('mock_session');
      setUser(null);
      setSession(null);
      return;
    }
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
  };

  const updateUserMetadata = (metadata: Record<string, any>) => {
    if (!isSupabaseConfigured && user) {
      const updatedUser = { ...user, user_metadata: { ...user.user_metadata, ...metadata } };
      localStorage.setItem('mock_session', JSON.stringify(updatedUser));
      setUser(updatedUser as any);
      setSession({ user: updatedUser, access_token: 'mock-token' } as any);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, updateUserMetadata }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
