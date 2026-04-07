import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ProgressData } from '../types';
import { Activity, TrendingUp, Award, Book, Mic, Target } from 'lucide-react';
import { ThemeService } from '../services/ThemeService';
import { cn } from '../lib/utils';

interface ProgressMeterProps {
  data: ProgressData[];
}

export const ProgressMeter: React.FC<ProgressMeterProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<'wordsLearned' | 'speakingTimeMinutes' | 'averageScore'>('wordsLearned');
  const theme = ThemeService.getTheme();
  const isLight = theme === 'light';
  const isMidnight = theme === 'midnight-neon';
  const isStreet = theme === 'street-graphite';
  const isKawaii = theme === 'y2k-kawaii';

  const today = data[data.length - 1] || { wordsLearned: 0, speakingTimeMinutes: 0, averageScore: 0 };
  
  const metrics = [
    { 
      id: 'wordsLearned', 
      label: 'Vocabulary', 
      value: today.wordsLearned, 
      icon: <Book size={16} />, 
      color: isMidnight ? '#FF00FF' : (isStreet ? '#FF6B00' : (isKawaii ? '#FFB6C1' : '#f97316')) 
    },
    { 
      id: 'speakingTimeMinutes', 
      label: 'Speaking', 
      value: `${Number(today.speakingTimeMinutes).toFixed(1)}m`, 
      icon: <Mic size={16} />, 
      color: isMidnight ? '#00FFFF' : (isStreet ? '#E0E0E0' : (isKawaii ? '#A0E7E5' : '#4ecdc4')) 
    },
    { 
      id: 'averageScore', 
      label: 'Accuracy', 
      value: `${((today.averageScore || 0) * 100).toFixed(0)}%`, 
      icon: <Target size={16} />, 
      color: isMidnight ? '#39FF14' : (isStreet ? '#00FF41' : (isKawaii ? '#9370DB' : '#8e94f2')) 
    },
  ];

  const chartData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    wordsLearned: d.wordsLearned,
    speakingTimeMinutes: d.speakingTimeMinutes,
    averageScore: (d.averageScore || 0) * 100
  }));

  return (
    <div className="bg-card-bg border border-app-border rounded-card p-6 md:p-8 shadow-app overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -mr-32 -mt-32" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Activity size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Learning Activity</span>
            </div>
            <h2 className="text-3xl font-black text-text-main tracking-tight">Your Progress</h2>
          </div>

          <div className="flex bg-card-soft p-1 rounded-2xl border border-app-border">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  activeMetric === m.id 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "text-text-muted hover:text-text-main hover:bg-card-bg"
                )}
              >
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="h-[300px] bg-card-soft rounded-3xl p-6 border border-app-border">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metrics.find(m => m.id === activeMetric)?.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metrics.find(m => m.id === activeMetric)?.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isLight ? '#52525b' : '#71717a', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isMidnight ? '#1A0B2E' : (isStreet ? '#1E1E1E' : (isKawaii ? 'rgba(255, 255, 255, 0.8)' : (isLight ? '#ffffff' : '#18181b'))), 
                    border: isMidnight ? '1px solid #00FFFF' : (isStreet ? '2px solid #FF6B00' : (isKawaii ? '2px solid #FFB6C1' : (isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)'))),
                    borderRadius: isStreet ? '0px' : (isKawaii ? '20px' : '12px'),
                    fontSize: '12px',
                    fontWeight: '700',
                    color: isKawaii || isLight ? '#4B0082' : '#ffffff',
                    boxShadow: isMidnight ? '0 0 10px #00FFFF' : (isKawaii ? '0 4px 12px rgba(255, 182, 193, 0.4)' : 'none'),
                    backdropFilter: isKawaii ? 'blur(8px)' : 'none'
                  }}
                  itemStyle={{ color: isKawaii || isLight ? '#4B0082' : '#ffffff' }}
                  formatter={(value: number) => {
                    const metric = metrics.find(m => m.id === activeMetric);
                    const formattedValue = activeMetric === 'wordsLearned' ? value : Number(value).toFixed(1);
                    const suffix = activeMetric === 'speakingTimeMinutes' ? 'm' : activeMetric === 'averageScore' ? '%' : '';
                    return [`${formattedValue}${suffix}`, metric?.label];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeMetric} 
                  stroke={metrics.find(m => m.id === activeMetric)?.color} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div 
                key={m.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center",
                  activeMetric === m.id 
                    ? "bg-accent/10 border-accent/30 scale-[1.02]" 
                    : "bg-card-soft border-app-border"
                )}
              >
                <div className={cn("p-2 rounded-xl mb-3", activeMetric === m.id ? "bg-accent text-white" : "bg-card-bg text-text-muted")}>
                  {m.icon}
                </div>
                <div className="text-xl font-black text-text-main mb-0.5 level-number">{m.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">{m.label}</div>
              </div>
            ))}

            <div className="p-4 bg-accent rounded-2xl text-white shadow-xl shadow-accent/20 flex flex-col items-center text-center group cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="bg-white/20 p-2 rounded-xl mb-3">
                <Award size={18} />
              </div>
              <div className="text-xl font-black level-number">7 Days</div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
