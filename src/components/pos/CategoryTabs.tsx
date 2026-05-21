'use client';

import { cn } from '@/lib/utils';
import { categories } from '@/data/mock-products';
import {
  Coffee,
  Filter,
  CupSoda,
  Leaf,
  UtensilsCrossed,
  Croissant,
  Star,
  Grid3X3,
} from 'lucide-react';
import type { ReactNode } from 'react';

const iconMap: Record<string, ReactNode> = {
  Coffee: <Coffee className="w-4 h-4" />,
  Filter: <Filter className="w-4 h-4" />,
  CupSoda: <CupSoda className="w-4 h-4" />,
  Leaf: <Leaf className="w-4 h-4" />,
  UtensilsCrossed: <UtensilsCrossed className="w-4 h-4" />,
  Croissant: <Croissant className="w-4 h-4" />,
};

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const allTabs = [
    { id: 'all', name: 'Semua', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'popular', name: 'Populer', icon: <Star className="w-4 h-4" /> },
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: iconMap[cat.icon] || <Coffee className="w-4 h-4" />,
    })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {allTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onCategoryChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0',
            activeCategory === tab.id
              ? 'bg-espresso-900 text-cream shadow-card'
              : 'bg-white text-espresso-600 border border-espresso-200 hover:bg-espresso-50 hover:border-espresso-300'
          )}
        >
          <span
            className={cn(
              activeCategory === tab.id
                ? 'text-amber-accent'
                : 'text-espresso-400'
            )}
          >
            {tab.icon}
          </span>
          {tab.name}
        </button>
      ))}
    </div>
  );
}
