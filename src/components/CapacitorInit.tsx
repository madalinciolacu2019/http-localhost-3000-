'use client';

import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export default function CapacitorInit() {
  useEffect(() => {
    const initCapacitor = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#050508' });
          await SplashScreen.hide();
        } catch (e) {
          console.warn('Capacitor native plugins failed to init:', e);
        }
      }
    };
    initCapacitor();
  }, []);

  return null;
}
