import { create } from 'zustand';
import { StockItem, StockMovement } from '@/types';
import { DbInventory } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';

// ── Mapper ──────────────────────────────────────────────────

function mapDbInventory(row: DbInventory): StockItem {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    currentStock: row.current_stock,
    minimumStock: row.minimum_stock,
    lastRestocked: row.last_restocked,
  };
}

// ── Store ───────────────────────────────────────────────────

interface InventoryState {
  stockItems: StockItem[];
  movements: StockMovement[];
  isLoading: boolean;

  fetchInventory: () => Promise<void>;
  addStockItem: (item: Omit<StockItem, 'id'>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  stockIn: (itemId: string, quantity: number, notes: string, recordedBy: string) => Promise<void>;
  stockOut: (itemId: string, quantity: number, notes: string, recordedBy: string) => Promise<void>;
  getLowStockItems: () => StockItem[];
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  stockItems: [],
  movements: [],
  isLoading: false,

  fetchInventory: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
      if (error) throw error;
      set({ stockItems: (data ?? []).map(mapDbInventory) });
    } catch (err) {
      console.error('fetchInventory error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addStockItem: async (item) => {
    const id = generateId();
    const { error } = await supabase.from('inventory').insert({
      id,
      name: item.name,
      unit: item.unit,
      current_stock: item.currentStock,
      minimum_stock: item.minimumStock,
      last_restocked: item.lastRestocked,
    });
    if (error) { console.error('addStockItem error:', error); return; }
    set((state) => ({ stockItems: [...state.stockItems, { ...item, id }] }));
  },

  deleteStockItem: async (id) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) { console.error('deleteStockItem error:', error); return; }
    set((state) => ({ stockItems: state.stockItems.filter((s) => s.id !== id) }));
  },

  stockIn: async (itemId, quantity, notes, recordedBy) => {
    const item = get().stockItems.find((s) => s.id === itemId);
    if (!item) return;
    const newStock = Number((item.currentStock + quantity).toFixed(3));
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('inventory')
      .update({ current_stock: newStock, last_restocked: today })
      .eq('id', itemId);
    if (error) { console.error('stockIn error:', error); return; }

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
        s.id === itemId ? { ...s, currentStock: newStock, lastRestocked: today } : s
      ),
      movements: [movement, ...state.movements],
    }));
  },

  stockOut: async (itemId, quantity, notes, recordedBy) => {
    const item = get().stockItems.find((s) => s.id === itemId);
    if (!item) return;
    const newStock = Math.max(0, Number((item.currentStock - quantity).toFixed(3)));

    const { error } = await supabase
      .from('inventory')
      .update({ current_stock: newStock })
      .eq('id', itemId);
    if (error) { console.error('stockOut error:', error); return; }

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
        s.id === itemId ? { ...s, currentStock: newStock } : s
      ),
      movements: [movement, ...state.movements],
    }));
  },

  getLowStockItems: () =>
    get().stockItems.filter((s) => s.currentStock <= s.minimumStock),
}));
