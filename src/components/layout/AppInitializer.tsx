'use client';

import { useEffect } from 'react';
import { useMenuStore } from '@/stores/menu-store';
import { useCustomerStore } from '@/stores/customer-store';
import { useOrderStore } from '@/stores/order-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShiftStore } from '@/stores/shift-store';

/**
 * AppInitializer — mounts once inside AppShell after auth is confirmed.
 * Fetches all required data from Supabase and subscribes to realtime orders.
 */
export function AppInitializer() {
  const fetchMenuData = useMenuStore((s) => s.fetchMenuData);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const fetchTodayOrders = useOrderStore((s) => s.fetchTodayOrders);
  const subscribeToOrders = useOrderStore((s) => s.subscribeToOrders);
  const fetchInventory = useInventoryStore((s) => s.fetchInventory);
  const fetchActiveShift = useShiftStore((s) => s.fetchActiveShift);
  const fetchShiftHistory = useShiftStore((s) => s.fetchShiftHistory);

  useEffect(() => {
    // Initial data fetch — all in parallel
    void Promise.all([
      fetchMenuData(),
      fetchCustomers(),
      fetchTodayOrders(),
      fetchInventory(),
      fetchActiveShift(),
      fetchShiftHistory(),
    ]);

    // Subscribe to realtime orders (kanban)
    const unsubscribe = subscribeToOrders();
    return () => { unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // renders nothing
}
