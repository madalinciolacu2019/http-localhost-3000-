'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

export default function PushNotificationToggle() {
  const { playSound } = useSound();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setIsSubscribed(localStorage.getItem('apex_push_enabled') === 'true');
      }
    }
  }, []);

  const handleToggle = async () => {
    playSound('click');
    
    if (!('Notification' in window)) {
      alert('This browser does not support push notifications.');
      return;
    }

    if (permission === 'default' || permission === 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setIsSubscribed(true);
        localStorage.setItem('apex_push_enabled', 'true');
        new Notification("APEX BREWS", {
          body: "Telemetry stream established. You will be notified when fresh roasts are ready.",
          icon: "/favicon.ico"
        });

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          setTimeout(() => {
            navigator.serviceWorker.controller?.postMessage({ type: 'SIMULATE_ROAST' });
          }, 5000);
        }
      }
    } else {
      // Toggle if already granted
      const newValue = !isSubscribed;
      setIsSubscribed(newValue);
      localStorage.setItem('apex_push_enabled', newValue ? 'true' : 'false');
      
      if (newValue) {
        new Notification("APEX BREWS", {
          body: "Push notifications re-enabled.",
          icon: "/favicon.ico"
        });

        // Simulate a backend push notification via the service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          setTimeout(() => {
            navigator.serviceWorker.controller?.postMessage({ type: 'SIMULATE_ROAST' });
          }, 5000);
        }
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`glass p-2.5 rounded-full border transition-all flex items-center justify-center cursor-pointer group ${isSubscribed ? 'border-racing-red/40 bg-racing-red/10 text-white' : 'border-white/5 hover:border-racing-red/40 hover:bg-racing-red/10 text-white/50 hover:text-white'}`}
      title={isSubscribed ? 'Disable Roaster Notifications' : 'Enable Roaster Notifications'}
    >
      <div className="relative w-4 h-4">
        {isSubscribed ? (
          <Bell size={16} className="absolute inset-0 text-racing-red transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <BellOff size={16} className="absolute inset-0 text-white/50 transition-transform duration-300 group-hover:scale-110 group-hover:text-white" />
        )}
      </div>
    </button>
  );
}
