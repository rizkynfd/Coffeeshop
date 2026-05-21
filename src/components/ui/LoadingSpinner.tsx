import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Memuat...',
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-label={label}
    >
      <Loader2
        className={cn('animate-spin text-amber-accent', sizeStyles[size])}
      />
      {label && (
        <span className="text-sm text-espresso-400">{label}</span>
      )}
    </div>
  );
}
