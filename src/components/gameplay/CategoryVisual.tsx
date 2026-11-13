import React from 'react';
import type { Category } from '../../types/game';
import {
  Clapperboard,
  Gamepad2,
  Trophy,
  Globe,
  Utensils,
  Sparkles,
  PawPrint,
  Package,
  Briefcase,
  Medal,
  Tag,
  FolderPlus,
} from 'lucide-react';

export interface CategoryTheme {
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  gradientClass: string;
}

export const CATEGORY_VISUALS: Record<string, CategoryTheme> = {
  'cat-movies-series': {
    icon: Clapperboard,
    emoji: '🎬',
    bgClass: 'bg-purple-500/15',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    gradientClass: 'from-purple-500/20 to-indigo-500/10',
  },
  'cat-video-games': {
    icon: Gamepad2,
    emoji: '🎮',
    bgClass: 'bg-emerald-500/15',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    gradientClass: 'from-emerald-500/20 to-teal-500/10',
  },
  'cat-footballers': {
    icon: Trophy,
    emoji: '⚽',
    bgClass: 'bg-amber-500/15',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    gradientClass: 'from-amber-500/20 to-yellow-500/10',
  },
  'cat-countries-cities': {
    icon: Globe,
    emoji: '🌍',
    bgClass: 'bg-blue-500/15',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    gradientClass: 'from-blue-500/20 to-cyan-500/10',
  },
  'cat-food-drinks': {
    icon: Utensils,
    emoji: '🍕',
    bgClass: 'bg-orange-500/15',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
    gradientClass: 'from-orange-500/20 to-red-500/10',
  },
  'cat-celebrities-internet': {
    icon: Sparkles,
    emoji: '⭐',
    bgClass: 'bg-pink-500/15',
    textClass: 'text-pink-400',
    borderClass: 'border-pink-500/30',
    gradientClass: 'from-pink-500/20 to-rose-500/10',
  },
  'cat-animals': {
    icon: PawPrint,
    emoji: '🐾',
    bgClass: 'bg-lime-500/15',
    textClass: 'text-lime-400',
    borderClass: 'border-lime-500/30',
    gradientClass: 'from-lime-500/20 to-emerald-500/10',
  },
  'cat-daily-objects': {
    icon: Package,
    emoji: '📦',
    bgClass: 'bg-indigo-500/15',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/30',
    gradientClass: 'from-indigo-500/20 to-violet-500/10',
  },
  'cat-professions': {
    icon: Briefcase,
    emoji: '💼',
    bgClass: 'bg-cyan-500/15',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/30',
    gradientClass: 'from-cyan-500/20 to-sky-500/10',
  },
  'cat-sports': {
    icon: Medal,
    emoji: '🏅',
    bgClass: 'bg-red-500/15',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
    gradientClass: 'from-red-500/20 to-orange-500/10',
  },
};

const NAME_TO_ID: Record<string, string> = {
  'peliculas y series': 'cat-movies-series',
  'películas y series': 'cat-movies-series',
  'videojuegos': 'cat-video-games',
  'futbolistas': 'cat-footballers',
  'paises y ciudades': 'cat-countries-cities',
  'países y ciudades': 'cat-countries-cities',
  'comida y bebidas': 'cat-food-drinks',
  'celebridades e internet': 'cat-celebrities-internet',
  'animales': 'cat-animals',
  'objetos cotidianos': 'cat-daily-objects',
  'profesiones y oficios': 'cat-professions',
  'deportes': 'cat-sports',
};

const DEFAULT_CUSTOM_VISUAL: CategoryTheme = {
  icon: FolderPlus,
  emoji: '🏷️',
  bgClass: 'bg-accent-chaos/15',
  textClass: 'text-accent-chaos',
  borderClass: 'border-accent-chaos/30',
  gradientClass: 'from-accent-chaos/20 to-purple-500/10',
};

export function getCategoryVisual(categoryOrIdOrName?: Category | string | null): CategoryTheme {
  if (!categoryOrIdOrName) return DEFAULT_CUSTOM_VISUAL;

  const id = typeof categoryOrIdOrName === 'string' ? categoryOrIdOrName : categoryOrIdOrName.id;
  const name = typeof categoryOrIdOrName === 'object' ? categoryOrIdOrName.name : categoryOrIdOrName;
  const customIcon = typeof categoryOrIdOrName === 'object' ? categoryOrIdOrName.icon : undefined;

  if (id && CATEGORY_VISUALS[id]) {
    return CATEGORY_VISUALS[id];
  }

  if (name) {
    const matchedId = NAME_TO_ID[name.toLowerCase().trim()];
    if (matchedId && CATEGORY_VISUALS[matchedId]) {
      return CATEGORY_VISUALS[matchedId];
    }
  }

  if (customIcon) {
    return {
      ...DEFAULT_CUSTOM_VISUAL,
      emoji: customIcon,
      icon: Tag,
    };
  }

  return DEFAULT_CUSTOM_VISUAL;
}

export interface CategoryIconBadgeProps {
  category?: Category | string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showEmoji?: boolean;
}

export const CategoryIconBadge: React.FC<CategoryIconBadgeProps> = ({
  category,
  size = 'md',
  className = '',
  showEmoji = true,
}) => {
  const visual = getCategoryVisual(category);
  const IconComponent = visual.icon;

  const sizeMap = {
    sm: {
      container: 'w-7 h-7 rounded-lg text-xs',
      icon: 'w-3.5 h-3.5',
      emoji: 'text-[11px]',
    },
    md: {
      container: 'w-10 h-10 rounded-xl text-sm',
      icon: 'w-5 h-5',
      emoji: 'text-base',
    },
    lg: {
      container: 'w-12 h-12 rounded-2xl text-base',
      icon: 'w-6 h-6',
      emoji: 'text-xl',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 border ${visual.bgClass} ${visual.borderClass} ${visual.textClass} ${currentSize.container} shadow-sm ${className}`.trim()}
    >
      <IconComponent className={currentSize.icon} />
      {showEmoji && (
        <span
          className={`absolute -bottom-1 -right-1 leading-none select-none drop-shadow-sm ${currentSize.emoji}`}
          aria-hidden="true"
        >
          {visual.emoji}
        </span>
      )}
    </div>
  );
};
