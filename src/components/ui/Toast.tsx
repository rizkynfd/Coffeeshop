'use client';

import { useToastStore, type ToastVariant } from '@/stores/toast-store';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; bg: string; border: string; text: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-accent shrink-0" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-rose-accent shrink-0" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-accent shrink-0" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
  },
  info: {
    icon: <Info className="w-5 h-5 text-sky-accent shrink-0" />,
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-900',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const config = variantConfig[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card-hover animate-slide-in-right pointer-events-auto',
              config.bg,
              config.border
            )}
            role="alert"
          >
            {config.icon}
            <p className={cn('text-sm font-medium flex-1', config.text)}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4 text-espresso-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
