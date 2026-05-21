import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Users, Coffee, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-carbon-black text-white flex pt-24">
      {/* Admin Sidebar */}
      <aside className="w-64 glass border-r border-white/5 hidden md:flex flex-col h-[calc(100vh-6rem)] sticky top-24">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-orbitron font-black text-racing-red tracking-widest text-lg">RACE CONTROL</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-orbitron">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-orbitron">
            <LayoutDashboard size={16} className="text-racing-red" />
            <span>Telemetry</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-orbitron">
            <ShoppingBag size={16} className="text-pit-yellow" />
            <span>Orders</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-orbitron">
            <Coffee size={16} className="text-white/70" />
            <span>Menu Items</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-orbitron">
            <Users size={16} className="text-white/70" />
            <span>Drivers</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-orbitron text-white/50">
            <Settings size={16} />
            <span>System Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-6rem)]">
        {children}
      </main>
    </div>
  );
}
