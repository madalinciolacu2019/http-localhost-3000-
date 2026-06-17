'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';

export default function SubscriptionManager({ email }: { email: string }) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await fetch(`/api/subscriptions?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        const data = await res.json();
        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
      } catch (err) {
        console.error('Failed to fetch subs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, [email]);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 border-white/5 flex flex-col items-center justify-center min-h-[150px]">
        <div className="w-6 h-6 border-2 border-racing-red border-t-transparent rounded-full animate-spin mb-3" />
        <span className="font-orbitron text-[10px] text-white/30 uppercase tracking-widest animate-pulse">Syncing Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-yellow-400" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-yellow-400" />
          <h3 className="font-orbitron font-black text-sm tracking-wider text-white">ACTIVE SUBSCRIPTIONS</h3>
        </div>
        <span className="bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 font-orbitron text-[9px] font-bold text-white/50">
          {subscriptions.length} Active
        </span>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/5 rounded-xl bg-black/20">
          <Package size={24} className="mx-auto text-white/10 mb-2" />
          <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-white/40 block">No recurring fuel streams</span>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className="border border-white/5 bg-white/2 hover:bg-white/3 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-orbitron text-xs font-black text-white uppercase">{sub.product_name}</span>
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-[4px] text-[8px] font-orbitron font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={8} /> {sub.status}
                  </span>
                </div>
                <div className="text-[10px] text-white/40 font-orbitron">
                  Next Delivery: {new Date(sub.current_period_end * 1000).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <span className="font-orbitron text-xs font-bold text-white/40 uppercase block text-[8px]">Recurring</span>
                <span className="font-orbitron font-black text-sm text-yellow-400">€{sub.amount.toFixed(2)} / {sub.interval}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
