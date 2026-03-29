import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProgressData } from '../types';

interface ProgressMeterProps {
  data: ProgressData[];
}

export function ProgressMeter({ data }: ProgressMeterProps) {
  const today = data[data.length - 1];
  const yesterday = data[data.length - 2];
  
  const diff = yesterday ? ((today.wordsLearned - yesterday.wordsLearned) / yesterday.wordsLearned) * 100 : 0;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-1">Daily Progress</h3>
          <p className="text-3xl font-bold text-white">{today.wordsLearned} <span className="text-sm font-normal text-gray-500">words learned</span></p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-bold",
          diff >= 0 ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
        )}>
          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% vs yesterday
        </div>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '12px' }}
              itemStyle={{ color: '#f97316' }}
            />
            <Bar dataKey="wordsLearned" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? '#f97316' : '#3f3f46'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
