'use client';

import React, { useEffect } from 'react';
import { SoundProvider } from "@/frontend/context/SoundContext";
import { CartProvider } from "@/frontend/context/CartContext";
import { AuthProvider } from "@/frontend/context/AuthContext";
import { UIProvider } from "@/frontend/context/UIContext";
import { ActivityLogProvider } from "@/frontend/context/ActivityLogContext";
import CartDrawer from "@/frontend/components/CartDrawer";
import AuthGuard from "@/frontend/components/AuthGuard";
import BotEngine from "@/frontend/components/BotEngine";
import { BookingProvider } from "@/frontend/context/BookingContext";
import { GlobalEventProvider } from "@/frontend/context/GlobalEventContext";
import { GlobalEffects } from "@/frontend/components/GlobalEffects";
import { DatabaseProvider } from "@/frontend/context/DatabaseContext";

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
