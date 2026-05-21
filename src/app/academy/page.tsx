'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, CloudRain, Moon, Sun, Activity, Cpu, Target, Maximize2, 
  Play, RotateCcw, AlertTriangle, CheckCircle2, Zap, Flame, Trophy, Gauge
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  OrbitControls, Float, Environment, Text, RoundedBox, 
  ContactShadows, Html, PerspectiveCamera 
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { useSound } from '@/context/SoundContext';
import { useAuth } from '@/context/AuthContext';

// --- PERFORMANCE RAIN DROPLETS ---
const RainDroplets = () => {
  const points = useMemo(() => {
    const p = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = Math.random() * 5;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.position.z += 0.12;
      if (ref.current.position.z > 4) ref.current.position.z = 0;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#fff" transparent opacity={0.35} />
    </points>
  );
};

// --- SIMULATOR HARDWARE ASSETS ---
const SideMirror = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
  <group position={position} rotation={rotation}>
    <mesh>
      <boxGeometry args={[0.3, 0.2, 0.1]} />
      <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0, 0.055]}>
      <planeGeometry args={[0.25, 0.15]} />
      <meshStandardMaterial color="#888" metalness={1} roughness={0} />
    </mesh>
  </group>
);

const HaloSystem = () => (
  <group position={[0, 0.5, 0]}>
    <mesh position={[0, 0.3, 1.2]}>
       <cylinderGeometry args={[0.04, 0.05, 1.2, 12]} />
       <meshStandardMaterial color="#080808" metalness={1} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 1.1, 0, 0]}>
       <torusGeometry args={[1.0, 0.05, 8, 32, Math.PI]} />
       <meshStandardMaterial color="#080808" metalness={1} roughness={0.2} />
    </mesh>
  </group>
);

const ThumbDial = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
  <group position={position} rotation={rotation}>
    <mesh>
      <cylinderGeometry args={[0.04, 0.04, 0.15, 12]} />
      <meshStandardMaterial color="#050505" metalness={1} roughness={0.1} />
    </mesh>
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} position={[0, (i - 2.5) * 0.025, 0]}>
        <torusGeometry args={[0.042, 0.005, 8, 12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    ))}
  </group>
);

const CornerDial = ({ position, color }: { position: [number, number, number], color: string }) => (
  <group position={position}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.09, 0.1, 0.08, 16]} />
      <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 0.02, 3, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </group>
);

const RotaryDial = ({ position, label, color = "#fff", scale = 1 }: { position: [number, number, number], label: string, color?: string, scale?: number }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.07, 0.08, 0.06, 16]} />
      <meshStandardMaterial color="#111" metalness={1} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
    <Text position={[0, -0.12, 0.02]} fontSize={0.035} color="#fff">{label}</Text>
  </group>
);

const Paddle = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
  <mesh position={position} rotation={rotation}>
    <boxGeometry args={[0.45, 0.25, 0.02]} />
    <meshStandardMaterial color="#050505" metalness={1} roughness={0.1} />
  </mesh>
);

// --- CORE REPLICA STEERING WHEEL ---
const SteeringWheelModel = ({ 
  activeButton, 
  setActiveButton,
  isRainMode,
  liveSpeed,
  liveGear
}: { 
  activeButton: string | null, 
  setActiveButton: (id: string) => void,
  isRainMode: boolean,
  liveSpeed: number,
  liveGear: string
}) => {
  const { playSound } = useSound();
  const [rpm, setRpm] = useState(0);
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Simulate high frequency engine throttling loops mapped directly to interactive UI commands
    setRpm((Math.sin(time * liveSpeed * 0.01) * 0.5 + 0.5) * 15000);
    if (wheelRef.current) {
      const mouseX = state.mouse.x;
      wheelRef.current.rotation.z = THREE.MathUtils.lerp(wheelRef.current.rotation.z, -mouseX * 0.2, 0.1);
      wheelRef.current.rotation.x = THREE.MathUtils.lerp(wheelRef.current.rotation.x, state.mouse.y * 0.1, 0.1);
      wheelRef.current.position.y = Math.sin(time * 15) * 0.002;
    }
  });

  return (
    <group>
      {/* COCKPIT TUB SURROUNDINGS */}
      <group position={[0, -0.85, -1.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.8, 3.2, 6.5, 32, 1, true]} />
          <meshStandardMaterial color="#050505" metalness={1} roughness={0.5} side={THREE.BackSide} />
        </mesh>
        
        {/* Quick Release Pull labels */}
        <group position={[-2.4, 0.6, 2.5]} rotation={[0, 0.8, 0]}>
           <mesh><planeGeometry args={[0.4, 0.15]} /><meshStandardMaterial color="#fbbf24" /></mesh>
           <Text position={[0, 0, 0.01]} fontSize={0.06} color="#000">PULL</Text>
        </group>
        <group position={[2.4, 0.6, 2.5]} rotation={[0, -0.8, 0]}>
           <mesh><planeGeometry args={[0.4, 0.15]} /><meshStandardMaterial color="#fbbf24" /></mesh>
           <Text position={[0, 0, 0.01]} fontSize={0.06} color="#000">PULL</Text>
        </group>

        <mesh position={[-1.8, 0.9, 0.8]} rotation={[0, 0, 0.2]}><boxGeometry args={[1.2, 0.04, 0.04]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[1.8, 0.9, 0.8]} rotation={[0, 0, -0.2]}><boxGeometry args={[1.2, 0.04, 0.04]} /><meshStandardMaterial color="#111" /></mesh>

        <HaloSystem />
        <SideMirror position={[-2.8, 1.0, 1.8]} rotation={[0, 0.5, 0]} />
        <SideMirror position={[2.8, 1.0, 1.8]} rotation={[0, -0.5, 0]} />
        {isRainMode && <RainDroplets />}
      </group>

      {/* DETAILED ROTATING WHEEL GEOMETRY */}
      <group ref={wheelRef} scale={[1.45, 1.45, 1.45]} position={[0, 0, 0.6]}>
        <group position={[0, 0, -0.2]}>
          <Paddle position={[-0.8, 0.45, 0]} rotation={[0, 0.35, 0]} />
          <Paddle position={[0.8, 0.45, 0]} rotation={[0, -0.35, 0]} />
          <Paddle position={[-0.8, -0.15, 0]} rotation={[0, 0.25, 0]} />
          <Paddle position={[0.8, -0.15, 0]} rotation={[0, -0.25, 0]} />
        </group>

        <group>
          <RoundedBox args={[1.0, 1.3, 0.3]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
          </RoundedBox>
          
          <mesh position={[0, 0.55, 0]}><boxGeometry args={[1.8, 0.2, 0.3]} /><meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} /></mesh>
          <mesh position={[0, -0.45, 0]}><boxGeometry args={[1.8, 0.2, 0.3]} /><meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} /></mesh>
          
          <group position={[-0.7, 0.7, 0]}>
            <RoundedBox args={[0.55, 0.45, 0.35]} radius={0.12} smoothness={4}>
               <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
            </RoundedBox>
            <CornerDial position={[-0.05, 0.05, 0.18]} color="#ef4444" />
          </group>
          <group position={[0.7, 0.7, 0]}>
            <RoundedBox args={[0.55, 0.45, 0.35]} radius={0.12} smoothness={4}>
               <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
            </RoundedBox>
            <CornerDial position={[0.05, 0.05, 0.18]} color="#3b82f6" />
          </group>

          <group position={[-1.0, 0.05, 0]}>
            <capsuleGeometry args={[0.26, 1.1, 16, 32]} />
            <meshStandardMaterial color="#050505" roughness={1} />
            <ThumbDial position={[0.15, 0.35, 0.1]} rotation={[0, 0, 0]} />
          </group>
          <group position={[1.0, 0.05, 0]}>
            <capsuleGeometry args={[0.26, 1.1, 16, 32]} />
            <meshStandardMaterial color="#050505" roughness={1} />
            <ThumbDial position={[-0.15, 0.35, 0.1]} rotation={[0, 0, 0]} />
          </group>
        </group>

        {/* EMBEDDED DYNAMIC COCKPIT TELEMETRY SCREEN */}
        <group position={[0, 0.3, 0.15]}>
          <mesh position={[0, 0, -0.01]}><planeGeometry args={[0.9, 0.6]} /><meshStandardMaterial color="#000" /></mesh>
          <Html transform position={[0, 0, 0.01]} distanceFactor={0.58}>
            <div className="w-[320px] h-[210px] bg-black text-white font-orbitron p-8 flex flex-col justify-between border border-white/10 select-none overflow-hidden shadow-[inset_0_0_50px_rgba(255,255,255,0.05)]">
              <div className="flex justify-between items-center text-[8px] opacity-40 uppercase tracking-[0.4em] font-black italic">
                <div className="flex gap-4"><span>SAUBER_ENGINEERING</span><span className="text-racing-red">LIVE</span></div>
                <span>DRS_ENABLED</span>
              </div>
              <div className="flex items-center justify-center gap-8">
                <div className="text-[110px] font-black italic tracking-tighter leading-none text-white opacity-95">
                  {liveGear}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-5xl font-black">{Math.round(liveSpeed)}</div>
                  <div className="text-[9px] opacity-40 font-black uppercase tracking-[0.5em]">km/h</div>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-white/5 pt-4">
                 <div className="flex flex-col gap-1.5 w-1/2">
                   <div className="flex justify-between text-[6px] opacity-30 uppercase font-black"><span>ers_soc</span><span>94%</span></div>
                   <div className="w-full h-1.5 bg-white/5 border border-white/5"><div className="h-full bg-blue-500 w-[94%]" /></div>
                 </div>
                 <div className="text-right flex flex-col">
                    <span className="text-xl font-black text-green-500 italic leading-none">-0.142</span>
                    <span className="text-[6px] opacity-30 uppercase font-black tracking-widest">p1_delta</span>
                 </div>
              </div>
            </div>
          </Html>
        </group>

        {/* LED SHIFT LIGHTS */}
        <group position={[0, 0.76, 0.2]}>
          {Array.from({ length: 15 }).map((_, i) => {
            const active = rpm > (i * 1000);
            const color = i < 5 ? '#22c55e' : i < 10 ? '#ef4444' : '#3b82f6';
            return (
              <mesh key={i} position={[(i - 7) * 0.08, 0, 0]}>
                <boxGeometry args={[0.07, 0.04, 0.02]} />
                <meshStandardMaterial 
                  color={active ? color : '#050505'} 
                  emissive={active ? color : '#000'} 
                  emissiveIntensity={active ? 20 : 0} 
                />
              </mesh>
            );
          })}
        </group>

        {/* 5-DIAL CONFIGURATION */}
        <group position={[0, -0.32, 0.2]}>
           <RotaryDial position={[-0.3, -0.1, 0]} label="ENG" color="#ef4444" scale={1.1} />
           <RotaryDial position={[0, -0.18, 0]} label="STRAT" color="#fbbf24" scale={1.2} />
           <RotaryDial position={[0.3, -0.1, 0]} label="DIFF" color="#22c55e" scale={1.1} />
           <RotaryDial position={[-0.45, 0.08, 0]} label="B-BAL" color="#3b82f6" scale={0.8} />
           <RotaryDial position={[0.45, 0.08, 0]} label="SOC" color="#a855f7" scale={0.8} />
        </group>

        {/* C37 COCKPIT PUSH BUTTONS */}
        {[
          { id: 'rad', pos: [-0.68, 0.45, 0.18], color: '#fbbf24', label: 'RAD' }, 
          { id: 'ot', pos: [-0.78, 0.25, 0.18], color: '#3b82f6', label: 'OT' },   
          { id: 'drs', pos: [-0.88, 0.05, 0.18], color: '#22c55e', label: 'DRS' }, 
          { id: 'k', pos: [-0.68, -0.15, 0.18], color: '#ef4444', label: 'K' },   
          { id: 'n', pos: [0.68, 0.45, 0.18], color: '#fbbf24', label: 'N' },     
          { id: 'pit', pos: [0.78, 0.25, 0.18], color: '#3b82f6', label: 'PIT' },  
          { id: 'ok', pos: [0.88, 0.05, 0.18], color: '#22c55e', label: 'OK' },   
          { id: 'pl', pos: [0.68, -0.15, 0.18], color: '#ef4444', label: 'PL' },  
        ].map((btn) => (
          <group key={btn.id} position={btn.pos as [number, number, number]} onClick={() => { setActiveButton(btn.id); playSound('click'); }}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 0.06, 16]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, activeButton === btn.id ? 0.02 : 0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.05, 16]} />
              <meshStandardMaterial color={btn.color} emissive={btn.color} emissiveIntensity={activeButton === btn.id ? 2 : 0.2} />
            </mesh>
            <Text position={[0, -0.14, 0.05]} fontSize={0.035} color="#fff">{btn.label}</Text>
          </group>
        ))}
      </group>
    </group>
  );
};

// --- MAIN PLAYABLE RACING ACADEMY APPLICATION MODULE ---
export default function AcademyPage() {
  const { playSound } = useSound();
  const { user, updateUserMetadata } = useAuth();
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isRainMode, setIsRainMode] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  // Playable Mini-Game Selector mode tab
  const [challengeMode, setChallengeMode] = useState<'start' | 'drs' | 'pit'>('start');
  
  // Real-time metrics passed directly to dynamic interactive HTML screen nodes
  const [liveSpeed, setLiveSpeed] = useState(285);
  const [liveGear, setLiveGear] = useState('7');

  // --- GAME 1: REACTION TIME START SEQUENCE SIMULATOR STATE ---
  const [startLightsState, setStartLightsState] = useState<number>(0); // 0-5 lights lit
  const [startStatus, setStartStatus] = useState<'idle' | 'arming' | 'ready' | 'dropped' | 'penalty' | 'success'>('idle');
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number>(0);

  // --- GAME 2: DRS ACTIVATION TIMING CHALLENGE STATE ---
  const [drsCursorPos, setDrsCursorPos] = useState(0); // 0 to 100%
  const [drsStatus, setDrsStatus] = useState<'idle' | 'running' | 'success' | 'missed'>('idle');
  const [drsPressureScore, setDrsPressureScore] = useState<number>(9.2);

  // --- GAME 3: PIT LANE SPEED LIMITER TARGET STATE ---
  const [pitApproachDist, setPitApproachDist] = useState(150); // meters remaining
  const [pitStatus, setPitStatus] = useState<'idle' | 'approaching' | 'locked' | 'speeding'>('idle');
  const [pitPrecisionMeters, setPitPrecisionMeters] = useState<number>(0);

  // --- SIMULATOR BOOKING ENGINE STATES ---
  const [bookingDate, setBookingDate] = useState<string>('');
  const [selectedRigId, setSelectedRigId] = useState<number>(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const rigsList = [
    { id: 1, name: 'Bay 1: Apex Motion Rig', type: 'Full Motion Chassis', price: 45, desc: 'Feel every curb and gear shift with real hydraulic force feedback.' },
    { id: 2, name: 'Bay 2: Fanatec Direct Drive', type: 'Direct Drive Wheel', price: 30, desc: 'Laser precision response steering wheel for true esports competition.' },
    { id: 3, name: 'Bay 3: VR G-Force Pod', type: 'Virtual Reality Pod', price: 35, desc: 'Complete 360-degree immersion in a virtual F1 cockpit.' }
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const dateOptions = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        formatted: d.toISOString().split('T')[0],
        displayDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
        displayDate: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setBookingDate(today);
  }, []);

  const handleBookSlot = async () => {
    if (!user) {
      playSound('pit-stop');
      setBookingError('Please log in to the Paddock Club to book simulator rigs.');
      setBookingStatus('error');
      return;
    }
    if (!selectedTimeSlot) {
      playSound('pit-stop');
      setBookingError('Please select a time slot first.');
      setBookingStatus('error');
      return;
    }
    if (!liabilityAccepted || !privacyAccepted) {
      playSound('pit-stop');
      setBookingError('You must accept the simulator liability waiver and GDPR privacy terms.');
      setBookingStatus('error');
      return;
    }

    setBookingStatus('loading');
    setBookingError('');
    playSound('click');

    try {
      const activeRig = rigsList.find(r => r.id === selectedRigId);
      const res = await fetch('/api/bookings/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          rigId: selectedRigId,
          date: bookingDate,
          timeSlot: selectedTimeSlot,
          price: activeRig ? activeRig.price : 30
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reserve booking.');
      }

      playSound('engine-rev');
      setBookingStatus('success');
      // Mark slot as booked for session
      setBookedSlots(prev => [...prev, `${selectedRigId}-${bookingDate}-${selectedTimeSlot}`]);

      // Simulate telemetry sync for booked session
      setTimeout(async () => {
        try {
          await fetch('/api/telemetry/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              rigId: selectedRigId,
              trackName: 'Spa-Francorchamps',
              carName: activeRig ? activeRig.name : 'Apex Rig',
              lapTimeMs: 104500 + Math.floor(Math.random() * 4000), // ~1:45
              sector1Ms: 31200 + Math.floor(Math.random() * 1000),
              sector2Ms: 44100 + Math.floor(Math.random() * 1000),
              sector3Ms: 29200 + Math.floor(Math.random() * 1000),
              maxSpeedKmh: 318.4 + Math.random() * 10
            })
          });
        } catch (e) {
          console.error('Failed to trigger telemetry sync:', e);
        }
      }, 5000);

    } catch (err: any) {
      playSound('pit-stop');
      setBookingError(err.message || 'Slot locking failed.');
      setBookingStatus('error');
    }
  };

  // Leaderboard logs mapping interactive training success loops
  const [leaderboardScores, setLeaderboardScores] = useState<Array<{ id: string, type: string, score: string, time: string }>>([
    { id: 'HAM-44', type: 'Reaction Start', score: '138 ms', time: 'Sector 1 / Purple' },
    { id: 'MAD-77', type: 'DRS Activation', score: '9.21 Bar', time: 'Sector 2 / Gold' },
    { id: 'LEC-16', type: 'Pit Limiter', score: '+0.12 m', time: 'Sector 3 / Clean' }
  ]);

  // Canvas Reference mapping dynamic live Custom Extraction Pressure charts
  const pressureChartRef = useRef<HTMLCanvasElement>(null);

  // Continuous draw loops of Custom Espresso Extraction Pressure vectors
  useEffect(() => {
    const canvas = pressureChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const drawExtractionTelemetry = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render custom axis line arrays
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 20);
      ctx.lineTo(canvas.width, canvas.height - 20);
      ctx.stroke();

      // Render extraction pressure envelope curve mimicking high speed F1 flow graphs
      ctx.beginPath();
      ctx.strokeStyle = '#E10600';
      ctx.lineWidth = 2.5;
      for (let x = 0; x < canvas.width; x++) {
        // Base profile ramps up fast to 9.2 bar, sustains with minute telemetry variations
        const targetPressureRatio = x < 40 ? (x / 40) : 1.0;
        const baseHeight = canvas.height - 20 - (targetPressureRatio * 50);
        const dynamicHiss = Math.sin(x * 0.15 + offset) * 3 + Math.cos(x * 0.05 - offset * 2) * 1.5;
        const y = baseHeight + (x >= 40 ? dynamicHiss : 0);
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Target pressure corridor overlay lines
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 70);
      ctx.lineTo(canvas.width, canvas.height - 70);
      ctx.stroke();
      ctx.setLineDash([]);

      offset += 0.1;
      animId = requestAnimationFrame(drawExtractionTelemetry);
    };

    drawExtractionTelemetry();
    return () => cancelAnimationFrame(animId);
  }, []);

  // --- CHALLENGE 1 TRIGGER LOGIC ---
  const initiateStartSequence = () => {
    playSound('engine-rev');
    setStartStatus('arming');
    setStartLightsState(0);
    setReactionTimeMs(null);
    setLiveSpeed(0);
    setLiveGear('1');

    // Sequential lighting routine
    let currentLight = 0;
    const interval = setInterval(() => {
      currentLight++;
      setStartLightsState(currentLight);
      playSound('click');

      if (currentLight >= 5) {
        clearInterval(interval);
        // Random wait timer mapping professional FIA standard starter routines
        const randomHold = 600 + Math.random() * 2000;
        sequenceTimerRef.current = setTimeout(() => {
          setStartLightsState(0); // LIGHTS OUT!
          setStartStatus('dropped');
          startTimestampRef.current = performance.now();
          playSound('gear-shift');
        }, randomHold);
      }
    }, 800);
  };

  const executeClutchDrop = () => {
    const clickTime = performance.now();

    if (startStatus === 'arming') {
      // Jumped start! Trigger penalty logic
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
      setStartStatus('penalty');
      playSound('pit-stop');
    } else if (startStatus === 'dropped') {
      // Successful reaction strike
      const reactMs = Math.round(clickTime - startTimestampRef.current);
      setReactionTimeMs(reactMs);
      setStartStatus('success');
      setLiveSpeed(312);
      setLiveGear('8');
      playSound('engine-rev');

      updateUserMetadata({ best_drs_time: `${reactMs} ms` });

      // Append score directly to active custom dynamic sectors list
      setLeaderboardScores(prev => [
        { id: user?.user_metadata?.full_name?.substring(0,8)?.toUpperCase() || 'YOU-P1', type: 'Reaction Launch', score: `${reactMs} ms`, time: 'Sector 1 / Golden' },
        ...prev.slice(0, 4)
      ]);
    }
  };

  // --- CHALLENGE 2: DRS ACTIVATION LOOP ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (challengeMode === 'drs' && drsStatus === 'running') {
      interval = setInterval(() => {
        setDrsCursorPos(prev => {
          if (prev >= 100) {
            setDrsStatus('missed');
            playSound('pit-stop');
            return 0;
          }
          return prev + 1.8;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [challengeMode, drsStatus]);

  const triggerDRSChallenge = () => {
    playSound('click');
    setDrsStatus('running');
    setDrsCursorPos(0);
    setLiveSpeed(325);
    setLiveGear('8');
  };

  const strikeDRSButton = () => {
    // DRS Window is defined explicitly between 65% and 85% graph widths
    if (drsStatus !== 'running') return;
    
    if (drsCursorPos >= 65 && drsCursorPos <= 85) {
      // Perfect extraction strike
      setDrsStatus('success');
      playSound('gear-shift');
      setLiveSpeed(345); // Dynamic drag bypass acceleration
      const computedScore = 9.2 + (Math.random() * 0.08);
      setDrsPressureScore(computedScore);

      updateUserMetadata({ best_drs_time: `${computedScore.toFixed(2)} Bar` });

      setLeaderboardScores(prev => [
        { id: user?.user_metadata?.full_name?.substring(0,8)?.toUpperCase() || 'YOU-DRS', type: 'DRS Engagement', score: `${computedScore.toFixed(2)} Bar`, time: 'Sector 2 / Golden' },
        ...prev.slice(0, 4)
      ]);
    } else {
      setDrsStatus('missed');
      playSound('pit-stop');
    }
  };

  // --- CHALLENGE 3: PIT LIMITER LOOP ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (challengeMode === 'pit' && pitStatus === 'approaching') {
      interval = setInterval(() => {
        setPitApproachDist(prev => {
          if (prev <= 0) {
            setPitStatus('speeding');
            playSound('pit-stop');
            return 0;
          }
          return prev - 2.5;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [challengeMode, pitStatus]);

  const triggerPitApproachChallenge = () => {
    playSound('engine-rev');
    setPitStatus('approaching');
    setPitApproachDist(150);
    setLiveSpeed(295);
    setLiveGear('7');
  };

  const strikePitLimiterButton = () => {
    if (pitStatus !== 'approaching') return;
    
    // Pit Line Boundary defined precisely between 10m and 30m remaining distance
    if (pitApproachDist >= 10 && pitApproachDist <= 30) {
      setPitStatus('locked');
      playSound('gear-shift');
      setLiveSpeed(80);
      setLiveGear('3');
      const offsetMeters = parseFloat((20 - pitApproachDist).toFixed(2));
      setPitPrecisionMeters(offsetMeters);

      setLeaderboardScores(prev => [
        { id: 'YOU-PIT', type: 'Speed Trap', score: `${offsetMeters > 0 ? '+' : ''}${offsetMeters} m`, time: 'Sector 3 / Golden' },
        ...prev.slice(0, 4)
      ]);
    } else {
      setPitStatus('speeding');
      playSound('pit-stop');
    }
  };

  // Synchronize steering wheel clicks directly to trigger game inputs if available
  const handlePhysicalButtonMap = (id: string) => {
    setActiveButton(id);
    if (challengeMode === 'drs' && id.toLowerCase() === 'drs') {
      strikeDRSButton();
    } else if (challengeMode === 'pit' && id.toLowerCase() === 'pl') {
      strikePitLimiterButton();
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 md:px-8 bg-carbon-black transition-colors duration-1000 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-racing-red/5 skew-x-[-15deg] pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-racing-red animate-pulse" />
              <span className="font-orbitron text-[9px] md:text-[10px] font-black tracking-[0.4em] text-racing-red uppercase">
                Mercedes / Ferrari Style Garage Telemetry Software
              </span>
            </div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">
              APEX RACING <span className="text-racing-red">ACADEMY</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-between md:justify-end">
             <button 
               onClick={() => { setIsRainMode(!isRainMode); playSound('click'); }} 
               className={`glass px-4 py-2.5 rounded-lg border text-[10px] font-orbitron font-black tracking-widest uppercase italic transition-all flex items-center gap-2 ${
                 isRainMode ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'text-white/40 hover:text-white border-white/5'
               }`}
             >
               <CloudRain size={14} /> <span>WET SIM</span>
             </button>
             <button 
               onClick={() => { setIsNightMode(!isNightMode); playSound('click'); }} 
               className={`glass px-4 py-2.5 rounded-lg border text-[10px] font-orbitron font-black tracking-widest uppercase italic transition-all flex items-center gap-2 ${
                 isNightMode ? 'bg-racing-red/20 border-racing-red text-racing-red' : 'text-white/40 hover:text-white border-white/5'
               }`}
             >
               {isNightMode ? <Moon size={14} /> : <Sun size={14} />} <span>{isNightMode ? 'NIGHT' : 'DAY'}</span>
             </button>
          </div>
        </div>

        {/* TOP LAYOUT: THREE.JS MONOCOQUE COCKPIT PREVIEW */}
        <div className="relative w-full aspect-[16/8] md:aspect-[16/7] glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 z-10">
            <Canvas shadows dpr={[1, 2]}>
              <PerspectiveCamera makeDefault position={[0, 0.4, 2.2]} fov={55} />
              
              <ambientLight intensity={0.5} />
              <spotLight position={[0, 5, 5]} intensity={120} angle={0.5} penumbra={1} castShadow />
              <pointLight position={[-3, 2, 2]} color="#3b82f6" intensity={80} />
              <pointLight position={[3, 2, 2]} color="#E10600" intensity={80} />
              
              <Suspense fallback={null}>
                <Environment preset="city" />
                <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.15}>
                   <SteeringWheelModel 
                     activeButton={activeButton} 
                     setActiveButton={handlePhysicalButtonMap} 
                     isRainMode={isRainMode}
                     liveSpeed={liveSpeed}
                     liveGear={liveGear}
                   />
                </Float>
                <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
              </Suspense>

              <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.6} minPolarAngle={Math.PI / 2.5} makeDefault />

              <EffectComposer enableNormalPass={false}>
                <Bloom luminanceThreshold={1.8} intensity={0.25} levels={9} mipmapBlur />
                <Noise opacity={0.02} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
                <ChromaticAberration offset={new THREE.Vector2(0.0003, 0.0003)} />
              </EffectComposer>
            </Canvas>
          </div>

          {/* Core Dashboard UI Overlays */}
          <div className="absolute inset-0 z-20 pointer-events-none p-4 md:p-8 flex flex-col justify-between">
             <div className="flex justify-between items-start">
                <div className="glass px-3 py-1.5 rounded border border-white/5 backdrop-blur-md">
                  <span className="font-orbitron text-[9px] font-black text-white/40 block">TARGET HYDRAULIC PRESSURE</span>
                  <span className="font-mono text-xs font-bold text-green-400">9.2 BAR EXACT</span>
                </div>
                <div className="glass px-3 py-1.5 rounded text-right border-l-[3px] border-pit-yellow backdrop-blur-md">
                   <span className="text-[8px] font-orbitron text-white/50 block">CHASSIS PROFILE</span>
                   <span className="font-orbitron text-[10px] font-black text-pit-yellow">SAUBER C37 REPLICA</span>
                </div>
             </div>
          </div>
        </div>

        {/* BOTTOM LAYOUT: PLAYABLE INTERACTIVE DRIVER TRAINING TERMINALS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Block: Game Modes & Challenge Terminal Console */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Custom Tab Selectors specifically targeting mini games */}
            <div className="glass p-1.5 rounded-xl border border-white/5 flex gap-1 bg-black/40">
              {[
                { id: 'start', label: '1. START SEQUENCE', icon: Flame },
                { id: 'drs', label: '2. DRS TIMING CHALLENGE', icon: Zap },
                { id: 'pit', label: '3. PIT LIMITER APPROACH', icon: Target }
              ].map((tab) => {
                const isActive = challengeMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setChallengeMode(tab.id as any); playSound('click'); }}
                    className={`flex-1 py-3 px-2 rounded-lg font-orbitron text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                      isActive 
                        ? 'bg-racing-red text-white shadow-[0_0_15px_rgba(225,6,0,0.3)]' 
                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={12} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="inline sm:hidden">{tab.label.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* DYNAMIC CHALLENGE WORKSPACE NODES */}
            <div className="glass p-6 rounded-2xl border border-white/10 min-h-[300px] flex flex-col justify-between relative overflow-hidden bg-black/60">
              
              {/* GAME 1: START SEQUENCE */}
              {challengeMode === 'start' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="text-center space-y-1">
                    <span className="font-orbitron text-[9px] font-bold text-white/40 tracking-widest uppercase block">
                      REACTION LAUNCH INITIATION SEQUENCE
                    </span>
                    <p className="text-xs font-mono text-white/60 max-w-md mx-auto">
                      Wait for all 5 red grid lights to arm. Strike the launcher button the absolute millisecond the lights extinguish!
                    </p>
                  </div>

                  {/* 5 Classic Red Lights Visualizer base */}
                  <div className="glass p-4 rounded-xl border border-white/5 flex justify-center items-center gap-3 sm:gap-6 max-w-md mx-auto w-full bg-black/80">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const isLit = startLightsState > idx;
                      return (
                        <div key={idx} className="space-y-2 text-center">
                          <div 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/10 mx-auto transition-all duration-75 relative flex items-center justify-center"
                            style={{
                              backgroundColor: isLit ? '#E10600' : '#111',
                              boxShadow: isLit ? '0 0 25px #E10600, inset 0 0 10px #ffaaaa' : 'none'
                            }}
                          >
                            <div className="w-1/2 h-1/2 rounded-full bg-white/10 top-1 absolute" />
                          </div>
                          <span className="font-mono text-[8px] text-white/30 block">G{idx+1}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status feedback announcements */}
                  <div className="text-center h-8 flex items-center justify-center">
                    {startStatus === 'arming' && <span className="font-orbitron text-xs font-bold text-pit-yellow tracking-widest uppercase animate-pulse">ARMING GRID LIGHTS... DO NOT JUMP</span>}
                    {startStatus === 'dropped' && <span className="font-orbitron text-sm font-black text-green-400 tracking-[0.3em] uppercase animate-bounce">✦✦ STRIKE CLUTCH NOW ✦✦</span>}
                    {startStatus === 'penalty' && <span className="font-orbitron text-xs font-black text-racing-red tracking-widest uppercase flex items-center gap-1"><AlertTriangle size={12} /> FALSE START PENALTY RECORDED</span>}
                    {startStatus === 'success' && (
                      <span className="font-orbitron text-sm font-black text-white tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-green-400" /> 
                        REACTION SPEED: <span className="text-green-400">{reactionTimeMs} MS</span>
                      </span>
                    )}
                  </div>

                  {/* Main Action Controllers */}
                  <div className="flex gap-3 max-w-md mx-auto w-full">
                    {startStatus === 'idle' || startStatus === 'penalty' || startStatus === 'success' ? (
                      <button onClick={initiateStartSequence} className="btn-racing w-full !py-3 flex items-center justify-center gap-2 text-xs tracking-widest">
                        <Play size={14} /> <span>ARM FIVE RED LIGHTS</span>
                      </button>
                    ) : (
                      <button 
                        onClick={executeClutchDrop} 
                        className={`w-full py-4 rounded-xl font-orbitron font-black text-xs tracking-widest uppercase transition-all shadow-2xl ${
                          startStatus === 'dropped' 
                            ? 'bg-green-500 hover:bg-green-400 text-black scale-105 shadow-[0_0_30px_rgba(34,197,94,0.5)]' 
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        <span>DROP CLUTCH / LAUNCH CHASSIS</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* GAME 2: DRS ACTIVATION CHALLENGE */}
              {challengeMode === 'drs' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="text-center space-y-1">
                    <span className="font-orbitron text-[9px] font-bold text-white/40 tracking-widest uppercase block">
                      DRAG REDUCTION SYSTEM ENGAGEMENT
                    </span>
                    <p className="text-xs font-mono text-white/60 max-w-md mx-auto">
                      Strike the green DRS trigger exactly when the moving high-speed telemetry pulse crosses inside the Green target window bounds!
                    </p>
                  </div>

                  {/* Horizontal DRS target corridor bar visualizer */}
                  <div className="space-y-2 max-w-lg mx-auto w-full">
                    <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
                      <span>CHASSIS TRAJECTORY</span>
                      <span className="text-green-400">ACTIVE DRS WINDOW (65% - 85%)</span>
                    </div>
                    
                    <div className="w-full h-12 glass rounded-xl border border-white/5 relative overflow-hidden p-1 bg-black/80 flex items-center">
                      {/* Active green boundaries overlay bounds */}
                      <div className="absolute left-[65%] w-[20%] h-full bg-green-500/20 border-l border-r border-green-500/40 flex items-center justify-center">
                        <span className="font-orbitron text-[7px] font-black tracking-widest text-green-400 uppercase opacity-60">TARGET</span>
                      </div>

                      {/* Moving high speed interactive scan cursor */}
                      <div 
                        className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_15px_#ffffff] transition-all duration-75"
                        style={{ left: `${drsCursorPos}%` }}
                      />
                    </div>
                  </div>

                  {/* Status announcements */}
                  <div className="text-center h-8 flex items-center justify-center">
                    {drsStatus === 'running' && <span className="font-orbitron text-xs font-bold text-white/60 tracking-widest uppercase">SWEEPING SECTOR TRAIL...</span>}
                    {drsStatus === 'missed' && <span className="font-orbitron text-xs font-black text-racing-red tracking-widest uppercase flex items-center gap-1"><AlertTriangle size={12} /> MISSED EXTRACTION CORRIDOR</span>}
                    {drsStatus === 'success' && (
                      <span className="font-orbitron text-xs font-black text-green-400 tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={14} /> DRS ENGAGED AT OPTIMAL BREW PRESSURE: {drsPressureScore.toFixed(2)} BAR
                      </span>
                    )}
                  </div>

                  {/* Controllers */}
                  <div className="flex gap-3 max-w-md mx-auto w-full">
                    {drsStatus !== 'running' ? (
                      <button onClick={triggerDRSChallenge} className="btn-racing w-full !py-3 flex items-center justify-center gap-2 text-xs tracking-widest">
                        <RotateCcw size={14} /> <span>LAUNCH TELEMETRY PULSE</span>
                      </button>
                    ) : (
                      <button onClick={strikeDRSButton} className="w-full bg-green-500 hover:bg-green-400 text-black font-orbitron font-black text-xs tracking-widest py-3 rounded-xl uppercase transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <span>STRIKE DRS BUTTON NOW</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* GAME 3: PIT LIMITER TARGET APPROACH */}
              {challengeMode === 'pit' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="text-center space-y-1">
                    <span className="font-orbitron text-[9px] font-bold text-white/40 tracking-widest uppercase block">
                      SPEED TRAP BRAKING PRECISION
                    </span>
                    <p className="text-xs font-mono text-white/60 max-w-md mx-auto">
                      Approaching pit entry at 295 km/h. Strike the Red Pit Limiter (PL) switch precisely over the white track marker line!
                    </p>
                  </div>

                  {/* Vertical approach track gauge */}
                  <div className="space-y-2 max-w-lg mx-auto w-full">
                    <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
                      <span>DISTANCE TO ENTRY TRAP</span>
                      <span>{pitApproachDist.toFixed(0)} METERS REMAINING</span>
                    </div>

                    <div className="w-full h-12 glass rounded-xl border border-white/5 relative overflow-hidden bg-black/80 flex items-center">
                      {/* Entry trap marker */}
                      <div className="absolute left-[80%] w-1 h-full bg-white z-10 shadow-[0_0_10px_#ffffff]" />
                      <span className="absolute left-[82%] text-[7px] font-orbitron font-black text-white/40 tracking-tighter">LINE</span>

                      {/* Speeding car icon marker approaching */}
                      <div 
                        className="absolute h-6 w-10 glass rounded bg-racing-red flex items-center justify-center transition-all duration-75 text-[8px] font-orbitron font-black"
                        style={{ left: `${((150 - pitApproachDist) / 150) * 80}%` }}
                      >
                        C37
                      </div>
                    </div>
                  </div>

                  {/* Status base */}
                  <div className="text-center h-8 flex items-center justify-center">
                    {pitStatus === 'approaching' && <span className="font-orbitron text-xs font-bold text-pit-yellow tracking-widest uppercase animate-pulse">APPROACHING SPEED TRAP AT 295 KM/H...</span>}
                    {pitStatus === 'speeding' && <span className="font-orbitron text-xs font-black text-racing-red tracking-widest uppercase flex items-center gap-1"><AlertTriangle size={12} /> SPEEDING IN PIT LANE PENALTY</span>}
                    {pitStatus === 'locked' && (
                      <span className="font-orbitron text-xs font-black text-green-400 tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={14} /> SPEED TRAP LOCKED AT 80 KM/H ({pitPrecisionMeters > 0 ? `+${pitPrecisionMeters}` : pitPrecisionMeters}m DELTA)
                      </span>
                    )}
                  </div>

                  {/* Controllers */}
                  <div className="flex gap-3 max-w-md mx-auto w-full">
                    {pitStatus !== 'approaching' ? (
                      <button onClick={triggerPitApproachChallenge} className="btn-racing w-full !py-3 flex items-center justify-center gap-2 text-xs tracking-widest">
                        <Play size={14} /> <span>SIMULATE PIT APPROACH</span>
                      </button>
                    ) : (
                      <button onClick={strikePitLimiterButton} className="w-full bg-racing-red hover:bg-red-600 text-white font-orbitron font-black text-xs tracking-widest py-3 rounded-xl uppercase transition-all shadow-[0_0_20px_rgba(225,6,0,0.4)]">
                        <span>STRIKE PIT LIMITER (PL) NOW</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Block: Live Custom Extraction Charts & Leaderboard Sector Logs */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Live Custom Espresso Extraction Pressure Line Chart rendering smooth custom HTML5 canvas vectors */}
            <div className="glass p-4 rounded-2xl border border-white/5 space-y-2 bg-black/40">
              <div className="flex justify-between items-center">
                <span className="font-orbitron text-[9px] font-black text-white/40 tracking-widest uppercase flex items-center gap-1.5">
                  <Gauge size={12} className="text-racing-red" /> LIVE EXTRACTION PRESSURE
                </span>
                <span className="font-mono text-[9px] text-green-400 font-bold">9.2 BAR TARGET</span>
              </div>
              
              <div className="w-full h-28 bg-black/80 rounded-xl border border-white/5 overflow-hidden p-1.5 relative">
                <canvas ref={pressureChartRef} width={220} height={100} className="w-full h-full block" />
                <span className="absolute bottom-1 right-2 text-[6px] font-mono text-white/20 uppercase tracking-widest">TIME VECTOR (S)</span>
              </div>
            </div>

            {/* Micro Leaderboard Logs */}
            <div className="glass p-4 rounded-2xl border border-white/5 space-y-3 bg-black/40">
              <span className="font-orbitron text-[9px] font-black text-white/40 tracking-widest uppercase flex items-center gap-1.5">
                <Trophy size={12} className="text-pit-yellow" /> LIVE TELEMETRY SECTORS
              </span>

              <div className="space-y-2">
                {leaderboardScores.map((score, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="font-orbitron text-[9px] font-black text-white block">{score.id}</span>
                      <span className="text-[8px] text-white/40">{score.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-orbitron font-black text-[11px] text-pit-yellow block">{score.score}</span>
                      <span className="text-[8px] text-green-400">{score.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>

        {/* APEX SIMULATOR RIG BOOKINGS & LIVE SCHEDULER */}
        <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 space-y-8 bg-black/40 relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-racing-red/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
            <div className="space-y-2">
              <span className="font-orbitron text-[9px] font-black text-racing-red tracking-[0.4em] uppercase block">
                INTEGRATED BOOKING TELEMETRY ENGINE
              </span>
              <h2 className="font-orbitron text-2xl md:text-3xl font-black italic text-white uppercase tracking-tight">
                RESERVE YOUR APEX <span className="text-racing-red">SIM RIG</span>
              </h2>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
              Live Slot Allocation & Payment Processing
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1: Rig Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-racing-red/20 text-racing-red border border-racing-red flex items-center justify-center font-orbitron text-[10px] font-black">1</span>
                <span className="font-orbitron text-[10px] font-black text-white uppercase tracking-wider">SELECT SIMULATOR CONFIG</span>
              </div>
              <div className="space-y-3">
                {rigsList.map(rig => {
                  const isSelected = selectedRigId === rig.id;
                  return (
                    <div 
                      key={rig.id} 
                      onClick={() => { setSelectedRigId(rig.id); playSound('click'); }}
                      className={`glass p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${isSelected ? 'border-racing-red/50 bg-racing-red/5' : 'border-white/5 hover:bg-white/5'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-orbitron text-xs font-black text-white group-hover:text-racing-red transition-colors uppercase">{rig.name}</h4>
                          <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider">{rig.type}</span>
                        </div>
                        <span className="font-orbitron font-black text-sm text-racing-red">€{rig.price}/h</span>
                      </div>
                      <p className="text-[9px] text-white/50 font-mono mt-3 leading-relaxed">{rig.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date & Slot Calendar */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-racing-red/20 text-racing-red border border-racing-red flex items-center justify-center font-orbitron text-[10px] font-black">2</span>
                <span className="font-orbitron text-[10px] font-black text-white uppercase tracking-wider">CHOOSE SCHEDULING SLOT</span>
              </div>
              
              {/* Date Options Row */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {dateOptions.map(opt => {
                  const isSelected = bookingDate === opt.formatted;
                  return (
                    <button
                      key={opt.formatted}
                      onClick={() => { setBookingDate(opt.formatted); playSound('click'); }}
                      className={`flex-1 min-w-[85px] py-2 px-3 rounded-lg border transition-all skew-x-[-10deg] ${isSelected ? 'bg-racing-red border-racing-red text-white' : 'glass border-white/5 text-white/40 hover:text-white'}`}
                    >
                      <div className="skew-x-[10deg] text-center">
                        <span className="block font-orbitron text-[8px] font-black tracking-widest">{opt.displayDay.toUpperCase()}</span>
                        <span className="block text-[10px] font-mono font-bold mt-0.5">{opt.displayDate}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                {timeSlots.map(slot => {
                  const isBooked = bookedSlots.includes(`${selectedRigId}-${bookingDate}-${slot}`);
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={isBooked}
                      onClick={() => { setSelectedTimeSlot(slot); playSound('click'); }}
                      className={`py-3 rounded-lg border font-mono text-xs tracking-wider transition-all skew-x-[-5deg] ${
                        isBooked 
                          ? 'bg-white/5 border-white/5 text-white/10 cursor-not-allowed line-through' 
                          : isSelected 
                            ? 'bg-racing-red border-racing-red text-white shadow-[0_0_15px_rgba(225,6,0,0.3)]' 
                            : 'glass border-white/5 text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="skew-x-[5deg] block">{slot} {isBooked ? '(LOCKED)' : ''}</span>
                    </button>
                  );
                })}
              </div>

              {/* Legal and Waivers Agreement Section */}
              <div className="glass p-4 rounded-xl border border-white/5 bg-black/60 space-y-3 mt-4">
                <div className="flex items-start gap-2.5">
                  <input 
                    type="checkbox" 
                    id="liability-check" 
                    checked={liabilityAccepted}
                    onChange={(e) => { setLiabilityAccepted(e.target.checked); playSound('click'); }}
                    className="mt-1 cursor-pointer accent-racing-red"
                  />
                  <label htmlFor="liability-check" className="text-[9px] text-white/60 font-mono leading-relaxed cursor-pointer select-none">
                    [MANDATORY] I understand and agree to the <span className="text-racing-red">Simulator Liability Waiver</span>. I acknowledge that operating full-motion high-fidelity equipment entails physical risks, and I verify that I have no disqualifying medical conditions.
                  </label>
                </div>
                <div className="flex items-start gap-2.5">
                  <input 
                    type="checkbox" 
                    id="privacy-check" 
                    checked={privacyAccepted}
                    onChange={(e) => { setPrivacyAccepted(e.target.checked); playSound('click'); }}
                    className="mt-1 cursor-pointer accent-racing-red"
                  />
                  <label htmlFor="privacy-check" className="text-[9px] text-white/60 font-mono leading-relaxed cursor-pointer select-none">
                    [GDPR CONSENT] I authorize CoffeeXF1 to record my live telemetry logs, lap records, and racing achievements, linking them to my Paddock Club membership.
                  </label>
                </div>
              </div>

              {/* Booking submit engine trigger */}
              <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[9px] text-white/40 font-orbitron uppercase tracking-widest block">SESSION QUOTE</span>
                  <span className="font-orbitron text-xl font-black text-white italic">
                    €{(rigsList.find(r => r.id === selectedRigId)?.price || 30).toFixed(2)}
                  </span>
                </div>

                <div className="w-full sm:w-auto flex flex-col items-end gap-2">
                  <button
                    onClick={handleBookSlot}
                    disabled={bookingStatus === 'loading'}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-orbitron font-black text-xs tracking-widest uppercase transition-all skew-x-[-15deg] ${
                      bookingStatus === 'loading'
                        ? 'bg-white/10 text-white/40 cursor-wait'
                        : 'bg-racing-red hover:bg-white text-white hover:text-black shadow-[0_0_20px_rgba(225,6,0,0.4)]'
                    }`}
                  >
                    <span className="skew-x-[15deg] block">LOCK SIMULATOR BAY</span>
                  </button>
                  
                  {bookingStatus === 'success' && (
                    <span className="text-[9px] text-green-400 font-mono tracking-widest uppercase animate-pulse">
                      ✦ TELEMETRY SLOT LOCKED. PREPARING RIG ✦
                    </span>
                  )}
                  {bookingStatus === 'error' && (
                    <span className="text-[9px] text-racing-red font-mono tracking-widest uppercase">
                      ⚠️ {bookingError}
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
