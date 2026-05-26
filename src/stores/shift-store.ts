import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';
import { useAuthStore } from './auth-store';

export interface Shift {
  id: string;
  cashierName: string;
  startTime: Date;
  endTime?: Date;
  startingCash: number;
  expectedCash: number;
  actualCash?: number;
  status: 'active' | 'closed';
  transactions: number;
  revenue: number;
}

// ── Mapper ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbShift(row: any): Shift {
  return {
    id: row.id,
    cashierName: row.cashier_name,
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    startingCash: row.starting_cash,
    expectedCash: row.expected_cash,
    actualCash: row.actual_cash ?? undefined,
    status: row.status,
    transactions: row.transactions,
    revenue: row.revenue,
  };
}

// ── Store ───────────────────────────────────────────────────

interface ShiftState {
  activeShift: Shift | null;
  history: Shift[];
  isLoading: boolean;

  fetchActiveShift: () => Promise<void>;
  fetchShiftHistory: () => Promise<void>;
  openShift: (cashierName: string, startingCash: number) => Promise<void>;
  closeShift: (actualCash: number) => Promise<void>;
  updateShiftStats: (revenue: number, transactions: number) => void; // stays sync for POS speed
}

export const useShiftStore = create<ShiftState>()((set, get) => ({
  activeShift: null,
  history: [],
  isLoading: false,

  fetchActiveShift: async () => {
    const auth = useAuthStore.getState();
    if (!auth.user) return;
    set({ isLoading: true });
    try {
      const { data } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'active')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();
      set({ activeShift: data ? mapDbShift(data) : null });
    } catch (err) {
      console.error('fetchActiveShift error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchShiftHistory: async () => {
    try {
      const { data } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'closed')
        .order('start_time', { ascending: false })
        .limit(20);
      set({ history: (data ?? []).map(mapDbShift) });
    } catch (err) {
      console.error('fetchShiftHistory error:', err);
    }
  },

  openShift: async (cashierName, startingCash) => {
    const auth = useAuthStore.getState();
    const id = generateId();
    const now = new Date();
    const newShift: Shift = {
      id,
      cashierName,
      startTime: now,
      startingCash,
      expectedCash: startingCash,
      status: 'active',
      transactions: 0,
      revenue: 0,
    };
    const { error } = await supabase.from('shifts').insert({
      id,
      user_id: auth.user?.id ?? 'unknown',
      cashier_name: cashierName,
      start_time: now.toISOString(),
      starting_cash: startingCash,
      expected_cash: startingCash,
      status: 'active',
      transactions: 0,
      revenue: 0,
    });
    if (error) { console.error('openShift error:', error); return; }
    set({ activeShift: newShift });
  },

  closeShift: async (actualCash) => {
    const { activeShift } = get();
    if (!activeShift) return;
    const now = new Date();
    const { error } = await supabase
      .from('shifts')
      .update({
        end_time: now.toISOString(),
        actual_cash: actualCash,
        status: 'closed',
      })
      .eq('id', activeShift.id);
    if (error) { console.error('closeShift error:', error); return; }
    const closedShift: Shift = {
      ...activeShift,
      endTime: now,
      actualCash,
      status: 'closed',
    };
    set((state) => ({
      activeShift: null,
      history: [closedShift, ...state.history],
    }));
  },

  // Stays synchronous for in-session speed — Supabase updated at shift close
  updateShiftStats: (revenue, transactions) => {
    set((state) => {
      if (!state.activeShift) return state;
      const updated: Shift = {
        ...state.activeShift,
        revenue: state.activeShift.revenue + revenue,
        transactions: state.activeShift.transactions + transactions,
        expectedCash:
          state.activeShift.startingCash +
          state.activeShift.revenue +
          revenue,
      };
      // Fire-and-forget update to Supabase (non-blocking)
      supabase
        .from('shifts')
        .update({
          revenue: updated.revenue,
          transactions: updated.transactions,
          expected_cash: updated.expectedCash,
        })
        .eq('id', updated.id)
        .then(({ error }) => {
          if (error) console.error('updateShiftStats sync error:', error);
        });
      return { activeShift: updated };
    });
  },
}));
