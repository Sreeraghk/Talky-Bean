import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RolePlayScenario } from '../types';
import { Sparkles, X, Send } from 'lucide-react';
import { AiService } from '../services/AiService';
import { getLanguageConfig } from '../config/languages';
import { TalkingPartnerCard } from './TalkingPartnerCard';

interface RolePlaySelectorProps {
  onSelect: (scenario: RolePlayScenario) => void;
  customScenario: RolePlayScenario | null;
  onSaveCustom: (scenario: RolePlayScenario) => void;
  onDeleteCustom: () => void;
  scenarios: RolePlayScenario[];
  languageCode: string;
  user?: any;
  onRequireLogin?: () => void;
}

export function RolePlaySelector({
  onSelect,
  customScenario,
  onSaveCustom,
  onDeleteCustom,
  scenarios,
  languageCode,
  user,
  onRequireLogin
}: RolePlaySelectorProps) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateScenario = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const ai = AiService.getClient();
      const langName = getLanguageConfig(languageCode).name;
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        config: {
          systemInstruction: `You are an expert ${langName} teacher. Generate roleplay scenarios as PURE JSON. Be concise but realistic. Output under 300 words.`,
          responseMimeType: "application/json",
          maxOutputTokens: 500,
          responseSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              context: { type: "string" }
            },
            required: ["title", "description", "context"]
          }
        },
        contents: [
          { 
            role: 'user', 
            parts: [{ text: `Topic: ${prompt}.` }] 
          }
        ]
      });

      let text = response.text || "";
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();

      const result = JSON.parse(text);
      const newScenario: RolePlayScenario = {
        id: 'custom-' + Date.now(),
        title: result.title || 'Custom Partner',
        description: result.description || 'A custom conversational roleplay partner.',
        context: result.context,
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        category: 'Social',
        difficulty: 'Intermediate',
        estimatedMinutes: 10
      };

      onSaveCustom(newScenario);
      setIsPlanning(false);
      setPrompt('');
    } catch (error) {
      console.warn("Failed to generate custom scenario:", error);
      alert("Failed to generate scenario. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardClick = (scenario: RolePlayScenario) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }
    if (!user) {
      onRequireLogin?.();
      return;
    }
    onSelect(scenario);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left px-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f95716] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f95716] animate-pulse" />
              <span>TALKING PARTNERS</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
            Choose a Companion
          </h2>
          <p className="text-xs sm:text-sm text-text-muted font-medium mt-0.5">
            Select a companion for personalized spoken conversation practice.
          </p>
        </div>

        {!customScenario && !isPlanning && (
          <button 
            onClick={() => {
              if (!user) {
                onRequireLogin?.();
                return;
              }
              setIsPlanning(true);
            }}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] hover:from-[#FF8F57] hover:to-[#F25623] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-orange-500/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Sparkles size={15} />
            <span>Plan Scenario</span>
          </button>
        )}
      </div>

      {/* Cinematic Banner Cards Stack */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {/* Custom Scenario Card (if user generated one) */}
        {customScenario && (
          <TalkingPartnerCard
            scenario={customScenario}
            onSelect={handleCardClick}
            isCustom={true}
            onDeleteCustom={onDeleteCustom}
          />
        )}

        {/* Predefined Talking Partner Cards */}
        {scenarios.map((scenario) => (
          <TalkingPartnerCard
            key={scenario.id}
            scenario={scenario}
            onSelect={handleCardClick}
          />
        ))}
      </div>

      {/* AI Scenario Planning Modal */}
      <AnimatePresence>
        {isPlanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card-bg border-2 border-[#f95716]/40 p-6 sm:p-8 rounded-[2rem] space-y-4 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-text-main flex items-center gap-2">
                <Sparkles className="text-[#f95716]" size={22} />
                Plan Your Custom Conversation Partner
              </h3>
              <button 
                onClick={() => setIsPlanning(false)} 
                className="text-text-muted hover:text-text-main p-1.5 rounded-full hover:bg-card-soft transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-text-muted font-medium">
              Describe your scenario: the setting, who the AI should play, and your conversation goal.
            </p>
            <div className="relative">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
                placeholder="e.g. I am ordering street food at a night market in Tokyo. The vendor speaks friendly Japanese and recommends seasonal specialties..."
                className="w-full bg-input-bg border border-app-border rounded-2xl p-4 text-sm min-h-[120px] focus:border-[#f95716]/60 outline-none transition-all resize-none font-medium"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-text-subtle font-mono">
                {prompt.length}/1000
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPlanning(false)}
                className="px-5 py-2.5 text-xs font-extrabold text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateScenario}
                disabled={!prompt.trim() || isGenerating}
                className="px-6 py-3 bg-[#f95716] hover:bg-[#d8481b] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer active:scale-95"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Generate Scenario</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
