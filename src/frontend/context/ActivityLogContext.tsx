'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ActionType = 'LOGIN' | 'ORDER_PROCESSED' | 'SETTINGS_CHANGED' | 'USER_INVITED' | 'MFA_VERIFIED' | 'SYSTEM_ALERT';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: ActionType;
  details: string;
  timestamp: string;
}

interface ActivityLogContextType {
  logs: ActivityLog[];
  logActivity: (userId: string, userName: string, action: ActionType, details: string) => void;
  clearLogs: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('apex_activity_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse logs");
      }
    } else {
      // Mock initial logs
      setLogs([
        { id: '1', userId: 'ceo', userName: 'Toto Wolff', action: 'LOGIN', details: 'CEO logged into telemetry console.', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', userId: 'manager', userName: 'Christian Horner', action: 'ORDER_PROCESSED', details: 'Approved order #1042.', timestamp: new Date(Date.now() - 1800000).toISOString() },
      ]);
    }
  }, []);

  const logActivity = (userId: string, userName: string, action: ActionType, details: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100); // Keep last 100
      localStorage.setItem('apex_activity_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('apex_activity_logs');
  };

  return (
    <ActivityLogContext.Provider value={{ logs, logActivity, clearLogs }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext);
  if (!context) throw new Error('useActivityLog must be used within ActivityLogProvider');
  return context;
}
