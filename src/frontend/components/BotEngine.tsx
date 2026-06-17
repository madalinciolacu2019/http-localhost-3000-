'use client';

import { useEffect, useState } from 'react';
import { generateBotOrder, processBotOrders } from '@/shared/lib/botEngine';

export default function BotEngine() {
  const [enabled, setEnabled] = useState(false);

  // Poll for the setting
  useEffect(() => {
    const checkEnabled = () => {
      if (typeof window !== 'undefined') {
        const isEnabled = localStorage.getItem('bot_engine_enabled') === 'true';
        setEnabled(isEnabled);
      }
    };
    
    checkEnabled();
    const interval = setInterval(checkEnabled, 2000);
    return () => clearInterval(interval);
  }, []);

  // Run the bot ecosystem
  useEffect(() => {
    if (!enabled) return;

    // Customer bots generate an order every 10 to 20 seconds
    const orderInterval = setInterval(() => {
      // 50% chance to generate an order on this tick to add randomness
      if (Math.random() > 0.5) {
        generateBotOrder();
      }
    }, 15000);

    // Employee bots process queue every 2 seconds
    const processInterval = setInterval(() => {
      processBotOrders();
    }, 2000);

    return () => {
      clearInterval(orderInterval);
      clearInterval(processInterval);
    };
  }, [enabled]);

  return null; // Invisible component
}
