import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StockItem, StockMovement, StockMovementType } from '@/types';
import { generateId } from '@/lib/utils';

const initialStock: StockItem[] = [
  { id: 's1', name: 'Biji Kopi Arabika', unit: 'kg', currentStock: 5.2, minimumStock: 3, lastRestocked: '2025-05-18' },
  { id: 's2', name: 'Biji Kopi Robusta', unit: 'kg', currentStock: 2.1, minimumStock: 3, lastRestocked: '2025-05-17' },
  { id: 's3', name: 'Susu Full Cream', unit: 'liter', currentStock: 12, minimumStock: 5, lastRestocked: '2025-05-20' },
  { id: 's4', name: 'Susu Oat', unit: 'liter', currentStock: 3, minimumStock: 2, lastRestocked: '2025-05-19' },
  { id: 's5', name: 'Matcha Powder', unit: 'gram', currentStock: 180, minimumStock: 200, lastRestocked: '2025-05-15' },
  { id: 's6', name: 'Coklat Bubuk', unit: 'gram', currentStock: 450, minimumStock: 200, lastRestocked: '2025-05-16' },
  { id: 's7', name: 'Gula Pasir', unit: 'kg', currentStock: 8, minimumStock: 3, lastRestocked: '2025-05-18' },
  { id: 's8', name: 'Gula Aren Cair', unit: 'liter', currentStock: 1.2, minimumStock: 2, lastRestocked: '2025-05-14' },
  { id: 's9', name: 'Whipped Cream', unit: 'kaleng', currentStock: 4, minimumStock: 3, lastRestocked: '2025-05-19' },
  { id: 's10', name: 'Boba Pearl', unit: 'gram', currentStock: 300, minimumStock: 500, lastRestocked: '2025-05-13' },
  { id: 's11', name: 'Cup Plastik M', unit: 'pcs', currentStock: 180, minimumStock: 100, lastRestocked: '2025-05-17' },
  { id: 's12', name: 'Cup Plastik L', unit: 'pcs', currentStock: 95, minimumStock: 100, lastRestocked: '2025-05-17' },
];

interface InventoryState {
  stockItems: StockItem[];
  movements: StockMovement[];

  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  deleteStockItem: (id: string) => void;
  stockIn: (itemId: string, quantity: number, notes: string, recordedBy: string) => void;
  stockOut: (itemId: string, quantity: number, notes: string, recordedBy: string) => void;
  getLowStockItems: () => StockItem[];
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      stockItems: initialStock,
      movements: [],

      addStockItem: (item) => {
        const newItem: StockItem = { ...item, id: generateId() };
        set((state) => ({ stockItems: [...state.stockItems, newItem] }));
      },

      deleteStockItem: (id) => {
        set((state) => ({ stockItems: state.stockItems.filter((s) => s.id !== id) }));
      },

      stockIn: (itemId, quantity, notes, recordedBy) => {
        const movement: StockMovement = {
          id: generateId(),
          stockItemId: itemId,
          type: 'in',
          quantity,
          notes,
          recordedBy,
          recordedAt: new Date().toISOString(),
        };
        set((state) => ({
          stockItems: state.stockItems.map((s) =>
            s.id === itemId
              ? {
                  ...s,
                  currentStock: Number((s.currentStock + quantity).toFixed(3)),
                  lastRestocked: new Date().toISOString().split('T')[0],
                }
              : s
          ),
          movements: [movement, ...state.movements],
        }));
      },

      stockOut: (itemId, quantity, notes, recordedBy) => {
        const item = get().stockItems.find((s) => s.id === itemId);
        if (!item) return;
        const movement: StockMovement = {
          id: generateId(),
          stockItemId: itemId,
          type: 'out',
          quantity,
          notes,
          recordedBy,
          recordedAt: new Date().toISOString(),
        };
        set((state) => ({
          stockItems: state.stockItems.map((s) =>
            s.id === itemId
              ? { ...s, currentStock: Math.max(0, Number((s.currentStock - quantity).toFixed(3))) }
              : s
          ),
          movements: [movement, ...state.movements],
        }));
      },

      getLowStockItems: () => {
        return get().stockItems.filter((s) => s.currentStock <= s.minimumStock);
      },
    }),
    {
      name: 'inventory-storage',
    }
  )
);
