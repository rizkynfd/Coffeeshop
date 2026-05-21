import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus, Payment } from '@/types';
import { mockOrders } from '@/data/mock-orders';
import { generateId, generateOrderNumber } from '@/lib/utils';
import { useCartStore } from './cart-store';
import { useAuthStore } from './auth-store';
import { useShiftStore } from './shift-store';
import { useCustomerStore } from './customer-store';
import { useMenuStore } from './menu-store';
import { useInventoryStore } from './inventory-store';

interface OrderState {
  orders: Order[];
  addOrder: (payments: Payment[]) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  voidOrder: (orderId: string) => boolean;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getActiveOrders: () => Order[];
  getTodayOrders: () => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: mockOrders,

      addOrder: (payments) => {
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
              (item.unitPrice +
                item.modifiers.reduce((sum, m) => sum + m.price, 0)) *
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

        // --- INTEGRASI CORE LOGIC ---
        const total = cart.getTotal();

        // 1. Update Shift Stats
        useShiftStore.getState().updateShiftStats(total, 1);

        // 2. Update Customer Loyalty
        if (cart.customerId) {
          const customerStore = useCustomerStore.getState();
          const customer = customerStore.getById(cart.customerId);
          if (customer) {
            const pointsEarned = Math.floor(total / 10000);
            customerStore.updateCustomer(cart.customerId, {
              loyaltyPoints: customer.loyaltyPoints + pointsEarned,
              totalSpent: customer.totalSpent + total,
              totalOrders: customer.totalOrders + 1,
              lastVisit: new Date().toISOString(),
            });
          }
        }

        // 3. Deduct Inventory (Recipes)
        const menuStore = useMenuStore.getState();
        const inventoryStore = useInventoryStore.getState();
        const cashierName = auth.user?.name || 'Sistem';

        cart.items.forEach((item) => {
          const product = menuStore.products.find((p) => p.id === item.productId);
          if (product && product.recipe) {
            product.recipe.forEach((ingredient) => {
              inventoryStore.stockOut(
                ingredient.stockItemId,
                ingredient.amount * item.quantity,
                `Terjual (Pesanan #${newOrder.orderNumber})`,
                cashierName
              );
            });
          }
        });

        set((state) => ({ orders: [newOrder, ...state.orders] }));
        cart.clearCart();
        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                  completedAt:
                    status === 'completed'
                      ? new Date().toISOString()
                      : order.completedAt,
                }
              : order
          ),
        }));
      },

      voidOrder: (orderId) => {
        const auth = useAuthStore.getState();
        if (!auth.hasRole(['supervisor', 'owner'])) {
          return false;
        }
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: 'cancelled' as OrderStatus,
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
        }));
        return true;
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      getActiveOrders: () => {
        return get().orders.filter((order) =>
          ['pending', 'preparing', 'served'].includes(order.status)
        );
      },

      getTodayOrders: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().orders.filter((order) =>
          order.createdAt.startsWith(today)
        );
      },
    }),
    {
      name: 'order-storage',
    }
  )
);
