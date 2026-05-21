import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Discount, OrderType, OrderItemModifier, ProductSize, Temperature, SugarLevel, MilkType } from '@/types';
import { generateId } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: number | null;
  discount: Discount | null;
  customerName: string;
  customerId: string | null;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (table: number | null) => void;
  setDiscount: (discount: Discount | null) => void;
  setCustomer: (id: string | null, name: string) => void;
  clearCart: () => void;

  // Computed
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const TAX_RATE = 0.11;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: 'dine-in',
      tableNumber: null,
      discount: null,
      customerName: '',
      customerId: null,

      addItem: (item) => {
        const newItem: CartItem = {
          ...item,
          id: generateId(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      updateItemNotes: (itemId, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, notes } : item
          ),
        }));
      },

      setOrderType: (type) => {
        set({ orderType: type, tableNumber: type === 'dine-in' ? null : null });
      },

      setTableNumber: (table) => {
        set({ tableNumber: table });
      },

      setDiscount: (discount) => {
        set({ discount });
      },

      setCustomer: (id, name) => {
        set({ customerId: id, customerName: name });
      },

      clearCart: () => {
        set({
          items: [],
          orderType: 'dine-in',
          tableNumber: null,
          discount: null,
          customerName: '',
          customerId: null,
        });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((m, mod) => m + mod.price, 0);
          return sum + (item.unitPrice + modifierTotal) * item.quantity;
        }, 0);
      },

      getDiscountAmount: () => {
        const { discount } = get();
        if (!discount) return 0;
        const subtotal = get().getSubtotal();
        if (discount.type === 'percentage') {
          return Math.round(subtotal * (discount.value / 100));
        }
        return discount.value;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        const discountAmount = get().getDiscountAmount();
        return Math.round((subtotal - discountAmount) * TAX_RATE);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discountAmount = get().getDiscountAmount();
        const tax = get().getTax();
        return subtotal - discountAmount + tax;
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
