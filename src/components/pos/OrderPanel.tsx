'use client';

import { useCartStore } from '@/stores/cart-store';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderTypeSelector } from './OrderTypeSelector';
import { cn, formatCurrency, getSizeLabel, getTemperatureLabel } from '@/lib/utils';
import { Minus, Plus, Trash2, StickyNote, ShoppingCart, CreditCard, Hash } from 'lucide-react';
import type { CartItem } from '@/types';

interface OrderPanelProps {
  onCheckout: () => void;
}

export function OrderPanel({ onCheckout }: OrderPanelProps) {
  const {
    items,
    orderType,
    tableNumber,
    setTableNumber,
    discount,
    removeItem,
    updateQuantity,
    getSubtotal,
    getDiscountAmount,
    getTax,
    getTotal,
    getItemCount,
    clearCart,
  } = useCartStore();

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const tax = getTax();
  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <div className="flex flex-col h-full bg-cream border-l border-espresso-200">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3 border-b border-espresso-100 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-espresso-900">
            Pesanan
          </h2>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-espresso-400 hover:text-rose-accent transition-colors cursor-pointer"
            >
              Hapus Semua
            </button>
          )}
        </div>
        <OrderTypeSelector />
        {orderType === 'dine-in' && (
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-espresso-400" />
            <input
              type="number"
              min={1}
              max={50}
              value={tableNumber || ''}
              onChange={(e) =>
                setTableNumber(e.target.value ? Number(e.target.value) : null)
              }
              className="w-20 px-3 py-1.5 text-sm rounded-lg border border-espresso-200 bg-white text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-amber-accent/30 focus:border-amber-accent"
              placeholder="Meja"
            />
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="w-8 h-8" />}
            title="Pesanan Kosong"
            description="Pilih produk dari menu untuk memulai pesanan"
            className="py-12"
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <OrderItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer — Summary + Checkout */}
      {items.length > 0 && (
        <div className="shrink-0 border-t border-espresso-200 bg-white px-4 py-4 space-y-3">
          {/* Price Breakdown */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-espresso-500">
              <span>Subtotal ({itemCount} item)</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-accent">
                <span>Diskon {discount?.label}</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-espresso-500">
              <span>PPN (11%)</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-espresso-900 pt-2 border-t border-espresso-100">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            size="lg"
            fullWidth
            onClick={onCheckout}
            leftIcon={<CreditCard className="w-5 h-5" />}
          >
            Bayar — {formatCurrency(total)}
          </Button>
        </div>
      )}
    </div>
  );
}

function OrderItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  const modifierTotal = item.modifiers.reduce((sum, m) => sum + m.price, 0);
  const itemTotal = (item.unitPrice + modifierTotal) * item.quantity;

  const details: string[] = [];
  if (item.size) details.push(getSizeLabel(item.size));
  if (item.temperature) details.push(getTemperatureLabel(item.temperature));
  if (item.sugarLevel && item.sugarLevel !== 'normal')
    details.push(item.sugarLevel === 'less' ? 'Less Sugar' : 'No Sugar');
  if (item.milkType && item.milkType !== 'regular')
    details.push(item.milkType.charAt(0).toUpperCase() + item.milkType.slice(1) + ' Milk');

  return (
    <div className="bg-white rounded-xl border border-espresso-100 p-3 animate-slide-up">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-espresso-800 truncate">
            {item.productName}
          </h4>
          {details.length > 0 && (
            <p className="text-[11px] text-espresso-400 mt-0.5">
              {details.join(' · ')}
            </p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-espresso-300 hover:text-rose-accent hover:bg-red-50 transition-colors cursor-pointer shrink-0"
          aria-label="Hapus item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modifiers */}
      {item.modifiers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.modifiers.map((mod) => (
            <span
              key={mod.modifierId}
              className="px-2 py-0.5 text-[10px] font-medium bg-espresso-50 text-espresso-500 rounded-full"
            >
              +{mod.name}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <div className="flex items-start gap-1.5 mb-2 text-[11px] text-espresso-400">
          <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="italic">{item.notes}</span>
        </div>
      )}

      {/* Quantity + Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="w-7 h-7 rounded-lg border border-espresso-200 flex items-center justify-center text-espresso-500 hover:bg-espresso-50 transition-colors cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-6 text-center text-sm font-bold font-mono text-espresso-800">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-7 h-7 rounded-lg border border-espresso-200 flex items-center justify-center text-espresso-500 hover:bg-espresso-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <span className="text-sm font-bold font-mono text-espresso-900">
          {formatCurrency(itemTotal)}
        </span>
      </div>
    </div>
  );
}
