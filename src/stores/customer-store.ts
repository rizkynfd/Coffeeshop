import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '@/types';
import { mockCustomers } from '@/data/mock-customers';
import { generateId } from '@/lib/utils';

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent' | 'totalOrders' | 'favoriteItems' | 'joinedAt' | 'lastVisit'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getById: (id: string) => Customer | undefined;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: mockCustomers,

      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: generateId(),
          loyaltyPoints: 0,
          totalSpent: 0,
          totalOrders: 0,
          favoriteItems: [],
          joinedAt: new Date().toISOString(),
          lastVisit: new Date().toISOString(),
        };
        set((state) => ({ customers: [newCustomer, ...state.customers] }));
      },

      updateCustomer: (id, updates) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },

      getById: (id) => {
        return get().customers.find((c) => c.id === id);
      },
    }),
    {
      name: 'customer-storage',
    }
  )
);
