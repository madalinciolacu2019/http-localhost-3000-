'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows, Text, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface BlendCustomizer3DProps {
  force: number; // 8.0 to 12.0
  heat: number;  // 85.0 to 98.0
}

function CoffeeBagMesh({ force, heat }: BlendCustomizer3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation based on time and force
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
    
    if (coreRef.current) {
      // Core pulses based on heat
      const pulse = Math.sin(state.clock.elapsedTime * (heat - 80) * 0.2) * 0.1 + 0.9;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  // Calculate colors based on heat and force
  // Higher heat = redder, lower heat = bluer
  // Higher force = more emissive glow
  
  const heatRatio = (heat - 85) / 13; // 0 to 1
  const forceRatio = (force - 8) / 4; // 0 to 1

  const baseColor = new THREE.Color().lerpColors(
    new THREE.Color('#3b82f6'), // Cool Blue
    new THREE.Color('#E10600'), // Racing Red
    heatRatio
  );

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        {/* The Outer "Glass/Carbon" Shell */}
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[2, 3, 1]} />
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={0.5}
            anisotropy={0.1}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            clearcoat={1}
            attenuationDistance={1}
            attenuationColor={baseColor}
            color="#ffffff"
            roughness={0.1 + (1 - forceRatio) * 0.3} // Higher force = smoother
          />
        </mesh>

        {/* The Inner "Energy Core" (The Beans/Roast) */}
        <mesh ref={coreRef} position={[0, 0, 0]}>
          <capsuleGeometry args={[0.5, 1, 16, 16]} />
          <meshStandardMaterial 
            color={baseColor} 
            emissive={baseColor}
            emissiveIntensity={forceRatio * 2 + 0.5} // Glows brighter with more force
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Labels */}
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.2}
          color="#ffffff"
          font="/fonts/Orbitron-Black.ttf"
          anchorX="center"
          anchorY="middle"
        >
          APEX BREWS
        </Text>
        <Text
          position={[0, -0.3, 0.6]}
          fontSize={0.08}
          color="rgba(255,255,255,0.5)"
          font="/fonts/GeistMono-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {heat.toFixed(1)}°C | {force.toFixed(1)} BAR
        </Text>
      </group>
    </Float>
  );
}

export default function BlendCustomizer3D({ force, heat }: BlendCustomizer3DProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
        <color attach="background" args={['#050508']} />
        <ambientLight intensity={0.2} />
        <spotLight position={[5, 5, 5]} intensity={1} castShadow />
        <spotLight position={[-5, -5, -5]} intensity={0.5} color="#E10600" />
        
        <CoffeeBagMesh force={force} heat={heat} />
        
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={4} 
          color="#E10600"
        />
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
