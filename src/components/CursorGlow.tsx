'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const CursorGlow = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  // Smooth springs for high-end feel
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Faster springs for the core dot
  const coreX = useSpring(mouseX, { damping: 20, stiffness: 300 });
  const coreY = useSpring(mouseY, { damping: 20, stiffness: 300 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Check if hovering over a clickable element
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, [role="button"], input, select');
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Don't render cursor enhancements on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Background ambient glow */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(225, 6, 0, 0.08) 0%, rgba(225, 6, 0, 0.02) 40%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1,
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      
      {/* Interactive core ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[100] rounded-full border-2 border-racing-red mix-blend-screen"
        style={{
          x: coreX,
          y: coreY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 40 : 16,
          height: isHovering ? 40 : 16,
          borderColor: isHovering ? '#ffffff' : '#E10600',
          backgroundColor: isHovering ? 'rgba(255,255,255,0.1)' : 'transparent',
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ duration: 0.2, type: 'spring' }}
      />
    </>
  );
};
