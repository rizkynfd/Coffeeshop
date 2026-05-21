'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  showShortcut?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, showShortcut = true, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso-400 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          className={cn(
            'w-full pl-10 pr-4 py-2.5 text-sm rounded-xl',
            'bg-white border border-espresso-200',
            'text-espresso-900 placeholder:text-espresso-400',
            'focus:outline-none focus:ring-2 focus:ring-amber-accent/30 focus:border-amber-accent',
            'transition-all duration-200',
            showShortcut && 'pr-20'
          )}
          {...props}
        />
        {showShortcut && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-espresso-400 bg-espresso-50 border border-espresso-200 rounded">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
