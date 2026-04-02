import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ProgressData } from '../types';
import { cn } from '../lib/utils';
import { Clock, TrendingUp, Activity, Brain, Target } from 'lucide-react';

interface ProgressMeterProps {
  data: ProgressData[];
}

type Metric = 'wordsLearned' | 'speakingTimeMinutes' | 'averageScore';

export function ProgressMeter({ data }: ProgressMeterProps) {
  const [activeMetric, setActiveMetric] = useState<Metric>('wordsLearned');

  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-12 shadow-xl text-center">
        <p className="text-gray-500">No progress data yet. Start learning!</p>
      </div>
    );
  }

  const today = data[data.length - 1];
  const avgSpeakingTime = data.reduce((acc, curr) => acc + (curr.speakingTimeMinutes || 0), 0) / data.length;
  const todaySpeakingTime = today.speakingTimeMinutes || 0;
  
  const isAboveAverage = todaySpeakingTime >= avgSpeakingTime;

  const metrics = [
    { id: 'wordsLearned', label: 'Vocabulary', icon: <TrendingUp size={14} />, unit: 'Words' },
    { id: 'speakingTimeMinutes', label: 'Speaking', icon: <Clock size={14} />, unit: 'Min' },
    { id: 'averageScore', label: 'Accuracy', icon: <Target size={14} />, unit: '%' },
  ];

  const currentMetric = metrics.find(m => m.id === activeMetric)!;

  const formatValue = (val: number) => {
    if (activeMetric === 'averageScore') return `${(val * 100).toFixed(0)}%`;
    return val.toFixed(activeMetric === 'speakingTimeMinutes' ? 1 : 0);
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Activity size={120} className="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <TrendingUp size={14} className="text-orange-500" />
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black">Daily Progress</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id as Metric)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  activeMetric === m.id 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : "bg-white/5 text-zinc-500 hover:bg-white/10"
                )}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-baseline gap-2 pt-2">
            <p className="text-4xl font-black text-white tracking-tighter">
              {formatValue(today[activeMetric] || 0)}
            </p>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{currentMetric.unit}</span>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Clock size={14} />
              <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold">Today's Session</h3>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{todaySpeakingTime.toFixed(1)}<span className="text-sm font-normal text-zinc-500 ml-1">min</span></p>
          </div>
          <div className="space-y-1 border-l border-white/10 pl-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Activity size={14} />
              <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold">Daily Average</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white tracking-tight">{avgSpeakingTime.toFixed(1)}<span className="text-sm font-normal text-zinc-500 ml-1">min</span></p>
              <span className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded uppercase",
                isAboveAverage ? "text-green-500 bg-green-500/10" : "text-orange-500 bg-orange-500/10"
              )}>
                {isAboveAverage ? 'Above' : 'Below'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-64 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} strokeOpacity={0.1} />
            <XAxis 
              dataKey="date" 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.toLocaleDateString([], { weekday: 'short' });
              }}
            />
            <YAxis hide domain={activeMetric === 'averageScore' ? [0, 1] : ['dataMin', 'dataMax + 2']} />
            <Tooltip 
              cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-950 border border-white/10 p-3 rounded-2xl shadow-2xl">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                        {new Date(label).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm font-bold text-white">
                        {formatValue(payload[0].value)} <span className="text-xs font-normal text-zinc-500">{currentMetric.unit}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke="#f97316" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorMetric)" 
              animationDuration={2000}
              activeDot={{ r: 6, fill: '#f97316', stroke: '#000', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
