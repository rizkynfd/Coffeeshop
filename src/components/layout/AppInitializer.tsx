'use client';

import { useEffect, useRef } from 'react';
import { useMenuStore } from '@/stores/menu-store';
import { useCustomerStore } from '@/stores/customer-store';
import { useOrderStore } from '@/stores/order-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShiftStore } from '@/stores/shift-store';
import { supabase } from '@/lib/supabase';

/**
 * AppInitializer — handles two scenarios:
 * 1. Page refresh: INITIAL_SESSION already fired before this component mounts.
 *    Fix → call getSession() directly on mount to get the current session.
 * 2. First login: SIGNED_IN event fires after mount.
 *    Fix → onAuthStateChange listener catches it.
 *
 * hasFetched ref prevents double-fetching if both paths trigger.
 */
export function AppInitializer() {
  const fetchMenuData = useMenuStore((s) => s.fetchMenuData);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const fetchTodayOrders = useOrderStore((s) => s.fetchTodayOrders);
  const subscribeToOrders = useOrderStore((s) => s.subscribeToOrders);
  const fetchInventory = useInventoryStore((s) => s.fetchInventory);
  const fetchActiveShift = useShiftStore((s) => s.fetchActiveShift);
  const fetchShiftHistory = useShiftStore((s) => s.fetchShiftHistory);

  const hasFetched = useRef(false);
  const unsubOrders = useRef<(() => void) | null>(null);

  const doFetch = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    await Promise.all([
      fetchMenuData(),
      fetchCustomers(),
      fetchTodayOrders(),
      fetchInventory(),
      fetchActiveShift(),
      fetchShiftHistory(),
    ]);

    unsubOrders.current = subscribeToOrders();
  };

  useEffect(() => {
    // --- Path 1: Handle refresh (INITIAL_SESSION already fired) ---
    // getSession() reads Supabase session from localStorage cache.
    // After await, the Supabase client has its JWT set → RLS queries work.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) void doFetch();
    });

    // --- Path 2: Handle fresh login (SIGNED_IN fires after mount) ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          void doFetch();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (unsubOrders.current) unsubOrders.current();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
