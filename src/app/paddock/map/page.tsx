'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Html, Text, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, Wind, Thermometer, Radio } from 'lucide-react';
import Link from 'next/link';
import { useSound } from '@/context/SoundContext';

const tracks = [
  { id: 1, name: 'Monaco', lat: 43.7347, lon: 7.4206, image: '/assets/tracks/monaco.png', temp: '22°C', wind: '12 km/h' },
  { id: 2, name: 'Silverstone', lat: 52.0786, lon: -1.0169, image: '/assets/tracks/silverstone.png', temp: '18°C', wind: '24 km/h' },
  { id: 3, name: 'Spa', lat: 50.4372, lon: 5.9714, image: '/assets/tracks/spa.png', temp: '16°C', wind: '18 km/h' },
  { id: 4, name: 'Monza', lat: 45.6156, lon: 9.2811, image: '/assets/tracks/monza.png', temp: '24°C', wind: '8 km/h' },
  { id: 5, name: 'Suzuka', lat: 34.8431, lon: 136.5411, image: '/assets/tracks/suzuka.png', temp: '20°C', wind: '15 km/h' },
  { id: 6, name: 'Imola', lat: 44.3439, lon: 11.7167, image: '/assets/tracks/imola.png', temp: '21°C', wind: '10 km/h' },
];

// Helper to convert lat/lon to 3D coordinates
const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

const Globe = ({ onSelectTrack }: { onSelectTrack: (track: any) => void }) => {
  const globeRef = useRef<THREE.Group>(null);
  const { playSound } = useSound();

  // Create a techy points-based globe
  const points = useMemo(() => {
    const pts = [];
    const radius = 2.5;
    for (let i = 0; i < 5000; i++) {
      const phi = Math.acos(-1 + (2 * i) / 5000);
      const theta = Math.sqrt(5000 * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Base Sphere for depth */}
      <mesh>
        <sphereGeometry args={[2.48, 64, 64]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.5} />
      </mesh>

      {/* Tech Grid Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
            args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#333" transparent opacity={0.3} sizeAttenuation={true} />
      </points>

      {/* Active Track Markers */}
      {tracks.map((track) => {
        const pos = latLonToVector3(track.lat, track.lon, 2.5);
        return (
          <group key={track.id} position={pos}>
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                onSelectTrack(track);
                playSound('click');
              }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#E10600" />
            </mesh>
            <mesh scale={[1.2, 1.2, 1.2]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#E10600" transparent opacity={0.2} />
            </mesh>
            {/* Pulse effect */}
            <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
              <mesh>
                <ringGeometry args={[0.15, 0.17, 32]} />
                <meshBasicMaterial color="#E10600" transparent opacity={0.4} side={THREE.DoubleSide} />
              </mesh>
            </Float>
          </group>
        );
      })}
    </group>
  );
};

const TrackDetail = ({ track, onClose }: { track: any; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="absolute top-1/2 -translate-y-1/2 right-12 w-96 glass p-0 rounded-3xl overflow-hidden border-racing-red/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20"
    >
      <div className="relative aspect-video">
        <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-black via-transparent to-transparent" />
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-racing-red transition-colors"
        >
          <ChevronLeft className="rotate-180" size={16} />
        </button>
      </div>
      
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2 text-racing-red font-orbitron text-[10px] font-black tracking-[0.3em]">
          <div className="w-2 h-2 rounded-full bg-racing-red animate-pulse" />
          LIVE TELEMETRY
        </div>
        <h2 className="font-orbitron text-4xl font-black mb-6 italic">{track.name}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-4 rounded-xl border-white/5">
            <div className="flex items-center gap-2 text-white/30 mb-1">
              <Thermometer size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Air Temp</span>
            </div>
            <div className="font-orbitron text-sm font-bold">{track.temp}</div>
          </div>
          <div className="glass p-4 rounded-xl border-white/5">
            <div className="flex items-center gap-2 text-white/30 mb-1">
              <Wind size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Wind Speed</span>
            </div>
            <div className="font-orbitron text-sm font-bold">{track.wind}</div>
          </div>
        </div>

        <button className="w-full mt-8 btn-racing py-4 !text-xs">
          VIEW FULL TRACK PROFILE
        </button>
      </div>
    </motion.div>
  );
};

const GlobalMapPage = () => {
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const { playSound } = useSound();

  return (
    <main className="h-screen w-screen bg-carbon-black overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,6,0,0.05),transparent)] pointer-events-none" />
      
      {/* UI Header */}
      <div className="absolute top-12 left-12 z-20">
        <Link 
          href="/paddock/tracks" 
          className="flex items-center gap-4 text-white/40 hover:text-white transition-colors group mb-8 no-underline"
          onClick={() => playSound('click')}
        >
          <div className="p-3 glass rounded-full group-hover:bg-racing-red transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="font-orbitron text-xs font-bold tracking-[0.3em]">BACK TO GRID</span>
        </Link>
        <h1 className="font-orbitron text-6xl font-black italic tracking-tighter">GLOBAL<br/>TELEMETRY</h1>
        <p className="text-white/20 text-xs font-orbitron tracking-[0.4em] mt-4 uppercase">Real-time track synchronization active</p>
      </div>

      {/* System Status */}
      <div className="absolute bottom-12 left-12 z-20 space-y-4">
        <div className="flex items-center gap-4 glass px-6 py-4 rounded-xl border-racing-red/20">
          <Radio size={20} className="text-racing-red animate-pulse" />
          <div>
            <div className="text-[8px] font-black text-racing-red uppercase tracking-widest">Connection Status</div>
            <div className="font-orbitron text-[10px] font-bold">SATELLITE LINK STABLE</div>
          </div>
        </div>
      </div>

      {/* Canvas for 3D Globe */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Suspense fallback={null}>
            <Globe onSelectTrack={setSelectedTrack} />
            <Environment preset="night" />
            <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
          </Suspense>
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={12}
            autoRotate={!selectedTrack}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Track Overlay */}
      <AnimatePresence>
        {selectedTrack && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrack(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-15"
            />
            <TrackDetail track={selectedTrack} onClose={() => setSelectedTrack(null)} />
          </>
        )}
      </AnimatePresence>

      {/* HUD Scanner Effect */}
      <div className="absolute inset-0 pointer-events-none border-[40px] border-transparent border-t-white/5 border-b-white/5 opacity-50" />
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 shadow-[0_0_20px_white]" />
    </main>
  );
};

export default GlobalMapPage;
