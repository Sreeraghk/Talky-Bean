import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FluencyService } from '../services/FluencyService';
import { ThemeService } from '../services/ThemeService';
import { FluencyAssessment } from '../types';
import { cn } from '../lib/utils';
import { Zap, Gauge, Info } from 'lucide-react';

export const NativeFluencyMirror: React.FC = () => {
  const [assessment, setAssessment] = useState<FluencyAssessment>(FluencyService.getAssessment());
  const theme = ThemeService.getTheme();
  
  const isStreet = theme === 'street-graphite';
  const isKawaii = theme === 'y2k-kawaii';
  const isMidnight = theme === 'midnight-neon';

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setAssessment(e.detail);
    };
    window.addEventListener('fluency-updated', handleUpdate);
    return () => window.removeEventListener('fluency-updated', handleUpdate);
  }, []);

  return (
    <div className={cn(
      "relative w-full max-w-2xl mx-auto p-8 rounded-[2rem] border overflow-hidden transition-all duration-500",
      isStreet ? "bg-[#121212] border-[#E0E0E0]/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]" :
      isKawaii ? "bg-white/40 backdrop-blur-xl border-white/60 shadow-[0_20px_50px_rgba(255,182,193,0.3)]" :
      "bg-card-bg border-app-border shadow-app"
    )}>
      {/* Background Textures */}
      {isStreet && (
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      )}
      {isKawaii && (
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffccdd_1px,transparent_1px)] bg-[length:10px_10px]" />
      )}

      <div className="relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={cn(
            "p-2 rounded-xl",
            isStreet ? "bg-[#FF6B00] text-white" :
            isKawaii ? "bg-[#FFB6C1] text-white" :
            "bg-accent text-white"
          )}>
            <Gauge size={20} />
          </div>
          <h2 className={cn(
            "text-2xl font-black uppercase tracking-tighter",
            isStreet ? "text-white italic skew-x-[-5deg]" :
            isKawaii ? "text-[#4B0082] drop-shadow-sm" :
            "text-text-main"
          )}>
            Native Fluency Mirror
          </h2>
        </div>

        {/* Speedometer Gauge */}
        <div className="relative w-64 h-40 md:w-80 md:h-48 mb-6">
          <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
            {/* Outer Arc (Background) */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={isStreet ? "#1E1E1E" : isKawaii ? "#f0f0f0" : "rgba(0,0,0,0.05)"}
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Progress Arc */}
            <motion.path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={isStreet ? "#FF6B00" : isKawaii ? "url(#kawaiiGradient)" : "var(--accent)"}
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: assessment.overall / 100 }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{
                filter: isStreet ? 'drop-shadow(0 0 8px #FF6B00)' : 
                        isKawaii ? 'drop-shadow(0 0 8px #FFB6C1)' : 'none'
              }}
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="kawaiiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFB6C1" />
                <stop offset="50%" stopColor="#A0E7E5" />
                <stop offset="100%" stopColor="#9370DB" />
              </linearGradient>
              
              {isStreet && (
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              )}
            </defs>

            {/* Tick Marks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const angle = (tick / 100) * 180 - 180;
              const rad = (angle * Math.PI) / 180;
              const x1 = 100 + 85 * Math.cos(rad);
              const y1 = 100 + 85 * Math.sin(rad);
              const x2 = 100 + 95 * Math.cos(rad);
              const y2 = 100 + 95 * Math.sin(rad);
              return (
                <line
                  key={tick}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isStreet ? "#888888" : "#ccc"}
                  strokeWidth="1"
                />
              );
            })}
          </svg>

          {/* Digital Readout */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.span 
              className={cn(
                "text-5xl font-black tracking-tighter tabular-nums",
                isStreet ? "text-white font-mono" :
                isKawaii ? "text-[#4B0082] drop-shadow-md" :
                "text-text-main"
              )}
            >
              {Math.round(assessment.overall)}
              <span className="text-xl opacity-50 ml-1">%</span>
            </motion.span>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.3em] opacity-60",
              isStreet ? "text-[#FF6B00]" : "text-text-muted"
            )}>
              Native Power
            </span>
          </div>
        </div>

        {/* Stats Breakdown */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-8">
          {[
            { label: 'Listening', value: assessment.listening },
            { label: 'Speaking', value: assessment.speaking },
            { label: 'Grammar', value: assessment.grammar },
          ].map((stat) => (
            <div key={stat.label} className={cn(
              "p-3 rounded-2xl border flex flex-col items-center",
              isStreet ? "bg-[#1E1E1E] border-[#E0E0E0]/10" :
              isKawaii ? "bg-white/60 border-white/80" :
              "bg-card-soft border-app-border"
            )}>
              <span className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-1">{stat.label}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className={cn(
                  "text-sm font-bold",
                  isStreet ? "text-white font-mono" : "text-text-main"
                )}>{Math.round(stat.value)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Reasoning / Feedback */}
        <div className={cn(
          "w-full p-4 rounded-2xl border mb-8 text-center",
          isStreet ? "bg-[#1E1E1E]/50 border-[#FF6B00]/20 text-[#888888]" :
          isKawaii ? "bg-[#A0E7E5]/20 border-[#A0E7E5]/40 text-[#4B0082]" :
          "bg-accent/5 border-accent/10 text-text-muted"
        )}>
          <p className="text-xs font-bold leading-relaxed">
            "{assessment.reasoning}"
          </p>
        </div>

        {/* Footer Guidance */}
        <div className="flex gap-3 items-start opacity-60 max-w-lg">
          <Info size={14} className="mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed font-medium">
            The Native-Fluency Mirror: This speedometer measures your real-world language power against a native speaker. By analyzing your unique learning style, it calculates your progress toward 100% mastery. Every word you speak or hear fills the meter.
          </p>
        </div>
      </div>

      {/* Carbon Fiber Texture for Street Theme */}
      {isStreet && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px' }} />
      )}
    </div>
  );
};
