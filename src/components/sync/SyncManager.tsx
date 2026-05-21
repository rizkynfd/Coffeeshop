'use client';

import { useEffect, useRef } from 'react';
import { useSyncStore } from '@/stores/sync-store';
import { useMenuStore } from '@/stores/menu-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useCustomerStore } from '@/stores/customer-store';
import { useOrderStore } from '@/stores/order-store';
import { useShiftStore } from '@/stores/shift-store';
import { supabase } from '@/lib/supabase';

export function SyncManager() {
  const { isOnline, setOnline, setSyncing, setLastSyncedAt, setError } = useSyncStore();
  
  // Gunakan ref untuk menghindari re-renders tak terduga pada sinkronisasi
  const isInitialPullDone = useRef(false);

  useEffect(() => {
    // Listener untuk Online / Offline browser
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // INITIAL PULL (Hanya Sekali saat aplikasi dimuat & jika data lokal kosong)
  useEffect(() => {
    const initialPull = async () => {
      if (!isOnline || isInitialPullDone.current) return;

      try {
        setSyncing(true);

        // Cek data lokal
        const menuStore = useMenuStore.getState();
        const inventoryStore = useInventoryStore.getState();
        const customerStore = useCustomerStore.getState();

        // Tarik Menu jika kosong
        if (menuStore.products.length === 0 && menuStore.categories.length === 0) {
          const { data: categories } = await supabase.from('categories').select('*');
          const { data: products } = await supabase.from('products').select('*');
          
          if (categories && categories.length > 0) {
            useMenuStore.setState({ categories });
          }
          if (products && products.length > 0) {
            useMenuStore.setState({ products });
          }
        }

        // Tarik Inventory jika kosong
        if (inventoryStore.stockItems.length === 0) {
          const { data: stockItems } = await supabase.from('inventory').select('*');
          if (stockItems && stockItems.length > 0) {
            useInventoryStore.setState({ stockItems });
          }
        }

        // Tarik Customer jika kosong
        if (customerStore.customers.length === 0) {
          const { data: customers } = await supabase.from('customers').select('*');
          if (customers && customers.length > 0) {
            useCustomerStore.setState({ 
              customers: customers.map(c => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                email: c.email,
                loyaltyPoints: c.loyalty_points,
                totalSpent: c.total_spent,
                totalOrders: c.total_orders,
                favoriteItems: c.favorite_items || [],
                joinedAt: c.joined_at,
                lastVisit: c.last_visit,
              }))
            });
          }
        }

        setLastSyncedAt(new Date());
        isInitialPullDone.current = true;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSyncing(false);
      }
    };

    initialPull();
  }, [isOnline, setSyncing, setLastSyncedAt, setError]);

  // EAGER SYNC SUBSCRIPTIONS (Lokal -> Supabase)
  useEffect(() => {
    // Utility debounce (sederhana) untuk tidak spam API jika banyak perubahan cepat
    let timeout: NodeJS.Timeout;
    
    const pushToSupabase = async (table: string, data: any) => {
      if (!useSyncStore.getState().isOnline) return;
      
      try {
        setSyncing(true);
        // Supabase upsert (membutuhkan data berbentuk array of objects)
        const { error } = await supabase.from(table).upsert(data);
        if (error) throw error;
        setLastSyncedAt(new Date());
      } catch (err: any) {
        console.error(`Sync error on ${table}:`, err);
        setError(err.message);
      } finally {
        setSyncing(false);
      }
    };

    const unsubMenu = useMenuStore.subscribe((state) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (state.products.length > 0) pushToSupabase('products', state.products);
        if (state.categories.length > 0) pushToSupabase('categories', state.categories);
      }, 2000);
    });

    const unsubInventory = useInventoryStore.subscribe((state) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (state.stockItems.length > 0) pushToSupabase('inventory', state.stockItems);
      }, 2000);
    });

    const unsubCustomer = useCustomerStore.subscribe((state) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (state.customers.length > 0) {
          const formatted = state.customers.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            loyalty_points: c.loyaltyPoints,
            total_spent: c.totalSpent,
            total_orders: c.totalOrders,
            favorite_items: c.favoriteItems,
            joined_at: c.joinedAt,
            last_visit: c.lastVisit,
          }));
          pushToSupabase('customers', formatted);
        }
      }, 2000);
    });

    const unsubOrder = useOrderStore.subscribe((state) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (state.orders.length > 0) {
          const formatted = state.orders.map(o => ({
            id: o.id,
            order_number: o.orderNumber,
            customer_id: o.customerId,
            customer_name: o.customerName,
            cashier_id: o.cashierId,
            cashier_name: o.cashierName,
            type: o.type,
            table_number: o.tableNumber,
            status: o.status,
            items: o.items,
            subtotal: o.subtotal,
            discount_amount: o.discount,
            discount_label: o.discountLabel,
            tax: o.tax,
            total: o.total,
            payments: o.payments,
            created_at: o.createdAt,
            completed_at: o.completedAt,
          }));
          pushToSupabase('orders', formatted);
        }
      }, 2000);
    });

    const unsubShift = useShiftStore.subscribe((state) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const shiftsToSync = [];
        if (state.activeShift) shiftsToSync.push(state.activeShift);
        if (state.history.length > 0) shiftsToSync.push(...state.history);
        
        if (shiftsToSync.length > 0) {
          const formatted = shiftsToSync.map(s => ({
            id: s.id,
            cashier_name: s.cashierName,
            start_time: s.startTime,
            end_time: s.endTime,
            starting_cash: s.startingCash,
            expected_cash: s.expectedCash,
            actual_cash: s.actualCash,
            status: s.status,
            transactions: s.transactions,
            revenue: s.revenue,
          }));
          pushToSupabase('shifts', formatted);
        }
      }, 2000);
    });

    return () => {
      unsubMenu();
      unsubInventory();
      unsubCustomer();
      unsubOrder();
      unsubShift();
      clearTimeout(timeout);
    };
  }, [setSyncing, setLastSyncedAt, setError]);

  return null;
}
