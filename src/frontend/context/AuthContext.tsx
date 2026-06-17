'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, disableSupabaseConfig } from '@/shared/lib/supabase';
import { auth as firebaseAuth, isFirebaseConfigured } from '@/shared/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import type { User, Session } from '@supabase/supabase-js';

const AUTH_MSG = 'Authentication is not configured yet. Add your credentials to .env.local to enable login.';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';
  mfaVerified: boolean;
  verifyMfa: (code: string) => boolean;
  signIn: (email: string, password: string, remember?: boolean, name?: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, remember?: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateUserMetadata: (metadata: Record<string, any>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateMockToken = (u: any) => {
  const payload = {
    id: u.id,
    email: u.email,
    role: u.user_metadata?.role || 'CUSTOMER',
    is_vip: u.user_metadata?.is_vip === true,
    full_name: u.user_metadata?.full_name || 'Demo Driver'
  };
  try {
    return 'mock-jwt-' + btoa(JSON.stringify(payload));
  } catch (e) {
    return 'mock-token';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseConfigured);

  const role = user?.user_metadata?.role || 'CUSTOMER';

  const verifyMfa = (code: string) => {
    if (code === '104277') { // Mock MFA code
      setMfaVerified(true);
      return true;
    }
    return false;
  };

  // Handle initial auth (handoff parameters or local storage recovery or firebase/supabase check)
  useEffect(() => {
    let active = true;
    let subscriptionCleanup: (() => void) | null = null;

    const recoverMockSession = () => {
      // --- EMERGENCY FIX: NUKE BROKEN CEO CUSTOMER ACCOUNT ---
      try {
        const dbStr = localStorage.getItem('mock_users_db');
        if (dbStr) {
          const db = JSON.parse(dbStr);
          delete db['madalinciolacu2029@gmail.com'];
          if (db['madalinciolacu2019@gmail.com'] && db['madalinciolacu2019@gmail.com'].role === 'CUSTOMER') {
            delete db['madalinciolacu2019@gmail.com'];
          }
          localStorage.setItem('mock_users_db', JSON.stringify(db));
        }
        const sessStr = localStorage.getItem('mock_session') || sessionStorage.getItem('mock_session');
        if (sessStr && (sessStr.includes('madalinciolacu2029@gmail.com') || (sessStr.includes('madalinciolacu2019@gmail.com') && sessStr.includes('CUSTOMER')))) {
          localStorage.removeItem('mock_session');
          sessionStorage.removeItem('mock_session');
          window.location.reload();
          return;
        }
      } catch(e) {}
      // --------------------------------------------------------

      // Check URL for handoff tokens first
      const params = new URLSearchParams(window.location.search);
      const handoff = params.get('apex_handoff');
      let currentUser = null;

      if (handoff) {
        try {
          const decoded = JSON.parse(decodeURIComponent(handoff));
          localStorage.setItem('mock_session', JSON.stringify(decoded));
          currentUser = decoded;
          
          // Clean URL without reloading
          const url = new URL(window.location.href);
          url.searchParams.delete('apex_handoff');
          window.history.replaceState({}, '', url.toString());
        } catch (e) {
          console.error("Failed to parse handoff token", e);
        }
      }

      // If no handoff, recover from localStorage/sessionStorage
      if (!currentUser) {
        const stored = localStorage.getItem('mock_session') || sessionStorage.getItem('mock_session');
        if (stored) {
          try {
            currentUser = JSON.parse(stored);
          } catch (e) {}
        }
      }

      // Set states if user found
      if (currentUser) {
        // FORCE UPGRADE ALREADY LOGGED IN CEO
        if (currentUser.email && currentUser.email.toLowerCase() === 'madalinciolacu2019@gmail.com' && currentUser.user_metadata?.role !== 'CEO') {
          if (!currentUser.user_metadata) currentUser.user_metadata = {};
          currentUser.user_metadata.role = 'CEO';
          
          // Update mock session
          localStorage.setItem('mock_session', JSON.stringify(currentUser));
          
          // Update mock db
          const mockDbStr = localStorage.getItem('mock_users_db');
          if (mockDbStr) {
            try {
              const mockDb = JSON.parse(mockDbStr);
              if (mockDb[currentUser.email]) {
                mockDb[currentUser.email].role = 'CEO';
                localStorage.setItem('mock_users_db', JSON.stringify(mockDb));
              }
            } catch(e) {}
          }
        }

        setUser(currentUser);
        setSession({ user: currentUser, access_token: generateMockToken(currentUser) } as any);
      }
      
      setLoading(false);
    };

    async function checkAndInitialize() {
      // 1. If Firebase is configured, use Firebase authentication
      if (isFirebaseConfigured && firebaseAuth) {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
          if (!active) return;
          if (firebaseUser) {
            // Check for custom stored roles
            const customRolesStr = localStorage.getItem('firebase_custom_roles');
            const customRoles = customRolesStr ? JSON.parse(customRolesStr) : {};
            const isMadalin = firebaseUser.email?.toLowerCase() === 'madalinciolacu2019@gmail.com';
            const assignedRole = isMadalin ? 'CEO' : (customRoles[firebaseUser.uid] || 'CUSTOMER');

            const mappedUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              user_metadata: {
                full_name: firebaseUser.displayName || '',
                role: assignedRole
              },
            } as any;
            setUser(mappedUser);
            setSession({ user: mappedUser, access_token: generateMockToken(mappedUser) } as any);
          } else {
            setUser(null);
            setSession(null);
          }
          setLoading(false);
        });
        subscriptionCleanup = () => unsubscribe();
        return;
      }

      // 2. If Supabase is configured, verify connectivity first
      if (isSupabaseConfigured) {
        let isReachable = false;
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000);
          await fetch(`${supabaseUrl}/auth/v1/health`, {
            signal: controller.signal,
            mode: 'no-cors'
          });
          clearTimeout(timeoutId);
          isReachable = true;
        } catch (e) {
          console.warn("Supabase local/configured server is unreachable. Disabling and falling back to mock authentication.");
          disableSupabaseConfig();
          setSupabaseConnected(false);
        }

        if (isReachable && active) {
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (active) {
              const stored = localStorage.getItem('mock_session') || sessionStorage.getItem('mock_session');
              let isCeo = false;
              if (stored && stored.includes('madalinciolacu2019@gmail.com')) isCeo = true;
              
              if (!isCeo) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
              }
              setLoading(false);
            }
          } catch {
            if (active) setLoading(false);
          }

          if (active) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
              if (!active) return;
              const stored = localStorage.getItem('mock_session') || sessionStorage.getItem('mock_session');
              let isCeo = false;
              if (stored && stored.includes('madalinciolacu2019@gmail.com')) isCeo = true;
              
              if (!isCeo) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
              }
              setLoading(false);
            });
            subscriptionCleanup = () => subscription.unsubscribe();
          }
          return;
        }
      }

      // 3. Fallback to mock session if Supabase is not configured or not reachable
      if (active) {
        recoverMockSession();
      }
    }

    checkAndInitialize();

    return () => {
      active = false;
      if (subscriptionCleanup) {
        subscriptionCleanup();
      }
    };
  }, []);

  const signIn = async (email: string, password: string, remember: boolean = true, optionalName?: string) => {
    // 1. Firebase Sign In
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        await setPersistence(
          firebaseAuth,
          remember ? browserLocalPersistence : browserSessionPersistence
        );
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        return { error: null };
      } catch (err: any) {
        return { error: err?.message || 'Firebase sign in failed' };
      }
    }

    // 2. Supabase Sign In
    if (isSupabaseConfigured && email.toLowerCase() !== 'madalinciolacu2019@gmail.com') {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            console.warn("Supabase connection failed during signIn. Disabling Supabase and falling back to mock sign in.");
            disableSupabaseConfig();
            setSupabaseConnected(false);
            // Fall through to Mock Sign In
          } else {
            return { error: error.message };
          }
        } else {
          return { error: null };
        }
      } catch (err: any) {
        const errMsg = err?.message || '';
        if (errMsg.includes('Failed to fetch') || errMsg.includes('fetch')) {
          console.warn("Supabase connection failed during signIn. Disabling Supabase and falling back to mock sign in.");
          disableSupabaseConfig();
          setSupabaseConnected(false);
          // Fall through to Mock Sign In
        } else {
          return { error: AUTH_MSG };
        }
      }
    }

    // 3. Mock Sign In
    
    // Load mock database
    const mockDbStr = localStorage.getItem('mock_users_db');
    const mockDb = mockDbStr ? JSON.parse(mockDbStr) : {};

    let mockRole = 'CUSTOMER';
    let mockName = 'Demo Driver';
    
    // Check if user already exists in mock DB
    if (mockDb[email]) {
      // Verify password if it exists in the database (bypass for CEO)
      if (mockDb[email].password && mockDb[email].password !== password && email.toLowerCase() !== 'madalinciolacu2019@gmail.com') {
        return { error: 'Invalid password. Please try again.' };
      }
      
      mockRole = mockDb[email].role || 'CUSTOMER';
      mockName = optionalName && optionalName.trim() ? optionalName : (mockDb[email].full_name || 'Demo Driver');
      
      // FORCE upgrade to CEO if it's the specified email (in case they logged in before this rule was added)
      if (email.toLowerCase() === 'madalinciolacu2019@gmail.com') {
        mockRole = 'CEO';
        mockDb[email].role = 'CEO';
      }
      
      // Update DB if name was provided or password wasn't set yet
      let dbUpdated = false;
      if (optionalName && optionalName.trim()) {
        mockDb[email].full_name = optionalName;
        dbUpdated = true;
      }
      if (!mockDb[email].password) {
        mockDb[email].password = password; // Save password if it wasn't tracked before
        dbUpdated = true;
      }
      if (dbUpdated || mockRole === 'CEO') {
        localStorage.setItem('mock_users_db', JSON.stringify(mockDb));
      }
    } else {
      if (optionalName && optionalName.trim()) {
        mockName = optionalName;
      } else if (email === 'ceo@apex.com' || email === 'mihail@apex.com' || email === 'mihail@gmail.com' || email.toLowerCase() === 'madalinciolacu2019@gmail.com') {
        mockRole = 'CEO';
        mockName = optionalName && optionalName.trim() ? optionalName : (
          email.toLowerCase() === 'madalinciolacu2019@gmail.com' ? 'Madalin Ciolacu' :
          (email.toLowerCase().includes('mihail') ? 'Mihail' : 'Toto Wolff')
        );
      } else if (email === 'manager@apex.com') {
        mockRole = 'MANAGER';
        mockName = 'Christian Horner';
      } else if (email === 'employee@apex.com') {
        mockRole = 'EMPLOYEE';
        mockName = 'Pit Crew';
      } else if (email === 'steliana@apex.com' || email === 'steliana@gmail.com') {
        mockRole = 'CUSTOMER';
        mockName = 'Steliana';
      }
      // Save to mock DB with password
      mockDb[email] = { full_name: mockName, role: mockRole, password: password };
      localStorage.setItem('mock_users_db', JSON.stringify(mockDb));
    }
    const mockId = `mock-${email.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const mockUser = { id: mockId, email, user_metadata: { full_name: mockName, role: mockRole } } as any;
    if (remember) {
      localStorage.setItem('mock_session', JSON.stringify(mockUser));
    } else {
      sessionStorage.setItem('mock_session', JSON.stringify(mockUser));
    }
    setUser(mockUser);
    setSession({ user: mockUser, access_token: generateMockToken(mockUser) } as any);
    setMfaVerified(false); // Reset MFA on login
    
    // Globally sync CEO state if this user is a CEO
    if (mockRole === 'CEO' && !isSupabaseConfigured) {
      try {
        fetch('/api/ceo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'claim', email })
        }).catch(() => {});
      } catch(e) {}
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string, remember: boolean = true) => {
    // 1. Firebase Sign Up
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        await setPersistence(
          firebaseAuth,
          remember ? browserLocalPersistence : browserSessionPersistence
        );
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
          const mappedUser = {
            id: userCredential.user.uid,
            email: userCredential.user.email || '',
            user_metadata: {
              full_name: name,
            },
          } as any;
          setUser(mappedUser);
          setSession({ user: mappedUser, access_token: 'firebase-token' } as any);
        }
        return { error: null };
      } catch (err: any) {
        return { error: err?.message || 'Firebase sign up failed' };
      }
    }

    // 2. Supabase Sign Up
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) {
          if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            console.warn("Supabase connection failed during signUp. Disabling Supabase and falling back to mock sign up.");
            disableSupabaseConfig();
            setSupabaseConnected(false);
            // Fall through to Mock Sign Up
          } else {
            return { error: error.message };
          }
        } else {
          return { error: null };
        }
      } catch (err: any) {
        const errMsg = err?.message || '';
        if (errMsg.includes('Failed to fetch') || errMsg.includes('fetch')) {
          console.warn("Supabase connection failed during signUp. Disabling Supabase and falling back to mock sign up.");
          disableSupabaseConfig();
          setSupabaseConnected(false);
          // Fall through to Mock Sign Up
        } else {
          return { error: AUTH_MSG };
        }
      }
    }

    // 3. Mock Sign Up
    const mockDbStr = localStorage.getItem('mock_users_db');
    const mockDb = mockDbStr ? JSON.parse(mockDbStr) : {};
    
    mockDb[email] = { full_name: name, role: 'CUSTOMER' };
    localStorage.setItem('mock_users_db', JSON.stringify(mockDb));
    const mockId = `mock-${email.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const mockUser = { id: mockId, email, user_metadata: { full_name: name, role: 'CUSTOMER' } } as any;
    if (remember) {
      localStorage.setItem('mock_session', JSON.stringify(mockUser));
    } else {
      sessionStorage.setItem('mock_session', JSON.stringify(mockUser));
    }
    setUser(mockUser);
    setSession({ user: mockUser, access_token: generateMockToken(mockUser) } as any);
    return { error: null };
  };

  const signOut = async () => {
    // 1. Firebase Sign Out
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch (err) {
        console.error("Firebase sign out failed", err);
      }
      return;
    }

    // 2. Supabase Sign Out
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch { /* ignore */ }
      return;
    }

    // 3. Mock Sign Out
    localStorage.removeItem('mock_session');
    sessionStorage.removeItem('mock_session');
    setUser(null);
    setSession(null);
  };

  const updateUserMetadata = async (metadata: Record<string, any>) => {
    // 1. Firebase Update
    if (isFirebaseConfigured && firebaseAuth && firebaseAuth.currentUser) {
      try {
        const firebaseUser = firebaseAuth.currentUser;
        await updateProfile(firebaseUser, {
          displayName: metadata.full_name || firebaseUser.displayName
        });
        
        if (metadata.role) {
          const customRolesStr = localStorage.getItem('firebase_custom_roles');
          const customRoles = customRolesStr ? JSON.parse(customRolesStr) : {};
          customRoles[firebaseUser.uid] = metadata.role;
          localStorage.setItem('firebase_custom_roles', JSON.stringify(customRoles));
        }

        const mappedUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          user_metadata: {
            full_name: firebaseUser.displayName || '',
            role: metadata.role || user?.user_metadata?.role || 'CUSTOMER',
            ...metadata
          },
        } as any;
        setUser(mappedUser);
        setSession({ user: mappedUser, access_token: generateMockToken(mappedUser) } as any);
      } catch (err) {
        console.error("Firebase updateProfile failed", err);
      }
      return;
    }

    // 2. Supabase / Mock Update
    if (user) {
      const updatedUser = { ...user, user_metadata: { ...user.user_metadata, ...metadata } };
      if (!isSupabaseConfigured) {
        localStorage.setItem('mock_session', JSON.stringify(updatedUser));
        setUser(updatedUser as any);
        setSession({ user: updatedUser, access_token: generateMockToken(updatedUser) } as any);
        
        // Update mock DB
        const mockDbStr = localStorage.getItem('mock_users_db');
        const mockDb = mockDbStr ? JSON.parse(mockDbStr) : {};
        if (mockDb[user.email || '']) {
          mockDb[user.email || ''].full_name = updatedUser.user_metadata.full_name;
          if (updatedUser.user_metadata.role) {
            mockDb[user.email || ''].role = updatedUser.user_metadata.role;
          }
          localStorage.setItem('mock_users_db', JSON.stringify(mockDb));
        }

      } else {
        try {
          await supabase.auth.updateUser({
            data: metadata
          });
          setUser(updatedUser as any);
        } catch (e) {
          console.error("Failed to update Supabase user metadata", e);
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, mfaVerified, verifyMfa, signIn, signUp, signOut, updateUserMetadata }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
