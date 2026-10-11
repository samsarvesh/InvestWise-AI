import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export const SubtleBackground: React.FC = () => {
  // Generate random stable properties for 35 drifting particles
  const particles = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 2, // 2px to 5px for better visibility
      initialX: Math.random() * 100, // percentage of screen width
      initialY: Math.random() * 100, // percentage of screen height
      duration: Math.random() * 50 + 30, // slightly faster drift over 30-80s
      delay: Math.random() * -50, // negative delay so they start pre-distributed
      opacity: Math.random() * 0.4 + 0.2, // increased opacity (20% to 60%) to be clearly visible
      color: Math.random() > 0.55 ? '#10b981' : Math.random() > 0.5 ? '#6366f1' : '#f59e0b', // Emerald, Indigo, or Amber tint
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020617]">
      {/* 1. Slowly rotating ambient gradient orbs */}
      <div className="absolute inset-0 opacity-45 filter blur-[110px] md:blur-[140px] mix-blend-screen">
        <motion.div
          animate={{
            transform: [
              'translate(0%, 0%) scale(1)',
              'translate(15%, -20%) scale(1.2)',
              'translate(-10%, 15%) scale(0.9)',
              'translate(0%, 0%) scale(1)',
            ],
          }}
          transition={{
            duration: 35,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          className="absolute top-[-15%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-br from-emerald-500/35 to-teal-500/15"
        />
        <motion.div
          animate={{
            transform: [
              'translate(0%, 0%) scale(1)',
              'translate(-12%, 18%) scale(0.85)',
              'translate(18%, -12%) scale(1.25)',
              'translate(0%, 0%) scale(1)',
            ],
          }}
          transition={{
            duration: 40,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: 5,
          }}
          className="absolute bottom-[-15%] right-[-15%] w-[75vw] h-[75vw] rounded-full bg-gradient-to-tr from-indigo-500/35 to-purple-500/20"
        />
      </div>

      {/* 2. Panning subtle digital grid */}
      <motion.div 
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px'],
        }}
        transition={{
          duration: 20,
          ease: 'linear',
          repeat: Infinity,
        }}
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.44) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.44) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3. Extremely light floating particles (drifting upwards and fading) */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: `${p.initialX}vw`, 
              y: `${p.initialY}vh`, 
              opacity: 0 
            }}
            animate={{
              y: ['105vh', '-5vh'],
              opacity: [0, p.opacity, p.opacity, 0],
              x: [
                `${p.initialX}vw`, 
                `${p.initialX + (Math.random() * 8 - 4)}vw`,
                `${p.initialX + (Math.random() * 8 - 4)}vw`,
              ],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'linear',
              repeat: Infinity,
            }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
