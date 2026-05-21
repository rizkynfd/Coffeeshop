'use client';

import { useSyncStore } from '@/stores/sync-store';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function SyncIndicator() {
  const { isOnline, isSyncing, error } = useSyncStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-slate-200">
      {isSyncing ? (
        <>
          <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
          <span className="text-xs font-medium text-slate-600">Syncing...</span>
        </>
      ) : !isOnline ? (
        <>
          <CloudOff className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-medium text-slate-600">Offline</span>
        </>
      ) : error ? (
        <>
          <CloudOff className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-medium text-rose-600 truncate max-w-[150px]" title={error}>
            Sync Error
          </span>
        </>
      ) : (
        <>
          <Cloud className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium text-slate-600">Online</span>
        </>
      )}
    </div>
  );
}
