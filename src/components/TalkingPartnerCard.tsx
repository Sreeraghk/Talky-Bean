import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RolePlayScenario } from '../types';
import { 
  MessageSquare, 
  Heart, 
  Plane, 
  Briefcase, 
  Users, 
  Compass, 
  Home, 
  Sparkles, 
  Mic, 
  Trash2 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface TalkingPartnerCardProps {
  scenario: RolePlayScenario;
  onSelect: (scenario: RolePlayScenario) => void;
  isCustom?: boolean;
  onDeleteCustom?: () => void;
  disabled?: boolean;
}

interface ThemeConfig {
  iconBadgeBg: string;
  iconBadgeBorder: string;
  icon: React.ReactNode;
  cardBaseBg: string;
  gradientOverlay: string;
  borderClass: string;
  glowColor: string;
  fallbackImage: string;
}

const getPartnerTheme = (scenario: RolePlayScenario): ThemeConfig => {
  const text = `${scenario.id} ${scenario.title} ${scenario.description} ${scenario.category || ''}`.toLowerCase();

  // 1. Café / Barista / Restaurant
  if (text.includes('café') || text.includes('cafe') || text.includes('coffee') || text.includes('barista') || text.includes('restaurant')) {
    return {
      iconBadgeBg: 'bg-[#2d1b11]/80 backdrop-blur-md',
      iconBadgeBorder: 'border-[#b45309]/30',
      icon: <MessageSquare className="w-5 h-5 text-[#f59e0b]" strokeWidth={2.4} />,
      cardBaseBg: 'bg-[#15100c]',
      gradientOverlay: 'from-[#140e0a] via-[#140e0a]/92 via-50% to-transparent',
      borderClass: 'border-white/[0.08] hover:border-amber-500/40',
      glowColor: 'bg-amber-500/10',
      fallbackImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // 2. Romantic Partner / Girlfriend / Date
  if (text.includes('romantic') || text.includes('girlfriend') || text.includes('partner') || text.includes('love') || text.includes('date')) {
    return {
      iconBadgeBg: 'bg-[#351121]/80 backdrop-blur-md',
      iconBadgeBorder: 'border-[#e11d48]/30',
      icon: <Heart className="w-5 h-5 text-[#f43f5e] fill-[#f43f5e]" strokeWidth={2} />,
      cardBaseBg: 'bg-[#180d16]',
      gradientOverlay: 'from-[#180c14] via-[#180c14]/92 via-50% to-transparent',
      borderClass: 'border-white/[0.08] hover:border-rose-500/40',
      glowColor: 'bg-rose-500/10',
      fallbackImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // 3. Airport Travel / Flight / Gate Check
  if (text.includes('airport') || text.includes('travel') || text.includes('gate') || text.includes('flight') || text.includes('hotel')) {
    return {
      iconBadgeBg: 'bg-[#122338]/80 backdrop-blur-md',
      iconBadgeBorder: 'border-[#0284c7]/30',
      icon: <Plane className="w-5 h-5 text-white fill-white" strokeWidth={1.8} />,
      cardBaseBg: 'bg-[#0d1522]',
      gradientOverlay: 'from-[#0b1420] via-[#0b1420]/92 via-50% to-transparent',
      borderClass: 'border-white/[0.08] hover:border-sky-500/40',
      glowColor: 'bg-sky-500/10',
      fallbackImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // 4. Office / Colleague / Work
  if (text.includes('office') || text.includes('colleague') || text.includes('teammate') || text.includes('work') || text.includes('career')) {
    return {
      iconBadgeBg: 'bg-[#0c2226]/80 backdrop-blur-md',
      iconBadgeBorder: 'border-[#0d9488]/30',
      icon: <Briefcase className="w-5 h-5 text-[#2dd4bf]" strokeWidth={2.2} />,
      cardBaseBg: 'bg-[#0b171a]',
      gradientOverlay: 'from-[#0a1518] via-[#0a1518]/92 via-50% to-transparent',
      borderClass: 'border-white/[0.08] hover:border-teal-500/40',
      glowColor: 'bg-teal-500/10',
      fallbackImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // 5. Best Friend / Social
  if (text.includes('bestfriend') || text.includes('friend') || text.includes('buddy') || text.includes('social')) {
    return {
      iconBadgeBg: 'bg-[#161536]/80 backdrop-blur-md',
      iconBadgeBorder: 'border-[#6366f1]/30',
      icon: <Users className="w-5 h-5 text-[#818cf8]" strokeWidth={2.2} />,
      cardBaseBg: 'bg-[#111022]',
      gradientOverlay: 'from-[#100f20] via-[#100f20]/92 via-50% to-transparent',
      borderClass: 'border-white/[0.08] hover:border-indigo-500/40',
      glowColor: 'bg-indigo-500/10',
      fallbackImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // 6. Mentor / Wisdom
  if (text.includes('mentor') || text.includes('parent') || text.includes('guide')) {
    return {
      iconBadgeBg: 'bg-[#281d0f]/80 backdrop-blur-md',
      iconBadgeBorder: 'border-[#d97706]/30',
      icon: <Compass className="w-5 h-5 text-[#fbbf24]" strokeWidth={2.2} />,
      cardBaseBg: 'bg-[#17130b]',
      gradientOverlay: 'from-[#15110a] via-[#15110a]/92 via-50% to-transparent',
      borderClass: 'border-white/[0.08] hover:border-amber-500/40',
      glowColor: 'bg-amber-500/10',
      fallbackImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // 7. Roommate / Chores / Home
  if (text.includes('roommate') || text.includes('chore') || text.includes('home') || text.includes('household')) {
    return {
      iconBadgeBg: 'bg-[#0f2419]/80 backdrop-blur-md',
      iconBadgeBorder: 'border-[#059669]/30',
      icon: <Home className="w-5 h-5 text-[#34d399]" strokeWidth={2.2} />,
      cardBaseBg: 'bg-[#0b1712]',
      gradientOverlay: 'from-[#091510] via-[#091510]/92 via-50% to-transparent',
      borderClass: 'border-white/[0.08] hover:border-emerald-500/40',
      glowColor: 'bg-emerald-500/10',
      fallbackImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // Default / Custom Scenario
  return {
    iconBadgeBg: 'bg-[#221633]/80 backdrop-blur-md',
    iconBadgeBorder: 'border-[#a855f7]/30',
    icon: <Sparkles className="w-5 h-5 text-[#c084fc]" strokeWidth={2.2} />,
    cardBaseBg: 'bg-[#130f1c]',
    gradientOverlay: 'from-[#120e1a] via-[#120e1a]/92 via-50% to-transparent',
    borderClass: 'border-white/[0.08] hover:border-purple-500/40',
    glowColor: 'bg-purple-500/10',
    fallbackImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
  };
};

export function TalkingPartnerCard({
  scenario,
  onSelect,
  isCustom = false,
  onDeleteCustom,
  disabled = false
}: TalkingPartnerCardProps) {
  const [imageError, setImageError] = useState(false);
  const theme = getPartnerTheme(scenario);
  const imageSource = (!imageError && scenario.imageUrl) ? scenario.imageUrl : theme.fallbackImage;

  return (
    <motion.div
      whileHover={disabled ? undefined : { y: -3, scale: 1.008 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => {
        if (!disabled) onSelect(scenario);
      }}
      className={cn(
        "group relative w-full overflow-hidden rounded-[26px] sm:rounded-[30px] border",
        "min-h-[175px] sm:min-h-[195px] text-left transition-all duration-300 shadow-md",
        "cursor-pointer select-none",
        theme.cardBaseBg,
        theme.borderClass,
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Scenic Right-Half Photography */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[50%] overflow-hidden pointer-events-none">
        <img
          src={imageSource}
          alt={scenario.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Soft edge darkening to prevent hard image borders */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Atmospheric Left-to-Right Dark Gradient Wash for Pristine Text Contrast */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r pointer-events-none z-0",
          theme.gradientOverlay
        )} 
      />

      {/* Ambient Radial Corner Glow */}
      <div 
        className={cn(
          "w-48 h-48 rounded-full blur-3xl opacity-30 absolute -left-12 -bottom-12 pointer-events-none group-hover:opacity-50 transition-opacity",
          theme.glowColor
        )} 
      />

      {/* Top Right Custom Delete Button (if custom) */}
      {isCustom && onDeleteCustom && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCustom();
          }}
          className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-black/50 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 backdrop-blur-md transition-all cursor-pointer"
          title="Delete custom partner"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* Left Content Area */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full max-w-[68%] sm:max-w-[72%]">
        {/* Top-Left Squircle Badge */}
        <div 
          className={cn(
            "w-12 h-12 rounded-[18px] border flex items-center justify-center shadow-sm",
            "group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300",
            theme.iconBadgeBg,
            theme.iconBadgeBorder
          )}
        >
          {theme.icon}
        </div>

        {/* Middle Typography: Title & Subtitle */}
        <div className="mt-3 sm:mt-4 mb-2">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug group-hover:text-amber-100 transition-colors">
            {scenario.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/75 font-normal leading-relaxed mt-1 sm:mt-1.5 line-clamp-2">
            {scenario.description}
          </p>
        </div>
      </div>

      {/* Bottom-Right "Talk" Pill Button */}
      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20 pointer-events-none">
        <div 
          className={cn(
            "bg-[#f95716] group-hover:bg-[#ff6726] text-white font-bold text-xs sm:text-sm",
            "px-4 sm:px-5 py-2 sm:py-2.5 rounded-full",
            "flex items-center gap-1.5 shadow-lg shadow-black/40 group-hover:shadow-orange-500/25",
            "transition-all duration-300 group-hover:scale-105"
          )}
        >
          <Mic size={16} className="text-white shrink-0" strokeWidth={2.4} />
          <span className="tracking-wide">Talk</span>
        </div>
      </div>
    </motion.div>
  );
}
