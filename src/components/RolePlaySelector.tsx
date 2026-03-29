import React from 'react';
import { motion } from 'motion/react';
import { ROLE_PLAY_SCENARIOS, RolePlayScenario } from '../types';
import { Users, ChevronRight, Mic } from 'lucide-react';

interface RolePlaySelectorProps {
  onSelect: (scenario: RolePlayScenario) => void;
}

export function RolePlaySelector({ onSelect }: RolePlaySelectorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-orange-500" />
        <h2 className="text-2xl font-bold">Role Play Scenarios</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLE_PLAY_SCENARIOS.map((scenario) => (
          <motion.div
            key={scenario.id}
            whileHover={{ scale: 1.01 }}
            className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 text-left hover:border-orange-500/30 transition-all group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{scenario.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{scenario.description}</p>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] px-2 py-1 bg-orange-500/10 text-orange-500 rounded uppercase font-bold tracking-widest">
                Practice Speaking
              </span>
              <button 
                onClick={() => onSelect(scenario)}
                className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all active:scale-90"
              >
                <Mic size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
