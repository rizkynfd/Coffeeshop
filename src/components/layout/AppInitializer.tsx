'use client';

import { useEffect, useRef } from 'react';
import { useMenuStore } from '@/stores/menu-store';
import { useCustomerStore } from '@/stores/customer-store';
import { useOrderStore } from '@/stores/order-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShiftStore } from '@/stores/shift-store';
import { supabase } from '@/lib/supabase';

/**
 * AppInitializer — listens to Supabase's own auth state change event.
 * 'INITIAL_SESSION' fires once Supabase has fully restored its session
 * from localStorage — the only reliable signal that RLS-protected queries
 * will work. Using Zustand userId caused a race condition on refresh.
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
  const unsubscribeOrders = useRef<(() => void) | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Fire on initial session restore OR on sign-in
        // Only fetch once per mount to avoid duplicate requests
        if (
          (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') &&
          session &&
          !hasFetched.current
        ) {
          hasFetched.current = true;

          await Promise.all([
            fetchMenuData(),
            fetchCustomers(),
            fetchTodayOrders(),
            fetchInventory(),
            fetchActiveShift(),
            fetchShiftHistory(),
          ]);

          unsubscribeOrders.current = subscribeToOrders();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (unsubscribeOrders.current) unsubscribeOrders.current();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
