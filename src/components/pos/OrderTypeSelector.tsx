'use client';

import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import type { OrderType } from '@/types';
import { Store, ShoppingBag, Truck } from 'lucide-react';

const orderTypes: { type: OrderType; label: string; icon: React.ReactNode }[] = [
  { type: 'dine-in', label: 'Dine In', icon: <Store className="w-4 h-4" /> },
  { type: 'takeaway', label: 'Take Away', icon: <ShoppingBag className="w-4 h-4" /> },
  { type: 'delivery', label: 'Delivery', icon: <Truck className="w-4 h-4" /> },
];

export function OrderTypeSelector() {
  const { orderType, setOrderType } = useCartStore();

  return (
    <div className="flex bg-espresso-100 rounded-xl p-1 gap-1">
      {orderTypes.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => setOrderType(type)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer',
            orderType === type
              ? 'bg-white text-espresso-900 shadow-card'
              : 'text-espresso-500 hover:text-espresso-700'
          )}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}
