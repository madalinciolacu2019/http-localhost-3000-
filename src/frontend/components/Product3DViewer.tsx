'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { useSound } from '@/frontend/context/SoundContext';
import { Maximize2, RotateCw } from 'lucide-react';

interface ModelProps {
  category: string;
  color: string;
}

// 3D Geometry representations of items
function ProductModel({ category, color }: ModelProps) {
  const isApparel = ['merchandise', 'apparel', 'gear'].some(k => category.toLowerCase().includes(k));
  const hexColor = color === 'red' ? '#E10600' : color === 'yellow' ? '#FFD700' : color === 'blue' ? '#007FFF' : '#38383F';

  if (isApparel) {
    // Render an F1 Team Box / Card model
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 2.2, 0.4]} />
        <meshPhysicalMaterial 
          color={hexColor} 
          roughness={0.2} 
          metalness={0.8} 
          clearcoat={0.5}
        />
      </mesh>
    );
  }

  // Otherwise, render a Coffee Cup / Mug geometry
  return (
    <group>
      {/* Mug Body */}
      <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 1.4, 32]} />
        <meshStandardMaterial color={hexColor} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Mug Handle */}
      <mesh castShadow receiveShadow position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.35, 0.08, 16, 100]} />
        <meshStandardMaterial color={hexColor} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Liquid interior */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.05, 32]} />
        <meshStandardMaterial color="#4A2E1B" roughness={0.1} />
      </mesh>
    </group>
  );
}

interface Product3DViewerProps {
  category: string;
  color: string;
  name: string;
}

export default function Product3DViewer({ category, color, name }: Product3DViewerProps) {
  const { playSound } = useSound();
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  const handleInteraction = () => {
    playSound('click');
  };

  return (
    <div className="w-full aspect-square relative glass rounded-2xl overflow-hidden border-white/5 flex items-center justify-center bg-black/40 group">
      {/* HUD overlays */}
      <div className="absolute top-4 left-4 z-10">
        <span className="font-orbitron text-[8px] font-black uppercase tracking-widest text-racing-red bg-racing-red/10 border border-racing-red/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
          <RotateCw size={10} className="animate-spin" style={{ animationDuration: '4s' }} />
          <span>Interactive 3D Preview</span>
        </span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="font-orbitron text-[8px] font-black uppercase tracking-widest text-white/40 bg-white/5 border border-white/10 px-2 py-1 rounded flex items-center gap-1">
          <Maximize2 size={10} />
          <span>Drag to Rotate</span>
        </span>
      </div>

      {hasWebGL ? (
        <div className="w-full h-full" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
          <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Suspense fallback={null}>
              <Center>
                <ProductModel category={category} color={color} />
              </Center>
              <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.5}
              />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <div className="text-center p-6 space-y-2">
          <span className="font-orbitron text-[10px] font-bold text-white/30 uppercase tracking-widest">3D Telemetry Offline</span>
          <p className="text-[9px] text-white/20 uppercase tracking-wider max-w-[200px]">WebGL is disabled or unsupported in this engine cockpit.</p>
        </div>
      )}
    </div>
  );
}
