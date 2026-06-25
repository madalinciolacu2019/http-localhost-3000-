'use client';

import React, { useEffect } from 'react';
import { SoundProvider } from "@/context/SoundContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { ActivityLogProvider } from "@/context/ActivityLogContext";
import CartDrawer from "@/components/CartDrawer";
import AuthGuard from "@/components/AuthGuard";
import BotEngine from "@/components/BotEngine";
import { BookingProvider } from "@/context/BookingContext";
import { GlobalEventProvider } from "@/context/GlobalEventContext";
import { GlobalEffects } from "@/components/GlobalEffects";
import { DatabaseProvider } from "@/context/DatabaseContext";
import CapacitorInit from "@/components/CapacitorInit";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wiped = localStorage.getItem('__auto_wipe_f1_merch_v3');
      if (!wiped) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('apex_') || key.startsWith('order_demo_') || key.startsWith('status_') || key.startsWith('profile_demo_') || key.startsWith('stock_prod_') || key.startsWith('price_prod_') || key.startsWith('active_prod_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('__auto_wipe_f1_merch_v3', 'true');
        window.location.reload();
      }
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('[PWA SW] Registered successfully with scope:', reg.scope);
        }).catch((err) => {
          console.error('[PWA SW] Registration failed:', err);
        });
      });
    }
  }, []);

  return (
    <DatabaseProvider>
      <CapacitorInit />
      <AuthProvider>
        <ActivityLogProvider>
          <UIProvider>
            <SoundProvider>
              <BookingProvider>
                <CartProvider>
                  <CartDrawer />
                  <BotEngine />
                  <GlobalEventProvider>
                    <GlobalEffects />
                    <AuthGuard>
                      {children}
                    </AuthGuard>
                  </GlobalEventProvider>
                </CartProvider>
              </BookingProvider>
            </SoundProvider>
          </UIProvider>
        </ActivityLogProvider>
      </AuthProvider>
    </DatabaseProvider>
  );
}
