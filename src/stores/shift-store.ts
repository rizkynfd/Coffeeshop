import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

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

interface ShiftState {
  activeShift: Shift | null;
  history: Shift[];
  openShift: (cashierName: string, startingCash: number) => void;
  closeShift: (actualCash: number) => void;
  updateShiftStats: (revenue: number, transactions: number) => void;
}

const mockHistory: Shift[] = [
  { 
    id: 'sh-000', 
    cashierName: 'Dimas Aditya', 
    startTime: new Date('2026-05-19T15:00:00'), 
    endTime: new Date('2026-05-19T23:00:00'), 
    startingCash: 500000,
    expectedCash: 4700000,
    actualCash: 4700000,
    status: 'closed',
    revenue: 4200000,
    transactions: 45
  },
  { 
    id: 'sh-999', 
    cashierName: 'Rizky Putra', 
    startTime: new Date('2026-05-19T07:30:00'), 
    endTime: new Date('2026-05-19T15:00:00'), 
    startingCash: 500000,
    expectedCash: 4350000,
    actualCash: 4335000,
    status: 'closed',
    revenue: 3850000,
    transactions: 38
  },
];

export const useShiftStore = create<ShiftState>()(
  persist(
    (set) => ({
      activeShift: null, // start with no active shift
      history: mockHistory,

      openShift: (cashierName, startingCash) => {
        const newShift: Shift = {
          id: generateId(),
          cashierName,
          startTime: new Date(),
          startingCash,
          expectedCash: startingCash,
          status: 'active',
          transactions: 0,
          revenue: 0,
        };
        set({ activeShift: newShift });
      },

      closeShift: (actualCash) => {
        set((state) => {
          if (!state.activeShift) return state;

          const closedShift: Shift = {
            ...state.activeShift,
            endTime: new Date(),
            actualCash,
            status: 'closed',
          };

          return {
            activeShift: null,
            history: [closedShift, ...state.history],
          };
        });
      },

      updateShiftStats: (revenue, transactions) => {
        set((state) => {
          if (!state.activeShift) return state;
          return {
            activeShift: {
              ...state.activeShift,
              revenue: state.activeShift.revenue + revenue,
              transactions: state.activeShift.transactions + transactions,
              expectedCash: state.activeShift.startingCash + state.activeShift.revenue + revenue,
            },
          };
        });
      },
    }),
    {
      name: 'shift-storage',
    }
  )
);
