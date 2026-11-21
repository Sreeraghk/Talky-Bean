import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FluencyService } from '../services/FluencyService';
import { FluencyAssessment } from '../types';
import { cn } from '../lib/utils';
import { Zap, Gauge, Info } from 'lucide-react';

interface NativeFluencyMirrorProps {
  languageCode: string;
}

export const NativeFluencyMirror: React.FC<NativeFluencyMirrorProps> = ({ languageCode }) => {
  const [assessment, setAssessment] = useState<FluencyAssessment>(() => 
    FluencyService.getAssessment(languageCode)
  );
  
  useEffect(() => {
    setAssessment(FluencyService.getAssessment(languageCode));
  }, [languageCode]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail.languageCode === languageCode) {
        setAssessment(e.detail.assessment);
      }
    };
    window.addEventListener('fluency-updated', handleUpdate);
    return () => window.removeEventListener('fluency-updated', handleUpdate);
  }, [languageCode]);

  const overallScore = Math.round(assessment.overall);
  // Calculate indicator dot position on the arc (radius 80, center at 100, 100)
  // angle goes from 180 deg (0%) to 0 deg (100%)
  const clampedRatio = Math.max(0, Math.min(1, assessment.overall / 100));
  const angleDeg = 180 - (clampedRatio * 180);
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = 100 + 80 * Math.cos(angleRad);
  const dotY = 100 - 80 * Math.sin(angleRad);

  return (
    <div className="relative w-full mx-auto p-5 sm:p-6 rounded-3xl border transition-all duration-300 bg-card-bg border-app-border shadow-subtle hover:shadow-app">
      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
              <Gauge size={18} />
            </div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-text-main">
              Native Fluency Mirror
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-card-soft text-text-muted border border-app-border tabular-nums">
            CEFR Synced
          </span>
        </div>

        {/* Speedometer Gauge Arc */}
        <div className="relative w-full max-w-[280px] h-[150px] mx-auto mb-4 flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="fluencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B2B" />
                <stop offset="100%" stopColor="#FFA133" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Arc (Background Track) */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="currentColor"
              className="text-app-border/40 dark:text-white/10"
              strokeWidth="10"
              strokeLinecap="round"
            />
            
            {/* Progress Arc */}
            <motion.path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#fluencyGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: clampedRatio }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />

            {/* Glowing Indicator Dot on Arc */}
            <motion.circle
              cx={dotX}
              cy={dotY}
              r="6"
              fill="#FF6B2B"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            />
          </svg>

          {/* Digital Readout */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-text-main flex items-baseline justify-center"
            >
              <span>{overallScore}</span>
              <span className="text-xl sm:text-2xl font-bold text-accent ml-0.5">%</span>
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted mt-0.5">
              Native Power
            </span>
          </div>
        </div>

        {/* 3 Sub-Metrics Breakdown Pills */}
        <div className="grid grid-cols-3 gap-2 w-full mb-4">
          {[
            { label: 'Listening', value: assessment.listening, color: '#38BDF8' },
            { label: 'Speaking', value: assessment.speaking, color: '#FF6B2B' },
            { label: 'Grammar', value: assessment.grammar, color: '#A855F7' },
          ].map((stat) => (
            <div 
              key={stat.label} 
              className="p-2.5 rounded-2xl border flex flex-col items-center justify-center bg-card-soft border-app-border text-center"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">
                {stat.label}
              </span>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.color }} />
                <span className="text-xs sm:text-sm font-bold text-text-main">
                  {Math.round(stat.value)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Guidance */}
        <div className="flex items-center gap-2 text-text-muted text-[11px] leading-relaxed bg-card-soft/50 px-3.5 py-2 rounded-2xl border border-app-border/40">
          <Info size={13} className="shrink-0 text-accent" />
          <span>This score compares you to a native speaker</span>
        </div>
      </div>
    </div>
  );
};
