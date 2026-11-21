import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ProgressData } from '../types';
import { Activity, TrendingUp, Award, Book, Mic, Target, ChevronDown } from 'lucide-react';
import { ThemeService } from '../services/ThemeService';
import { cn } from '../lib/utils';

interface ProgressMeterProps {
  data: ProgressData[];
}

export const ProgressMeter: React.FC<ProgressMeterProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<'overallFluency' | 'wordsLearned' | 'speakingTimeMinutes' | 'averageScore'>('overallFluency');
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const theme = ThemeService.getTheme();
  const isLight = theme === 'light';

  const safeData = React.useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      const valid = data.filter(d => d && typeof d === 'object');
      if (valid.length > 0) return valid;
    }
    return [{
      date: new Date().toLocaleDateString('en-CA'),
      wordsLearned: 0,
      speakingTimeMinutes: 0,
      averageScore: 0,
      overallFluency: 0
    }];
  }, [data]);

  const today = safeData[safeData.length - 1] || { wordsLearned: 0, speakingTimeMinutes: 0, averageScore: 0, overallFluency: 0 };
  
  const metrics = [
    { 
      id: 'overallFluency', 
      label: 'Overall', 
      value: `${Math.min(100, today.overallFluency || 0).toFixed(0)}%`, 
      icon: <TrendingUp size={16} />, 
      color: '#FF6B00' 
    },
    { 
      id: 'wordsLearned', 
      label: 'Vocabulary', 
      value: today.wordsLearned || 0, 
      icon: <Book size={16} />, 
      color: '#D97706' 
    },
    { 
      id: 'speakingTimeMinutes', 
      label: 'Speaking', 
      value: `${Number(today.speakingTimeMinutes || 0).toFixed(1)}m`, 
      icon: <Mic size={16} />, 
      color: '#E8A55A' 
    },
    { 
      id: 'averageScore', 
      label: 'Accuracy', 
      value: `${Math.min(100, today.averageScore || 0).toFixed(0)}%`, 
      icon: <Target size={16} />, 
      color: '#5DB872' 
    },
  ];

  const chartData = safeData.map(d => {
    let dayName = 'Day';
    try {
      if (d.date) {
        dayName = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
      }
    } catch {}
    return {
      name: dayName,
      overallFluency: Math.min(100, d.overallFluency || 0),
      wordsLearned: d.wordsLearned || 0,
      speakingTimeMinutes: d.speakingTimeMinutes || 0,
      averageScore: Math.min(100, d.averageScore || 0)
    };
  });

  const calculateStreak = (progressData: ProgressData[]) => {
    if (!Array.isArray(progressData) || progressData.length === 0) return 0;
    
    // Sort by date to be sure
    const sortedData = [...progressData]
      .filter(d => d && typeof d === 'object')
      .sort((a, b) => String(a?.date || '').localeCompare(String(b?.date || '')));
    
    // Get unique dates with activity
    const activityDates = new Set(
      sortedData
        .filter(d => ((d.wordsLearned || 0) > 0 || (d.speakingTimeMinutes || 0) > 0 || ((d.exercisesCompleted || 0) > 0)))
        .map(d => d.date)
        .filter(Boolean)
    );
    
    if (activityDates.size === 0) return 0;
    
    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
    
    if (!activityDates.has(todayStr) && !activityDates.has(yesterdayStr)) {
      return 0;
    }

    let currentStreak = 0;
    let checkDate = activityDates.has(todayStr) ? new Date() : yesterday;

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toLocaleDateString('en-CA');
      if (activityDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  const streak = calculateStreak(safeData);

  return (
    <div className="bg-card-bg border border-app-border rounded-3xl p-5 sm:p-6 shadow-subtle hover:shadow-app transition-all duration-300 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-text-muted mb-1">
                <Activity size={14} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                  Learning Activity
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
                Your Progress
              </h2>
            </div>

            <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider tabular-nums">
              <span>🔥</span>
              <span>{streak} {streak === 1 ? 'Day' : 'Days'} Streak</span>
            </div>
          </div>

          {/* Segmented Metric Pills */}
          <div className="flex items-center bg-card-soft p-1 rounded-2xl border border-app-border gap-1 overflow-x-auto scrollbar-hide">
            {metrics.map((m) => {
              const isActive = activeMetric === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id as any)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                    isActive 
                      ? "bg-accent text-white shadow-sm shadow-accent/20" 
                      : "text-text-muted hover:text-text-main hover:bg-card-bg/60"
                  )}
                >
                  <span className={cn("text-[11px]", isActive ? "text-white" : "opacity-70")}>
                    {m.icon}
                  </span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spline Area Chart */}
        <div className="flex flex-col gap-6">
          <div className="h-[220px] w-full min-w-0 bg-card-soft/40 rounded-2xl p-3 sm:p-4 border border-app-border/60">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetricSpline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B2B" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#FF6B2B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-app-border/40" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8A857D', fontSize: 11, fontWeight: 600 }}
                  dy={8}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8A857D', fontSize: 10, fontWeight: 600 }}
                  ticks={[0, 20, 40, 90]}
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg, #FFFFFF)', 
                    border: '1px solid var(--app-border, #EAE5DE)',
                    borderRadius: '14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--text-main, #141413)',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12)'
                  }}
                  itemStyle={{ color: 'var(--text-main, #141413)' }}
                  formatter={(value: number) => {
                    const metric = metrics.find(m => m.id === activeMetric);
                    const formattedValue = (activeMetric === 'wordsLearned' || activeMetric === 'overallFluency') ? value.toFixed(0) : Number(value).toFixed(1);
                    const suffix = activeMetric === 'speakingTimeMinutes' ? 'm' : (activeMetric === 'averageScore' || activeMetric === 'overallFluency') ? '%' : '';
                    return [`${formattedValue}${suffix}`, metric?.label];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeMetric} 
                  stroke="#FF6B2B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMetricSpline)" 
                  animationDuration={1200}
                  dot={false}
                  activeDot={{ r: 5, fill: "#FF6B2B", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics Toggle Button */}
          <div className="flex justify-center -mt-2">
            <button
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                isStatsOpen 
                  ? "bg-accent/10 border-accent/30 text-accent shadow-lg shadow-accent/10" 
                  : "bg-card-soft border-app-border text-text-muted hover:text-text-main hover:bg-card-bg"
              )}
            >
              <Activity size={14} className={cn("transition-transform duration-300", isStatsOpen && "scale-110")} />
              <span>{isStatsOpen ? "Hide Statistics" : "Show Statistics"}</span>
              <ChevronDown size={14} className={cn("transition-transform duration-300", isStatsOpen ? "rotate-180" : "rotate-0")} />
            </button>
          </div>

          <motion.div
            initial={false}
            animate={{ 
              height: isStatsOpen ? "auto" : 0,
              opacity: isStatsOpen ? 1 : 0
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pb-2">
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
                <div className="text-xl font-black level-number">{streak} {streak === 1 ? 'Day' : 'Days'}</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Streak</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
