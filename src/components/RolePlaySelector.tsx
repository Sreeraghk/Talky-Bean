import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RolePlayScenario } from '../types';
import { Users, ChevronRight, Mic, Sparkles, Trash2, X, Send } from 'lucide-react';
import { AiService } from '../services/AiService';

interface RolePlaySelectorProps {
  onSelect: (scenario: RolePlayScenario) => void;
  customScenario: RolePlayScenario | null;
  onSaveCustom: (scenario: RolePlayScenario) => void;
  onDeleteCustom: () => void;
  scenarios: RolePlayScenario[];
}

export function RolePlaySelector({ onSelect, customScenario, onSaveCustom, onDeleteCustom, scenarios }: RolePlaySelectorProps) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateScenario = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const ai = AiService.getClient();
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: `Create a German language practice roleplay scenario based on this description: "${prompt}". 
        The output MUST be a JSON object with exactly these fields:
        - title: A short, catchy name for the scenario.
        - description: A brief summary of what happens.
        - context: Detailed instructions for the AI persona on how to behave, what their goal is, and the setting.
        
        Keep the title under 30 characters and the description under 100 characters.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text);
      const newScenario: RolePlayScenario = {
        id: 'custom-' + Date.now(),
        title: result.title,
        description: result.description,
        context: result.context
      };

      onSaveCustom(newScenario);
      setIsPlanning(false);
      setPrompt('');
    } catch (error) {
      console.error("Failed to generate scenario:", error);
      alert("Failed to generate scenario. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-orange-500" />
          <h2 className="text-2xl font-bold">Role Play Scenarios</h2>
        </div>
        {!customScenario && !isPlanning && (
          <button 
            onClick={() => setIsPlanning(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-full text-sm font-bold hover:bg-orange-500/20 transition-all"
          >
            <Sparkles size={16} />
            Plan Your Own
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Predefined Scenarios */}
        {scenarios.map((scenario) => (
          <motion.div
            key={scenario.id}
            whileHover={{ scale: 1.01 }}
            className="bg-card-soft p-6 rounded-3xl border border-app-border text-left hover:border-accent/30 transition-all group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-text-main mb-2">{scenario.title}</h3>
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

        {/* Custom Scenario */}
        {customScenario && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-orange-500/5 p-6 rounded-3xl border border-orange-500/30 text-left relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={onDeleteCustom}
                className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-all"
                title="Delete custom scenario"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-accent" />
                <h3 className="text-lg font-bold text-text-main">{customScenario.title}</h3>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] px-2 py-1 bg-orange-500/20 text-orange-500 rounded uppercase font-bold tracking-widest">
                Your Custom Scenario
              </span>
              <button 
                onClick={() => onSelect(customScenario)}
                className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all active:scale-90"
              >
                <Mic size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Planning UI */}
        <AnimatePresence>
          {isPlanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="col-span-1 md:col-span-2 bg-card-bg border border-accent/30 p-6 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="text-accent" size={20} />
                  Plan Your Custom Scenario
                </h3>
                <button onClick={() => setIsPlanning(false)} className="text-text-muted hover:text-text-main">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-text-subtle">Describe the situation, who the AI should be, and what your goal is (up to 250 words).</p>
              <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 1000))} // Roughly 250 words
                  placeholder="e.g. I am at a train station in Berlin and I lost my ticket. The AI is a helpful but strict station officer..."
                  className="w-full bg-input-bg border border-app-border rounded-2xl p-4 text-sm min-h-[120px] focus:border-accent/50 outline-none transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-text-subtle font-mono">
                  {prompt.length}/1000
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleGenerateScenario}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-6 py-3 bg-accent text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover transition-all"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-text-main rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Generate Scenario
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
