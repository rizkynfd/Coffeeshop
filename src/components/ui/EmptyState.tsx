import { cn } from '@/lib/utils';
import { Coffee } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="w-16 h-16 mb-4 rounded-2xl bg-espresso-100 flex items-center justify-center text-espresso-400">
        {icon || <Coffee className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-espresso-700 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-espresso-400 max-w-xs mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
