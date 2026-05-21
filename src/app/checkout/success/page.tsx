'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Flag, Coffee, Zap, Clock,
  ArrowRight, ChevronRight, Bell, Trophy,
  Printer, Download, Cpu, MapPin, Truck, Compass, Phone, Mail, User
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// ─── Order Status Machine Helpers ──────────────────────────────────────────────
const getStages = (method: 'counter' | 'trackside' | 'drone') => {
  if (method === 'drone') {
    return [
      {
        id: 'received',
        label: 'Flight Route Locked',
        sublabel: 'Telemetry link established, drone clearing airspace',
        icon: CheckCircle,
        color: 'text-green-400',
        bg: 'bg-green-400',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
        delayMs: 0,
      },
      {
        id: 'preparing',
        label: 'Brewing & Sealing',
        sublabel: 'Optimal extraction achieved, thermal casing locked',
        icon: Coffee,
        color: 'text-racing-red',
        bg: 'bg-racing-red',
        glow: 'shadow-[0_0_20px_rgba(225,6,0,0.5)]',
        delayMs: 6000,
      },
      {
        id: 'dispatched',
        label: 'Drone Launched',
        sublabel: 'Quad-turbines active, cruising speed 85 km/h',
        icon: Cpu,
        color: 'text-pit-yellow',
        bg: 'bg-pit-yellow',
        glow: 'shadow-[0_0_20px_rgba(255,215,0,0.5)]',
        delayMs: 12000,
      },
      {
        id: 'transit',
        label: 'Sector 3 Inbound',
        sublabel: 'Approaching paddock coordinate marker',
        icon: Compass,
        color: 'text-blue-400',
        bg: 'bg-blue-400',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
        delayMs: 20000,
      },
      {
        id: 'delivered',
        label: 'Payload Dropped',
        sublabel: 'Safe landing on telemetry pad. Enjoy!',
        icon: Flag,
        color: 'text-green-400',
        bg: 'bg-green-400',
        glow: 'shadow-[0_0_30px_rgba(34,197,94,0.8)]',
        delayMs: 30000,
      },
    ];
  }

  if (method === 'trackside') {
    return [
      {
        id: 'received',
        label: 'Courier Scheduled',
        sublabel: 'Chassis logistics allocated for freight',
        icon: CheckCircle,
        color: 'text-green-400',
        bg: 'bg-green-400',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
        delayMs: 0,
      },
      {
        id: 'preparing',
        label: 'Custom Blend Crafted',
        sublabel: 'Gases monitored, flavor matrix sealed in bag',
        icon: Coffee,
        color: 'text-racing-red',
        bg: 'bg-racing-red',
        glow: 'shadow-[0_0_20px_rgba(225,6,0,0.5)]',
        delayMs: 6000,
      },
      {
        id: 'dispatched',
        label: 'Freight Loaded',
        sublabel: 'Transferred to DHL / F1 Team Logistics hub',
        icon: Truck,
        color: 'text-pit-yellow',
        bg: 'bg-pit-yellow',
        glow: 'shadow-[0_0_20px_rgba(255,215,0,0.5)]',
        delayMs: 12000,
      },
      {
        id: 'transit',
        label: 'Logistics Transit',
        sublabel: 'Dispatched through team custom gates',
        icon: Compass,
        color: 'text-blue-400',
        bg: 'bg-blue-400',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
        delayMs: 20000,
      },
      {
        id: 'delivered',
        label: 'Paddock Delivery',
        sublabel: 'Delivered to team garage. Signature verified.',
        icon: Flag,
        color: 'text-green-400',
        bg: 'bg-green-400',
        glow: 'shadow-[0_0_30px_rgba(34,197,94,0.8)]',
        delayMs: 30000,
      },
    ];
  }

  // Default 'counter'
  return [
    {
      id: 'received',
      label: 'Order Approved',
      sublabel: 'Authentication link verified, payment received',
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-400',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
      delayMs: 0,
    },
    {
      id: 'preparing',
      label: 'Espresso Extraction',
      sublabel: 'Brewing at 9.0 Bar extraction, optimal pressure',
      icon: Coffee,
      color: 'text-racing-red',
      bg: 'bg-racing-red',
      glow: 'shadow-[0_0_20px_rgba(225,6,0,0.5)]',
      delayMs: 6000,
    },
    {
      id: 'quality',
      label: 'Telemetry Check',
      sublabel: 'Refractometer confirms perfect TDS concentration',
      icon: Zap,
      color: 'text-pit-yellow',
      bg: 'bg-pit-yellow',
      glow: 'shadow-[0_0_20px_rgba(255,215,0,0.5)]',
      delayMs: 14000,
    },
    {
      id: 'ready',
      label: 'Ready for Collection',
      sublabel: 'Present receipt at APEX Pitbox 4 counter',
      icon: Flag,
      color: 'text-green-400',
      bg: 'bg-green-400',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.8)]',
      delayMs: 24000,
    },
  ];
};

// ─── Order Item Type ──────────────────────────────────────────────────────────
type OrderItem = {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
};

type OrderData = {
  id: string;
  ref: string;
  subtotal?: number;
  vat?: number;
  shippingCost?: number;
  total: number;
  currency: string;
  fulfillmentMethod?: 'counter' | 'trackside' | 'drone';
  customerName?: string;
  customerEmail: string | null;
  customerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostcode?: string;
  shippingCountry?: string;
  items: OrderItem[];
  created: number;
  isDemo?: boolean;
};

// ─── Map Subcomponents ────────────────────────────────────────────────────────
function DroneTelemetryMap({ currentStage }: { currentStage: number }) {
  const stats = [
    { alt: '0m', speed: '0 km/h', batt: '100%', signal: '100% link standby' },
    { alt: '0m', speed: '0 km/h', batt: '100%', signal: '99% container locked' },
    { alt: '45m', speed: '85 km/h', batt: '96%', signal: '98% path locked' },
    { alt: '42m', speed: '78 km/h', batt: '88%', signal: '95% GPS tracking' },
    { alt: '0m', speed: '0 km/h', batt: '81%', signal: '100% telemetry complete' },
  ];
  const currentStat = stats[Math.min(currentStage, stats.length - 1)];

  return (
    <div className="space-y-4">
      <div className="relative glass border-white/5 bg-black/40 rounded-xl p-4 overflow-hidden">
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-racing-red animate-ping" />
          <span className="font-orbitron text-[8px] text-racing-red font-black tracking-widest uppercase">DRONE FLIGHT MATRIX</span>
        </div>
        
        <svg viewBox="0 0 400 180" className="w-full h-44 text-white/5">
          <defs>
            <pattern id="grid-d" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-d)" />
          
          {/* Circuit outline */}
          <path
            d="M 40,140 C 40,50 120,40 200,40 C 280,40 360,60 360,110 C 360,160 280,150 200,150 C 120,150 40,140 40,140 Z"
            fill="none"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.08"
          />

          {/* Drone flight path */}
          <path
            id="flight-path"
            d="M 80,120 C 150,60 250,50 300,110"
            fill="none"
            stroke="rgba(225,6,0,0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          
          {/* Start node */}
          <circle cx="80" cy="120" r="4" className="fill-racing-red" />
          <text x="80" y="135" className="font-orbitron text-[6px] font-bold fill-white/40 text-center" textAnchor="middle">APEX HUB</text>
          
          {/* Destination node */}
          <circle cx="300" cy="110" r="4" className="fill-green-400" />
          <text x="300" y="125" className="font-orbitron text-[6px] font-bold fill-white/40 text-center" textAnchor="middle">GRID ZONE</text>

          {/* Animated Drone position */}
          <motion.g
            animate={
              currentStage === 0 ? { x: 80, y: 120 } :
              currentStage === 1 ? { x: 80, y: 120 } :
              currentStage === 2 ? { x: 170, y: 78 } :
              currentStage === 3 ? { x: 245, y: 77 } :
              { x: 300, y: 110 }
            }
            transition={{ type: 'spring', damping: 25, stiffness: 60 }}
          >
            <circle cx="0" cy="0" r="8" className="fill-racing-red/20 animate-pulse" />
            <circle cx="0" cy="0" r="2.5" className="fill-racing-red" />
          </motion.g>
        </svg>

        <div className="absolute bottom-2 right-2 font-mono text-[7px] text-white/30">
          <div>NODE ID: DRONE-AIRFLOW-01</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'ALTITUDE', value: currentStat.alt, color: 'text-white' },
          { label: 'VELOCITY', value: currentStat.speed, color: 'text-racing-red' },
          { label: 'BATTERY', value: currentStat.batt, color: 'text-pit-yellow' },
          { label: 'TELEMETRY STATUS', value: currentStat.signal, color: 'text-green-400', span: 'col-span-2' },
        ].map((item, idx) => (
          <div key={idx} className={`glass border-white/5 bg-black/25 rounded-lg p-2 ${item.span || ''}`}>
            <span className="font-orbitron text-[6px] text-white/30 block tracking-widest uppercase">{item.label}</span>
            <span className={`font-orbitron text-[9px] font-black block mt-0.5 ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TracksideTelemetryMap({ currentStage }: { currentStage: number }) {
  const stats = [
    { status: 'DEPARTURE STANDBY', speed: '0 km/h', eta: '-- MIN', temp: '18.1°C' },
    { status: 'FREIGHT CONTAINER SECURED', speed: '0 km/h', eta: '-- MIN', temp: '18.0°C' },
    { status: 'TRANSIT: SECTOR 1', speed: '48 km/h', eta: '23 MIN', temp: '18.2°C' },
    { status: 'TRANSIT: SECTOR 2', speed: '72 km/h', eta: '11 MIN', temp: '18.2°C' },
    { status: 'DELIVERED & VERIFIED', speed: '0 km/h', eta: 'ARRIVED', temp: '18.5°C' },
  ];
  const currentStat = stats[Math.min(currentStage, stats.length - 1)];

  return (
    <div className="space-y-4">
      <div className="relative glass border-white/5 bg-black/40 rounded-xl p-4 overflow-hidden">
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          <span className="font-orbitron text-[8px] text-blue-400 font-black tracking-widest uppercase">TRACKSIDE TRANSIT LINK</span>
        </div>
        
        <svg viewBox="0 0 400 180" className="w-full h-44 text-white/5">
          <defs>
            <pattern id="grid-t" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-t)" />
          
          {/* Route path */}
          <path
            d="M 50,110 L 120,60 L 220,130 L 300,50 L 350,100"
            fill="none"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.08"
          />
          <path
            d="M 50,110 L 120,60 L 220,130 L 300,50 L 350,100"
            fill="none"
            stroke="rgba(59,130,246,0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          
          {/* Nodes */}
          <circle cx="50" cy="110" r="3.5" className="fill-blue-400" />
          <text x="50" y="125" className="font-orbitron text-[6px] font-bold fill-white/40 text-center" textAnchor="middle">APEX DEPOT</text>

          <circle cx="120" cy="60" r="3" className="fill-white/10" />
          <text x="120" y="48" className="font-orbitron text-[5px] font-bold fill-white/20 text-center" textAnchor="middle">SEC-1</text>

          <circle cx="220" cy="130" r="3" className="fill-white/10" />
          <text x="220" y="145" className="font-orbitron text-[5px] font-bold fill-white/20 text-center" textAnchor="middle">SEC-2</text>

          <circle cx="300" cy="50" r="3" className="fill-white/10" />
          <text x="300" y="38" className="font-orbitron text-[5px] font-bold fill-white/20 text-center" textAnchor="middle">PADDOCK PIT</text>
          
          <circle cx="350" cy="100" r="4.5" className="fill-green-400" />
          <text x="350" y="115" className="font-orbitron text-[6px] font-bold fill-white/40 text-center" textAnchor="middle">GARAGE</text>

          {/* Courier Position */}
          <motion.g
            animate={
              currentStage === 0 ? { x: 50, y: 110 } :
              currentStage === 1 ? { x: 50, y: 110 } :
              currentStage === 2 ? { x: 120, y: 60 } :
              currentStage === 3 ? { x: 260, y: 90 } :
              { x: 350, y: 100 }
            }
            transition={{ type: 'spring', damping: 25, stiffness: 60 }}
          >
            <circle cx="0" cy="0" r="8" className="fill-blue-400/20 animate-pulse" />
            <circle cx="0" cy="0" r="2.5" className="fill-blue-400" />
          </motion.g>
        </svg>

        <div className="absolute bottom-2 right-2 font-mono text-[7px] text-white/30">
          <div>VEHICLE REF: TRK-99F1</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'DELIVERY STATUS', value: currentStat.status, color: 'text-white', span: 'col-span-2' },
          { label: 'COURIER SPEED', value: currentStat.speed, color: 'text-blue-400' },
          { label: 'ETA', value: currentStat.eta, color: 'text-green-400' },
        ].map((item, idx) => (
          <div key={idx} className={`glass border-white/5 bg-black/25 rounded-lg p-2 ${item.span || ''}`}>
            <span className="font-orbitron text-[6px] text-white/30 block tracking-widest uppercase">{item.label}</span>
            <span className={`font-orbitron text-[9px] font-black block mt-0.5 ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CounterTelemetryMap({ currentStage }: { currentStage: number }) {
  const stats = [
    { stage: 'ORDER AUTHENTICATED', temp: '--°C', pressure: '0.0 Bar', tds: '--' },
    { stage: 'EXTRACTION ACTIVE', temp: '93.4°C', pressure: '9.2 Bar', tds: '1.10%' },
    { stage: 'REFRACTOMETER QA', temp: '88.1°C', pressure: '9.0 Bar', tds: '1.38%' },
    { stage: 'AWAITING COLLECTION', temp: '78.5°C', pressure: '0.0 Bar', tds: '1.38%' },
  ];
  const currentStat = stats[Math.min(currentStage, stats.length - 1)];

  return (
    <div className="space-y-4">
      <div className="relative glass border-white/5 bg-black/40 rounded-xl p-4 overflow-hidden">
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-racing-red animate-ping" />
          <span className="font-orbitron text-[8px] text-racing-red font-black tracking-widest uppercase">PIT LANE KITCHEN NODES</span>
        </div>
        
        <svg viewBox="0 0 400 180" className="w-full h-44 text-white/5">
          <defs>
            <pattern id="grid-c" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-c)" />
          
          <line x1="50" y1="90" x2="350" y2="90" stroke="white" strokeWidth="1" strokeOpacity="0.08" />
          <line x1="50" y1="90" x2="350" y2="90" stroke="rgba(225,6,0,0.2)" strokeWidth="1.5" strokeDasharray="5 5" />
          
          <circle cx="50" cy="90" r="3.5" className="fill-racing-red" />
          <text x="50" y="110" className="font-orbitron text-[6px] font-bold fill-white/40 text-center" textAnchor="middle">POS NODE</text>

          <circle cx="150" cy="90" r="3.5" className="fill-white/15" />
          <text x="150" y="110" className="font-orbitron text-[6px] font-bold fill-white/40 text-center" textAnchor="middle">BREW CODES</text>

          <circle cx="250" cy="90" r="3.5" className="fill-white/15" />
          <text x="250" y="110" className="font-orbitron text-[6px] font-bold fill-white/40 text-center" textAnchor="middle">TDS REVIEW</text>
          
          <circle cx="350" cy="90" r="4.5" className="fill-green-400" />
          <text x="350" y="110" className="font-orbitron text-[6px] font-bold fill-white/40 text-center" textAnchor="middle">COUNTER 4</text>

          {/* Active indicator */}
          <motion.g
            animate={
              currentStage === 0 ? { x: 50, y: 90 } :
              currentStage === 1 ? { x: 150, y: 90 } :
              currentStage === 2 ? { x: 250, y: 90 } :
              { x: 350, y: 90 }
            }
            transition={{ type: 'spring', damping: 25, stiffness: 60 }}
          >
            <circle cx="0" cy="0" r="7" className="fill-racing-red/20 animate-pulse" />
            <circle cx="0" cy="0" r="2.5" className="fill-racing-red" />
          </motion.g>
        </svg>

        <div className="absolute bottom-2 right-2 font-mono text-[7px] text-white/30">
          <div>STATION: MONZA-PB4</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'CURRENT BAR', value: currentStat.stage, color: 'text-white', span: 'col-span-2' },
          { label: 'TEMP METRICS', value: currentStat.temp, color: 'text-racing-red' },
          { label: 'PRESSURE BAR', value: currentStat.pressure, color: 'text-pit-yellow' },
        ].map((item, idx) => (
          <div key={idx} className={`glass border-white/5 bg-black/25 rounded-lg p-2 ${item.span || ''}`}>
            <span className="font-orbitron text-[6px] text-white/30 block tracking-widest uppercase">{item.label}</span>
            <span className={`font-orbitron text-[9px] font-black block mt-0.5 truncate ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteMap({ method, currentStage }: { method: 'counter' | 'trackside' | 'drone'; currentStage: number }) {
  if (method === 'drone') return <DroneTelemetryMap currentStage={currentStage} />;
  if (method === 'trackside') return <TracksideTelemetryMap currentStage={currentStage} />;
  return <CounterTelemetryMap currentStage={currentStage} />;
}

// ─── Elapsed Timer ────────────────────────────────────────────────────────────
function useElapsed() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return elapsed;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const { playSound } = useSound();
  const { user } = useAuth();

  const [cleared, setCleared] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const elapsed = useElapsed();

  const [rewardsEarned, setRewardsEarned] = useState<{ xp: number; credits: number; newLevel: number; leveledUp: boolean } | null>(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  // Printing state variables
  const [printLogs, setPrintLogs] = useState<string[]>([]);
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);

  // Map order storage fields
  const mappedOrder: OrderData | null = order ? {
    id: order.id,
    ref: order.ref,
    total: order.total,
    currency: order.currency || 'EUR',
    items: order.items || [],
    customerEmail: order.customerEmail || 'driver@apexbrews.com',
    created: order.created,
    fulfillmentMethod: order.fulfillmentMethod || 'counter',
    customerName: order.customerName || 'FIA Official / Demo Driver',
    customerPhone: order.customerPhone || '+39 039 24821',
    shippingAddress: order.shippingAddress || 'Autodromo Nazionale Monza, Pit Lane Box 4',
    shippingCity: order.shippingCity || 'Monza',
    shippingPostcode: order.shippingPostcode || '20900',
    shippingCountry: order.shippingCountry || 'Italy',
    shippingCost: order.shippingCost ?? 0.00,
    vat: order.vat ?? (order.total * 0.08),
    subtotal: order.subtotal ?? (order.total - (order.vat ?? (order.total * 0.08)) - (order.shippingCost ?? 0.00)),
    isDemo: order.isDemo || false
  } : null;

  const subtotalVal = mappedOrder?.subtotal ?? 0;
  const vatVal = mappedOrder?.vat ?? 0;
  const shippingCostVal = mappedOrder?.shippingCost ?? 0;

  const [stagesList, setStagesList] = useState<any[]>(getStages('counter'));

  // Trigger rewards updates
  useEffect(() => {
    if (!order || !user) return;

    const claimKey = `order_reward_claimed_${user.id}_${order.id}`;
    const alreadyClaimed = localStorage.getItem(claimKey);

    if (alreadyClaimed) return;

    const xpReward = Math.round(order.total * 100);
    const creditsReward = Math.round(order.total * 50);

    const updateProfileStats = async () => {
      const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
      
      let currentXp = 0;
      let currentCredits = 0;
      let currentLevel = 1;
      let currentRank = 'Rookie';
      let fullName = user?.user_metadata?.full_name || 'Demo Driver';

      if (isSupabase) {
        try {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if (profile) {
            currentXp = profile.xp || 0;
            currentCredits = profile.credits || 0;
            currentLevel = profile.level || 1;
            currentRank = profile.driver_rank || 'Rookie';
          }
        } catch (e) {
          console.error("Failed to fetch profile for rewards update:", e);
        }
      } else {
        const storedProfileKey = `profile_demo_${user.id}`;
        const stored = localStorage.getItem(storedProfileKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            currentXp = parsed.xp ?? 0;
            currentCredits = parsed.credits ?? 0;
            currentLevel = parsed.level ?? 1;
            currentRank = parsed.driver_rank ?? 'Rookie';
          } catch (e) {}
        } else {
          currentXp = 3200;
          currentCredits = 1250;
          currentLevel = 4;
          currentRank = 'Lead Driver';
        }
      }

      const nextXp = currentXp + xpReward;
      const nextCredits = currentCredits + creditsReward;
      const nextLevel = Math.floor(nextXp / 1000) + 1;
      const leveledUp = nextLevel > currentLevel;

      let nextRank = currentRank;
      if (nextLevel === 2) nextRank = 'Test Driver';
      else if (nextLevel === 3) nextRank = 'Reserve Driver';
      else if (nextLevel === 4) nextRank = 'Lead Driver';
      else if (nextLevel === 5) nextRank = 'Podium Contender';
      else if (nextLevel === 6) nextRank = 'Grand Prix Winner';
      else if (nextLevel === 7) nextRank = 'World Champion';
      else if (nextLevel >= 8) nextRank = 'Hall of Fame Legend';

      if (isSupabase) {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            xp: nextXp,
            credits: nextCredits,
            level: nextLevel,
            driver_rank: nextRank,
            updated_at: new Date().toISOString()
          });
        } catch (e) {
          console.error("Failed to update profile via Supabase:", e);
        }
      } else {
        const storedProfileKey = `profile_demo_${user.id}`;
        localStorage.setItem(storedProfileKey, JSON.stringify({
          full_name: fullName,
          xp: nextXp,
          credits: nextCredits,
          level: nextLevel,
          driver_rank: nextRank,
          role: 'admin'
        }));
      }

      localStorage.setItem(claimKey, 'true');

      setRewardsEarned({
        xp: xpReward,
        credits: creditsReward,
        newLevel: nextLevel,
        leveledUp
      });
      
      setTimeout(() => {
        setShowRewardsModal(true);
        playSound(leveledUp ? 'engine-rev' : 'pit-stop');
      }, 1000);
    };

    updateProfileStats();
  }, [order, user, playSound]);

  // Clear cart once
  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
      playSound('gear-shift');
    }
  }, [cleared, clearCart, playSound]);

  // Fetch order details
  useEffect(() => {
    if (!sessionId) return;

    if (sessionId.startsWith('demo_')) {
      try {
        const stored = localStorage.getItem(`order_${sessionId}`);
        if (stored) setOrder(JSON.parse(stored));
        else setFetchError(true);
      } catch {
        setFetchError(true);
      }
      return;
    }

    fetch(`/api/order?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setFetchError(true); return; }
        setOrder(data);
      })
      .catch(() => setFetchError(true));
  }, [sessionId]);

  // Setup dynamic stage progression
  useEffect(() => {
    if (!mappedOrder) return;
    const method = mappedOrder.fulfillmentMethod || 'counter';
    const activeStages = getStages(method);
    setStagesList(activeStages);
    setCurrentStage(0);

    const timers = activeStages.slice(1).map((stage, i) =>
      setTimeout(() => {
        setCurrentStage(i + 1);
        playSound('click');
      }, stage.delayMs)
    );
    return () => timers.forEach(clearTimeout);
  }, [order]);

  const isReady = currentStage === stagesList.length - 1;

  // Print Thermal Ticket simulator sequence
  const handlePrintTicket = () => {
    if (printing || printed) return;
    setPrinting(true);
    setPrintLogs(['[PRN] Initializing high-speed thermal head...', '[PRN] Voltage: 24.2V | Head Temp: 28°C']);
    playSound('click');
    
    const steps = [
      { log: '[PRN] Feeding thermal media (80mm spool)...', sound: 'gear-shift', delay: 600 },
      { log: '[PRN] Rasterizing barcode graphic (1D Code 128)...', sound: 'click', delay: 1200 },
      { log: '[PRN] Printing order metadata & cryptography signature...', sound: 'click', delay: 1800 },
      { log: '[PRN] SUCCESS: Ticket printed & ejected.', sound: 'pit-stop', delay: 2500 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setPrintLogs(prev => [...prev, step.log]);
        if (step.sound) playSound(step.sound as any);
        if (step.log.includes('SUCCESS')) {
          setPrinting(false);
          setPrinted(true);
        }
      }, step.delay);
    });
  };

  return (
    <main className="min-h-screen bg-carbon-black pt-28 pb-20 px-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,6,0,0.07),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-racing-red to-transparent pointer-events-none" />
      <div className="absolute top-20 left-8 w-20 h-20 border-l-2 border-t-2 border-racing-red/20 pointer-events-none" />
      <div className="absolute bottom-20 right-8 w-20 h-20 border-r-2 border-b-2 border-racing-red/20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-1000 ${
              isReady
                ? 'bg-green-500/20 border-2 border-green-400 shadow-[0_0_60px_rgba(34,197,94,0.3)]'
                : 'bg-racing-red/10 border-2 border-racing-red/30'
            }`}
          >
            <AnimatePresence mode="wait">
              {isReady ? (
                <motion.div key="ready" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Flag size={28} className="text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="brewing"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Coffee size={28} className="text-racing-red" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-8 h-[1px] bg-racing-red" />
              <span className="font-orbitron text-[9px] text-racing-red font-black tracking-[0.4em] uppercase">
                {isReady ? 'DELIVERY COMPLETE / READY' : 'LIVE TELEMETRY PATH'}
              </span>
              <span className="w-8 h-[1px] bg-racing-red" />
            </div>
            <h1 className="font-orbitron text-3xl md:text-5xl font-black italic text-white tracking-tighter mb-2">
              {isReady ? (
                <><span className="text-green-400">MISSION</span> ACCOMPLISHED!</>
              ) : (
                <>LIGHTS OUT, <span className="text-racing-red">COFFEE DISPATCHED!</span></>
              )}
            </h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <Clock size={12} className="text-white/30" />
              <span className="font-orbitron text-[10px] text-white/30 tracking-widest">
                LAP TIME: {formatTime(elapsed)}
              </span>
              {mappedOrder && (
                <>
                  <span className="text-white/10">·</span>
                  <span className="font-orbitron text-[10px] text-white/20 tracking-widest">
                    REF #{mappedOrder.ref}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* ── Left Column (Timeline and Map) ── */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass border-white/5 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-racing-red/30 to-transparent" />
              
              <h2 className="font-orbitron text-[9px] font-black tracking-[0.3em] text-white/30 uppercase mb-6">
                PIT LANE PROCESS PROGRESSION
              </h2>

              <div className="space-y-4">
                {stagesList.map((stage, i) => {
                  const Icon = stage.icon;
                  const isDone = i < currentStage;
                  const isActive = i === currentStage;
                  const isPending = i > currentStage;

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="flex items-start gap-4"
                    >
                      {/* Icon Container */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-700 ${
                          isDone ? `${stage.bg} ${stage.glow}` :
                          isActive ? `${stage.bg}/20 border-2 border-current ${stage.color}` :
                          'bg-white/5 border border-white/10'
                        }`}>
                          {isDone ? (
                            <CheckCircle size={14} className="text-white" />
                          ) : isActive ? (
                            <motion.div
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Icon size={14} className={stage.color} />
                            </motion.div>
                          ) : (
                            <Icon size={14} className="text-white/20" />
                          )}
                        </div>
                        {/* Connecting Line */}
                        {i < stagesList.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[2px] h-5 bg-white/5 overflow-hidden">
                            <motion.div
                              animate={{ height: isDone ? '100%' : '0%' }}
                              transition={{ duration: 0.4 }}
                              className={`w-full ${stage.bg}`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="pt-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-orbitron text-xs font-black tracking-wider transition-colors ${
                            isPending ? 'text-white/20' : 'text-white'
                          }`}>
                            {stage.label}
                          </p>
                          {isActive && (
                            <motion.span
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              className="font-orbitron text-[7px] font-black text-racing-red tracking-widest uppercase bg-racing-red/10 px-1.5 py-0.5 rounded-full"
                            >
                              ACTIVE
                            </motion.span>
                          )}
                          {isDone && (
                            <span className="font-orbitron text-[7px] font-black text-green-400 tracking-widest">OK</span>
                          )}
                        </div>
                        <p className={`text-[9px] tracking-widest mt-0.5 transition-colors truncate ${
                          isPending ? 'text-white/10' : 'text-white/40'
                        }`}>
                          {stage.sublabel}
                        </p>

                        {/* Sub progress bar */}
                        {isActive && (
                          <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{
                                duration: (stagesList[i + 1]?.delayMs ?? 35000) / 1000 - stage.delayMs / 1000,
                                ease: 'linear',
                              }}
                              className={`h-full ${stage.bg}`}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Ready Notification Box */}
              <AnimatePresence>
                {isReady && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-3.5 bg-green-500/10 border border-green-500/25 rounded-xl flex items-center gap-3"
                  >
                    <Bell size={14} className="text-green-400 animate-bounce flex-shrink-0" />
                    <p className="font-orbitron text-[9px] text-green-400 font-black tracking-wider uppercase">
                      {mappedOrder?.fulfillmentMethod === 'counter'
                        ? 'COLLECTION CRITERIA COMPLETED — Ready at Pitbox 4 Counter!'
                        : 'CARGO REACHED TARGET GATE — Telemetry logs finalized!'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Logistics Route Map Tracker */}
            {mappedOrder && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass border-white/5 rounded-2xl p-6 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-orbitron text-[9px] font-black tracking-[0.3em] text-white/30 uppercase">
                    LIVE LOGISTICS TELEMETRY MAP
                  </h3>
                  <span className="font-orbitron text-[8px] text-white/40 tracking-wider">
                    METHOD: {mappedOrder.fulfillmentMethod?.toUpperCase()}
                  </span>
                </div>

                <RouteMap method={mappedOrder.fulfillmentMethod || 'counter'} currentStage={currentStage} />
              </motion.div>
            )}

          </div>

          {/* ── Right Column (Invoice, Thermal Printer) ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Commercial Invoice Card */}
            {mappedOrder ? (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="glass border-white/5 rounded-2xl p-5 bg-white/3 space-y-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-racing-red/3 rounded-full blur-3xl pointer-events-none" />
                
                {/* Logo & Status */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <h2 className="font-orbitron text-sm font-black italic text-white tracking-widest">
                      APEX<span className="text-racing-red">BREWS</span>
                    </h2>
                    <p className="text-[7px] text-white/30 font-orbitron tracking-widest uppercase mt-0.5">COMMERCIAL INVOICE</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-green-500/10 border border-green-500/30 rounded-full px-2 py-0.5 font-orbitron text-[7px] font-black text-green-400 tracking-wider">
                      PAID ✓
                    </span>
                    <p className="font-mono text-[7px] text-white/20 mt-1">#IP-{mappedOrder.ref}</p>
                  </div>
                </div>

                {/* Customer and Delivery Logistics */}
                <div className="grid grid-cols-2 gap-4 text-[9px] font-orbitron">
                  <div className="space-y-1 border-r border-white/5 pr-2">
                    <span className="text-white/30 text-[7px] tracking-wider block uppercase">CLIENT PROFILE</span>
                    <div className="font-black text-white truncate flex items-center gap-1"><User size={8} className="text-racing-red" /> {mappedOrder.customerName}</div>
                    <div className="text-white/60 font-mono flex items-center gap-1"><Mail size={8} className="text-white/40" /> {mappedOrder.customerEmail}</div>
                    <div className="text-white/60 font-mono flex items-center gap-1"><Phone size={8} className="text-white/40" /> {mappedOrder.customerPhone}</div>
                  </div>
                  <div className="space-y-1 pl-2">
                    <span className="text-white/30 text-[7px] tracking-wider block uppercase">DELIVERY COORDS</span>
                    {mappedOrder.fulfillmentMethod === 'counter' ? (
                      <div>
                        <div className="font-black text-white flex items-center gap-1"><MapPin size={8} className="text-racing-red" /> Paddock Counter</div>
                        <div className="text-white/50 text-[8px] uppercase mt-0.5 leading-normal">Box 4, Monza Pit Lane</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-black text-white truncate flex items-center gap-1"><MapPin size={8} className="text-racing-red" /> {mappedOrder.shippingCity}</div>
                        <div className="text-white/50 text-[8px] truncate leading-normal">{mappedOrder.shippingAddress}</div>
                        <div className="text-white/40 text-[8px] font-mono">{mappedOrder.shippingPostcode}, {mappedOrder.shippingCountry}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items Table */}
                <div className="border-t border-white/5 pt-4">
                  <span className="text-white/30 text-[7px] font-orbitron tracking-wider block uppercase mb-2">ITEMIZED TELEMETRY BLENDS</span>
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {mappedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-[9px] font-orbitron">
                        <div className="min-w-0 pr-2">
                          <p className="font-black text-white tracking-wide truncate">{item.product_name}</p>
                          <p className="text-[7px] text-white/30 tracking-widest font-mono">QTY: {item.quantity} × €{item.price.toFixed(2)}</p>
                        </div>
                        <span className="font-black text-racing-red flex-shrink-0">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Details */}
                <div className="border-t border-white/5 pt-4 space-y-1.5 font-orbitron text-[9px]">
                  <div className="flex justify-between text-white/40">
                    <span>ITEMS SUBTOTAL</span>
                    <span>€{subtotalVal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>8% VAT TAX</span>
                    <span>€{vatVal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>SHIPPING SPEED CHARGES</span>
                    <span>{shippingCostVal === 0 ? 'FREE' : `€${shippingCostVal.toFixed(2)}`}</span>
                  </div>
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-baseline">
                    <span className="font-black text-white text-[10px]">TOTAL COLLECTED</span>
                    <span className="font-black text-lg text-racing-red">
                      €{mappedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions inside Invoice Card */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      playSound('click');
                      window.print();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-orbitron text-[8px] font-bold tracking-widest cursor-pointer transition-all uppercase"
                  >
                    <Download size={10} />
                    PDF Invoice
                  </button>
                  <button
                    onClick={handlePrintTicket}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border font-orbitron text-[8px] font-bold tracking-widest cursor-pointer transition-all uppercase ${
                      printed 
                        ? 'border-green-500/30 bg-green-500/5 text-green-400' 
                        : 'border-racing-red/30 bg-racing-red/5 hover:bg-racing-red/10 text-racing-red hover:text-white hover:border-racing-red/60 shadow-[0_0_10px_rgba(225,6,0,0.05)]'
                    }`}
                  >
                    <Printer size={10} />
                    {printed ? 'Printed ✓' : 'Print Ticket'}
                  </button>
                </div>
              </motion.div>
            ) : fetchError ? (
              <div className="glass border-white/5 rounded-2xl p-6 text-center text-white/30 font-orbitron text-[9px] tracking-widest">
                COULD NOT SPOOL INVOICE DATA.
              </div>
            ) : (
              <div className="glass border-white/5 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-4 w-1/3 bg-white/5 rounded" />
                <div className="h-10 bg-white/5 rounded" />
                <div className="h-20 bg-white/5 rounded" />
              </div>
            )}

            {/* Thermal Ticket Printer Simulation */}
            {mappedOrder && (
              <div className="space-y-4">
                {/* Console Log Panel */}
                <AnimatePresence>
                  {printing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass border-green-500/20 bg-black/60 rounded-xl p-3 font-mono text-[7px] text-green-400 space-y-1.5 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 border-b border-white/5 pb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                        <span className="font-orbitron font-bold tracking-widest text-green-500">THERMAL HEAD SPOOLING</span>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {printLogs.map((log, i) => (
                          <div key={i} className="flex gap-1">
                            <span className="text-white/20 select-none">[{i}]</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Physical Ticket Output */}
                <div className="relative">
                  {/* Slot */}
                  <div className="h-3 bg-zinc-900 border border-zinc-800 rounded-full w-full relative z-20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] overflow-hidden">
                    <div className="absolute inset-x-4 top-1 h-0.5 bg-black rounded-full" />
                  </div>
                  
                  {/* Sliding physical card */}
                  <AnimatePresence>
                    {printed && (
                      <motion.div
                        initial={{ y: -60, opacity: 0, scaleY: 0.1 }}
                        animate={{ y: 0, opacity: 1, scaleY: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 85 }}
                        className="origin-top relative z-10 -mt-1.5 bg-[#f4f4f5] text-zinc-900 font-mono text-[8px] p-5 rounded-b-lg shadow-2xl border-x border-b border-zinc-300 max-w-sm mx-auto select-none"
                        style={{
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
                          background: 'linear-gradient(to bottom, #f4f4f5 95%, #e4e4e7 100%)'
                        }}
                      >
                        {/* Jagged tear-off bottom simulation using CSS border */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[linear-gradient(45deg,transparent_33.333%,#f4f4f5_33.333%,#f4f4f5_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#f4f4f5_33.333%,#f4f4f5_66.667%,transparent_66.667%)] bg-[length:6px_12px] -mb-1 pointer-events-none" />
                        
                        <div className="text-center space-y-0.5 mb-3">
                          <p className="font-orbitron font-black text-[11px] tracking-widest text-black">APEX BREWS</p>
                          <p className="text-[6px] text-zinc-500 uppercase tracking-widest">Coffee Calibrated for Speed</p>
                          <p className="text-[6px] text-zinc-400">FIA PADDOCK OFFICIAL STATION</p>
                          <p className="text-[7px] border-y border-dashed border-zinc-300 py-1 my-1">
                            RECEIPT REF: #{mappedOrder.ref}
                          </p>
                        </div>

                        <div className="space-y-1 mb-3 text-left">
                          <p><span className="text-zinc-500">DATE:</span> {new Date(mappedOrder.created * 1000).toLocaleString()}</p>
                          <p><span className="text-zinc-500">PILOT:</span> {mappedOrder.customerName?.toUpperCase() || ''}</p>
                          <p><span className="text-zinc-500">METHOD:</span> {mappedOrder.fulfillmentMethod?.toUpperCase() || ''}</p>
                        </div>

                        <div className="border-t border-dashed border-zinc-300 my-1.5" />

                        <div className="space-y-1 text-left">
                          {mappedOrder.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.quantity}x {item.product_name.toUpperCase()}</span>
                              <span>€{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-dashed border-zinc-300 my-1.5" />

                        <div className="space-y-0.5 text-left">
                          <div className="flex justify-between">
                            <span>SUBTOTAL:</span>
                            <span>€{subtotalVal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAT (8%):</span>
                            <span>€{vatVal.toFixed(2)}</span>
                          </div>
                          {shippingCostVal > 0 && (
                            <div className="flex justify-between">
                              <span>DELIVERY:</span>
                              <span>€{shippingCostVal.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-black border-t border-dashed border-zinc-300 pt-1 mt-1">
                            <span>TOTAL PAID:</span>
                            <span>€{mappedOrder.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-zinc-300 my-2 pt-1.5 text-center text-[6px] text-zinc-500 space-y-0.5">
                          <p>PAYMENT SECURED BY APEX TELEMETRY</p>
                          <p>CIPHER: AES-256-GCM TLS 1.3</p>
                        </div>

                        {/* Barcode */}
                        <div className="flex flex-col items-center justify-center space-y-1 mt-3">
                          <div className="h-5 w-40 flex items-center justify-between opacity-80 overflow-hidden bg-white px-2 py-0.5 border border-zinc-200 pointer-events-none">
                            {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 2, 4, 2, 1, 3, 2, 1, 2, 4, 1, 2, 3].map((w, idx) => (
                              <div key={idx} className="bg-black h-full" style={{ width: `${w}px` }} />
                            ))}
                          </div>
                          <span className="text-[5px] text-zinc-400 select-none">*(APEX-{mappedOrder.ref})*</span>
                        </div>

                        <div className="mt-3 pt-2 border-t border-dashed border-zinc-200 flex justify-center">
                          <button
                            onClick={() => {
                              playSound('click');
                              window.print();
                            }}
                            className="flex items-center gap-1 text-[7px] text-racing-red hover:underline font-bold cursor-pointer"
                          >
                            <Printer size={9} />
                            TRIGGER SYSTEM PRINT
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <Link href="/paddock-club">
                <button className="w-full btn-racing flex items-center justify-center gap-2 py-3 text-[11px] cursor-pointer">
                  View Full History
                  <ChevronRight size={14} />
                </button>
              </Link>
              <Link href="/">
                <button className="w-full glass px-6 py-3 flex items-center justify-center gap-2 font-orbitron font-bold text-[10px] tracking-[0.2em] hover:bg-racing-red transition-all border-white/5 text-white/40 hover:text-white cursor-pointer">
                  Return to Main Landing
                  <ArrowRight size={14} />
                </button>
              </Link>
              <Link href="/menu">
                <button className="w-full glass px-6 py-3 flex items-center justify-center gap-2 font-orbitron font-bold text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all border-white/5 text-white/40 hover:text-white cursor-pointer">
                  Order Again
                  <ChevronRight size={14} />
                </button>
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Rewards Claimed Holographic Modal */}
      <AnimatePresence>
        {showRewardsModal && rewardsEarned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, rotateX: 10 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative max-w-md w-full glass border-l-[6px] border-l-racing-red p-8 md:p-10 rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.15),transparent)] shadow-2xl text-center space-y-6 overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

              <div className="relative mx-auto w-20 h-20 rounded-full bg-racing-red/10 border-2 border-racing-red flex items-center justify-center shadow-[0_0_30px_rgba(225,6,0,0.3)]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 border border-dashed border-racing-red/30 rounded-full"
                />
                <Trophy size={32} className="text-racing-red animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="font-orbitron text-[9px] font-black text-racing-red tracking-[0.4em] uppercase block">
                  TELEMETRY REPORT: REWARDS
                </span>
                <h3 className="font-orbitron text-2xl md:text-3xl font-black italic tracking-tight text-white uppercase">
                  {rewardsEarned.leveledUp ? 'DRIVER LEVEL UP!' : 'PIT STOP REWARDS'}
                </h3>
                <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                  Your chassis adjustments and ERS telemetry have earned premium telemetry credits.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 font-orbitron text-left">
                <div className="space-y-1">
                  <span className="text-[7px] text-white/40 tracking-widest block uppercase">ERS POINTS</span>
                  <span className="text-lg font-black text-pit-yellow">+{rewardsEarned.credits} CR</span>
                </div>
                <div className="space-y-1 border-l border-white/5 pl-4">
                  <span className="text-[7px] text-white/40 tracking-widest block uppercase">CHASSIS XP</span>
                  <span className="text-lg font-black text-white">+{rewardsEarned.xp} XP</span>
                </div>
              </div>

              {rewardsEarned.leveledUp && (
                <div className="py-2 px-4 bg-pit-yellow/10 border border-pit-yellow/20 rounded-xl">
                  <p className="font-orbitron text-[9px] text-pit-yellow font-black tracking-widest uppercase">
                    PROMOTED TO LEVEL {rewardsEarned.newLevel}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  playSound('click');
                  setShowRewardsModal(false);
                }}
                className="w-full btn-racing py-3 text-[11px] font-orbitron font-black tracking-[0.2em] skew-x-[-15deg] cursor-pointer"
              >
                <span className="skew-x-[15deg] block">RESUME RACE</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ─── Page with Suspense ───────────────────────────────────────────────────────
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-carbon-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-racing-red border-t-transparent rounded-full"
        />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
