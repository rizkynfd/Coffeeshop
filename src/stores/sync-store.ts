import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;

  setOnline: (status: boolean) => void;
  setSyncing: (status: boolean) => void;
  setLastSyncedAt: (date: Date) => void;
  setError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  lastSyncedAt: null,
  error: null,

  setOnline: (status) => set({ isOnline: status }),
  setSyncing: (status) => set({ isSyncing: status }),
  setLastSyncedAt: (date) => set({ lastSyncedAt: date, error: null }),
  setError: (error) => set({ error, isSyncing: false }),
}));
