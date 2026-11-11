import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const getColors = (s: number) => {
    if (s >= 8) return {
      primary: '#10b981', // emerald
      gradient: 'from-emerald-500 to-teal-400',
      glow: 'shadow-emerald-500/30',
      text: 'text-emerald-400'
    };
    if (s >= 6) return {
      primary: '#f59e0b', // amber
      gradient: 'from-amber-500 to-orange-400',
      glow: 'shadow-amber-500/30',
      text: 'text-amber-400'
    };
    return {
      primary: '#f43f5e', // rose
      gradient: 'from-rose-500 to-pink-500',
      glow: 'shadow-rose-500/30',
      text: 'text-rose-400'
    };
  };

  const colors = getColors(score);
  
  // Circle geometry for the progress ring
  const radius = 42;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const percentage = Math.min(Math.max(score, 0), 10) / 10;
  const strokeDashoffset = circumference - (percentage * circumference);

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      {/* Container with a steady, soft radial glow behind the badge */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        
        {/* Glow backdrop */}
        <div 
          className="absolute w-24 h-24 rounded-full blur-xl opacity-20 transition-all duration-1000"
          style={{ backgroundColor: colors.primary }}
        />

        {/* Layer 1: Outer holographic orbiting ring (slow counter-rotation) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
          className="absolute inset-0 rounded-full border border-dashed border-white/5 dark:border-white/15"
        />

        {/* Layer 2: Fast tech dots orbit ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, ease: 'linear', repeat: Infinity }}
          className="absolute inset-2"
        >
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full blur-[1px]"
            style={{ backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.primary}` }}
          />
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-40"
            style={{ backgroundColor: colors.primary }}
          />
        </motion.div>

        {/* SVG Circle Progress indicator */}
        <svg className="w-full h-full -rotate-90 absolute z-10" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`gaugeGrad-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={score >= 8 ? '#2dd4bf' : score >= 6 ? '#f97316' : '#ec4899'} />
            </linearGradient>
          </defs>
          
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          
          {/* Animated active score progress */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={`url(#gaugeGrad-${score})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${colors.primary}55)` }}
          />
        </svg>

        {/* Inner Score Label Centered */}
        <div className="absolute z-20 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm w-[76px] h-[76px] rounded-full border border-white/10 shadow-inner">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className={`text-3xl font-sans font-black leading-none ${colors.text} tracking-tighter`}
          >
            {score}
          </motion.span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">/ 10</span>
        </div>

      </div>
      
      <div className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
        AI Score
      </div>
    </div>
  );
};
