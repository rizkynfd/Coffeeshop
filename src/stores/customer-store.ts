import { create } from 'zustand';
import { Customer } from '@/types';
import { DbCustomer } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';

// ── Mapper ──────────────────────────────────────────────────

function mapDbCustomer(row: DbCustomer): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    loyaltyPoints: row.loyalty_points,
    totalSpent: row.total_spent,
    totalOrders: row.total_orders,
    favoriteItems:
      typeof row.favorite_items === 'string'
        ? JSON.parse(row.favorite_items)
        : row.favorite_items ?? [],
    joinedAt: row.joined_at,
    lastVisit: row.last_visit,
  };
}

// ── Store ───────────────────────────────────────────────────

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;

  fetchCustomers: () => Promise<void>;
  addCustomer: (
    customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent' | 'totalOrders' | 'favoriteItems' | 'joinedAt' | 'lastVisit'>
  ) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getById: (id: string) => Customer | undefined;
}

export const useCustomerStore = create<CustomerState>()((set, get) => ({
  customers: [],
  isLoading: false,

  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (error) throw error;
      set({ customers: (data ?? []).map(mapDbCustomer) });
    } catch (err) {
      console.error('fetchCustomers error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addCustomer: async (customerData) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...customerData,
      id,
      loyaltyPoints: 0,
      totalSpent: 0,
      totalOrders: 0,
      favoriteItems: [],
      joinedAt: now,
      lastVisit: now,
    };
    const { error } = await supabase.from('customers').insert({
      id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email ?? null,
      loyalty_points: 0,
      total_spent: 0,
      total_orders: 0,
      favorite_items: JSON.stringify([]),
      joined_at: now,
      last_visit: now,
    });
    if (error) { console.error('addCustomer error:', error); return; }
    set((state) => ({ customers: [newCustomer, ...state.customers] }));
  },

  updateCustomer: async (id, updates) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email ?? null;
    if (updates.loyaltyPoints !== undefined) dbUpdates.loyalty_points = updates.loyaltyPoints;
    if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent;
    if (updates.totalOrders !== undefined) dbUpdates.total_orders = updates.totalOrders;
    if (updates.favoriteItems !== undefined) dbUpdates.favorite_items = JSON.stringify(updates.favoriteItems);
    if (updates.lastVisit !== undefined) dbUpdates.last_visit = updates.lastVisit;

    const { error } = await supabase.from('customers').update(dbUpdates).eq('id', id);
    if (error) { console.error('updateCustomer error:', error); return; }
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  deleteCustomer: async (id) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) { console.error('deleteCustomer error:', error); return; }
    set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
  },

  getById: (id) => {
    return get().customers.find((c) => c.id === id);
  },
}));
