import { create } from 'zustand';
import { Order, OrderStatus, Payment } from '@/types';
import { DbOrder } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { generateId, generateOrderNumber } from '@/lib/utils';
import { useCartStore } from './cart-store';
import { useAuthStore } from './auth-store';
import { useShiftStore } from './shift-store';
import { useCustomerStore } from './customer-store';
import { useMenuStore } from './menu-store';
import { useInventoryStore } from './inventory-store';

// ── Mapper ──────────────────────────────────────────────────

function mapDbOrder(row: DbOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    type: row.type as Order['type'],
    tableNumber: row.table_number ?? undefined,
    status: row.status as OrderStatus,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    customerId: row.customer_id ?? undefined,
    customerName: row.customer_name ?? undefined,
    subtotal: row.subtotal,
    discount: row.discount,
    discountLabel: row.discount_label ?? undefined,
    tax: row.tax,
    total: row.total,
    payments: typeof row.payments === 'string' ? JSON.parse(row.payments) : row.payments,
    cashierId: row.cashier_id,
    cashierName: row.cashier_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  };
}

// ── Store ───────────────────────────────────────────────────

interface OrderState {
  orders: Order[];
  isLoading: boolean;

  fetchTodayOrders: () => Promise<void>;
  subscribeToOrders: () => () => void; // returns unsubscribe fn
  addOrder: (payments: Payment[]) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  voidOrder: (orderId: string) => Promise<boolean>;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getActiveOrders: () => Order[];
  getTodayOrders: () => Order[];
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  isLoading: false,

  fetchTodayOrders: async () => {
    set({ isLoading: true });
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${today}T00:00:00Z`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ orders: (data ?? []).map(mapDbOrder) });
    } catch (err) {
      console.error('fetchTodayOrders error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToOrders: () => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          if (eventType === 'INSERT') {
            const order = mapDbOrder(newRow as DbOrder);
            set((state) => {
              const exists = state.orders.some((o) => o.id === order.id);
              if (exists) return state;
              return { orders: [order, ...state.orders] };
            });
          } else if (eventType === 'UPDATE') {
            const order = mapDbOrder(newRow as DbOrder);
            set((state) => ({
              orders: state.orders.map((o) => (o.id === order.id ? order : o)),
            }));
          } else if (eventType === 'DELETE') {
            set((state) => ({
              orders: state.orders.filter((o) => o.id !== (oldRow as DbOrder).id),
            }));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  addOrder: async (payments) => {
    const cart = useCartStore.getState();
    const auth = useAuthStore.getState();

    const newOrder: Order = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      type: cart.orderType,
      tableNumber: cart.tableNumber ?? undefined,
      status: 'pending',
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        size: item.size,
        temperature: item.temperature,
        sugarLevel: item.sugarLevel,
        milkType: item.milkType,
        modifiers: item.modifiers,
        notes: item.notes,
        unitPrice: item.unitPrice,
        subtotal:
          (item.unitPrice + item.modifiers.reduce((sum, m) => sum + m.price, 0)) *
          item.quantity,
      })),
      customerId: cart.customerId ?? undefined,
      customerName: cart.customerName || undefined,
      subtotal: cart.getSubtotal(),
      discount: cart.getDiscountAmount(),
      discountLabel: cart.discount?.label,
      tax: cart.getTax(),
      total: cart.getTotal(),
      payments,
      cashierId: auth.user?.id || 'unknown',
      cashierName: auth.user?.name || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Persist to Supabase
    const { error } = await supabase.from('orders').insert({
      id: newOrder.id,
      order_number: newOrder.orderNumber,
      type: newOrder.type,
      table_number: newOrder.tableNumber ?? null,
      status: newOrder.status,
      items: JSON.stringify(newOrder.items),
      customer_id: newOrder.customerId ?? null,
      customer_name: newOrder.customerName ?? null,
      subtotal: newOrder.subtotal,
      discount: newOrder.discount,
      discount_label: newOrder.discountLabel ?? null,
      tax: newOrder.tax,
      total: newOrder.total,
      payments: JSON.stringify(newOrder.payments),
      cashier_id: newOrder.cashierId,
      cashier_name: newOrder.cashierName,
      created_at: newOrder.createdAt,
      updated_at: newOrder.updatedAt,
      completed_at: null,
    });
    if (error) {
      console.error('addOrder error:', error);
      throw error;
    }

    const total = cart.getTotal();

    // 1. Update Shift Stats
    useShiftStore.getState().updateShiftStats(total, 1);

    // 2. Update Customer Loyalty
    if (cart.customerId) {
      const customerStore = useCustomerStore.getState();
      const customer = customerStore.getById(cart.customerId);
      if (customer) {
        const pointsEarned = Math.floor(total / 10000);
        await customerStore.updateCustomer(cart.customerId, {
          loyaltyPoints: customer.loyaltyPoints + pointsEarned,
          totalSpent: customer.totalSpent + total,
          totalOrders: customer.totalOrders + 1,
          lastVisit: new Date().toISOString(),
        });
      }
    }

    // 3. Deduct Inventory
    const menuStore = useMenuStore.getState();
    const inventoryStore = useInventoryStore.getState();
    const cashierName = auth.user?.name || 'Sistem';
    for (const item of cart.items) {
      const product = menuStore.products.find((p) => p.id === item.productId);
      if (product?.recipe) {
        for (const ingredient of product.recipe) {
          await inventoryStore.stockOut(
            ingredient.stockItemId,
            ingredient.amount * item.quantity,
            `Terjual (Pesanan #${newOrder.orderNumber})`,
            cashierName
          );
        }
      }
    }

    // Optimistic update (Realtime will also fire)
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    cart.clearCart();
    return newOrder;
  },

  updateOrderStatus: async (orderId, status) => {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { status, updated_at: now };
    if (status === 'completed') updates.completed_at = now;

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) { console.error('updateOrderStatus error:', error); return; }
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              updatedAt: now,
              completedAt: status === 'completed' ? now : order.completedAt,
            }
          : order
      ),
    }));
  },

  voidOrder: async (orderId) => {
    const auth = useAuthStore.getState();
    if (!auth.hasRole(['supervisor', 'owner'])) return false;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: now })
      .eq('id', orderId);
    if (error) { console.error('voidOrder error:', error); return false; }
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status: 'cancelled' as OrderStatus, updatedAt: now }
          : order
      ),
    }));
    return true;
  },

  getOrdersByStatus: (status) => get().orders.filter((o) => o.status === status),

  getActiveOrders: () =>
    get().orders.filter((o) => ['pending', 'preparing', 'served'].includes(o.status)),

  getTodayOrders: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().orders.filter((o) => o.createdAt.startsWith(today));
  },
}));
