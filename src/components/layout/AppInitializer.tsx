'use client';

import { useEffect } from 'react';
import { useMenuStore } from '@/stores/menu-store';
import { useCustomerStore } from '@/stores/customer-store';
import { useOrderStore } from '@/stores/order-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShiftStore } from '@/stores/shift-store';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';

/**
 * AppInitializer — mounts once inside AppShell after auth is confirmed.
 * Waits for Supabase to fully restore its own session before fetching data,
 * preventing empty products on page refresh due to RLS blocking unauthenticated queries.
 */
export function AppInitializer() {
  const fetchMenuData = useMenuStore((s) => s.fetchMenuData);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const fetchTodayOrders = useOrderStore((s) => s.fetchTodayOrders);
  const subscribeToOrders = useOrderStore((s) => s.subscribeToOrders);
  const fetchInventory = useInventoryStore((s) => s.fetchInventory);
  const fetchActiveShift = useShiftStore((s) => s.fetchActiveShift);
  const fetchShiftHistory = useShiftStore((s) => s.fetchShiftHistory);
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) return;

    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      // Force Supabase client to restore its own session from localStorage
      // before making any authenticated queries.
      // Without this, RLS-protected tables (like products) return empty on refresh.
      await supabase.auth.getSession();

      // Now it's safe to fetch all data in parallel
      await Promise.all([
        fetchMenuData(),
        fetchCustomers(),
        fetchTodayOrders(),
        fetchInventory(),
        fetchActiveShift(),
        fetchShiftHistory(),
      ]);

      // Subscribe to realtime orders (kanban)
      unsubscribe = subscribeToOrders();
    };

    void init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return null;
}
