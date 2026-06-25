import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, RoundedBox, Html } from '@react-three/drei';
import { useSound } from '@/context/SoundContext';

// --- PERFORMANCE RAIN DROPLETS ---
export const RainDroplets = () => {
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
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} args={[points, 3] as any} />
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
export const SteeringWheelModel = ({ 
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
