'use client';

import React, { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  useGLTF, 
  PerspectiveCamera, 
  OrbitControls, 
  Environment, 
  Float, 
  ContactShadows, 
  Html 
} from '@react-three/drei';

// Preload asset bundle geometry eagerly
useGLTF.preload('/models/f1-car.glb');

const CanvasLoadingFallback = () => (
  <Html center className="pointer-events-none">
    <div className="flex flex-col items-center gap-2.5 p-4 glass rounded-2xl border border-racing-red/30 bg-black/90 backdrop-blur-xl whitespace-nowrap shadow-[0_0_30px_rgba(225,6,0,0.4)]">
      <div className="w-6 h-6 border-2 border-racing-red border-t-transparent rounded-full animate-spin" />
      <span className="font-orbitron text-[9px] font-black text-racing-red tracking-[0.2em] uppercase animate-pulse">
        Preloading 3D F1 Telemetry...
      </span>
      <span className="text-[7px] font-mono text-white/40 block -mt-1">
        Streaming complex mesh chassis
      </span>
    </div>
  </Html>
);

const CarModelMesh = ({ scale = 0.2, positionY = -0.4 }: { scale: number; positionY: number }) => {
  const { scene } = useGLTF('/models/f1-car.glb');
  const carRef = useRef<THREE.Group>(null);
  
  const alfaScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.name.toLowerCase().includes('body') || mesh.name.toLowerCase().includes('chassis')) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#D20A0A', // Vibrant Alfa Racing Red ensuring high saturation on all mobile GPUs
            metalness: 0.75,
            roughness: 0.25,
          });
        } else if (mesh.name.toLowerCase().includes('wing') || mesh.name.toLowerCase().includes('detail')) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#FFFFFF', // High-contrast Sauber White
            metalness: 0.4,
            roughness: 0.3,
          });
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (carRef.current) {
      carRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <primitive 
      ref={carRef}
      object={alfaScene} 
      scale={scale} 
      position={[0, positionY, 0]} 
      rotation={[0, -Math.PI / 4, 0]}
    />
  );
};

export default function Hero3DWrapper() {
  const [fov, setFov] = useState(35);
  const [scale, setScale] = useState(0.2);
  const [positionY, setPositionY] = useState(-0.4);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setFov(isMobile ? 55 : 35);
      setScale(isMobile ? 0.16 : 0.2);
      setPositionY(isMobile ? -0.4 : -0.4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Canvas 
      dpr={[1, 1.5]} 
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}
      className="absolute inset-0 z-10 w-full h-full" 
      shadows
      gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
    >
      <PerspectiveCamera makeDefault position={[0, 1, 7]} fov={fov} />
      
      {/* 100% Fully Localized High-Performance Multi-Angle Studio Lighting */}
      {/* Bypasses remote Github CDN Drei cubemap loading timeouts that freeze mobile WebGL context initialization */}
      <ambientLight intensity={2.5} />
      <directionalLight position={[10, 10, 10]} intensity={3.5} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={1.5} />
      <directionalLight position={[0, 5, 10]} intensity={2.5} />
      <directionalLight position={[0, -5, -10]} intensity={1.0} />
      <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={3} castShadow />
      
      <Suspense fallback={<CanvasLoadingFallback />}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <CarModelMesh scale={scale} positionY={positionY} />
        </Float>
        <ContactShadows opacity={0.6} scale={15} blur={2.5} far={1.5} color="#000000" />
      </Suspense>

      <OrbitControls 
        enableZoom={false} 
        enableDamping={true}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
}
