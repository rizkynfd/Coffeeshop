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

// ── Mapper — maps actual DB columns → app Shift shape ────────
// DB columns: id, user_id, user_name, start_time, end_time,
//             opening_cash, closing_cash, total_sales,
//             total_transactions, is_active

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbShift(row: any): Shift {
  return {
    id: row.id,
    cashierName: row.user_name ?? '',
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    startingCash: row.opening_cash ?? 0,
    // expected cash = opening + sales so far
    expectedCash: (row.opening_cash ?? 0) + (row.total_sales ?? 0),
    actualCash: row.closing_cash ?? undefined,
    status: row.is_active ? 'active' : 'closed',
    transactions: row.total_transactions ?? 0,
    revenue: row.total_sales ?? 0,
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
  updateShiftStats: (revenue: number, transactions: number) => void;
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
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      set({ activeShift: data ? mapDbShift(data) : null });
    } catch (err) {
      console.error('fetchActiveShift error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchShiftHistory: async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('is_active', false)
        .order('start_time', { ascending: false })
        .limit(20);
      if (error) throw error;
      set({ history: (data ?? []).map(mapDbShift) });
    } catch (err) {
      console.error('fetchShiftHistory error:', err);
    }
  },

  openShift: async (cashierName, startingCash) => {
    const auth = useAuthStore.getState();
    const id = generateId();
    const now = new Date();

    const { error } = await supabase.from('shifts').insert({
      id,
      user_id: auth.user?.id ?? null,
      user_name: cashierName,
      start_time: now.toISOString(),
      opening_cash: startingCash,
      total_sales: 0,
      total_transactions: 0,
      is_active: true,
    });

    if (error) {
      console.error('openShift error:', error);
      return;
    }

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
        closing_cash: actualCash,
        is_active: false,
      })
      .eq('id', activeShift.id);

    if (error) {
      console.error('closeShift error:', error);
      return;
    }

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

  // Stays synchronous for in-session speed — Supabase updated async
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
          total_sales: updated.revenue,
          total_transactions: updated.transactions,
        })
        .eq('id', updated.id)
        .then(({ error }) => {
          if (error) console.error('updateShiftStats sync error:', error);
        });
      return { activeShift: updated };
    });
  },
}));
