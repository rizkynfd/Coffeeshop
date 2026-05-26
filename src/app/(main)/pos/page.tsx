'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useMenuStore } from '@/stores/menu-store';
import { useCartStore } from '@/stores/cart-store';
import { useOrderStore } from '@/stores/order-store';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { ProductSearch } from '@/components/pos/ProductSearch';
import { OrderPanel } from '@/components/pos/OrderPanel';
import { ModifierDialog } from '@/components/pos/ModifierDialog';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ReceiptPreview } from '@/components/pos/ReceiptPreview';
import { SearchInput } from '@/components/ui/SearchInput';
import type { Product, Payment, Order } from '@/types';

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModifierOpen, setIsModifierOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { addItem } = useCartStore();
  const { addOrder } = useOrderStore();
  // Use products from Supabase-backed store
  const products = useMenuStore((s) => s.products);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products.filter((p) => p.isAvailable);
    if (activeCategory === 'popular')
      return products.filter((p) => p.isPopular && p.isAvailable);
    return products.filter(
      (p) => p.categoryId === activeCategory && p.isAvailable
    );
  }, [activeCategory, products]);

  // Keyboard shortcut: Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    const hasOptions =
      product.variants.length > 1 ||
      product.hasTemperature ||
      product.hasSugarLevel ||
      product.hasMilkType ||
      product.availableModifiers.length > 0;

    if (hasOptions) {
      setSelectedProduct(product);
      setIsModifierOpen(true);
    } else {
      addItem({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        size: product.variants[0].size,
        modifiers: [],
        notes: '',
        unitPrice: product.variants[0].price,
      });
    }
  }, [addItem]);

  const handleModifierConfirm = useCallback(
    (config: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      size: any; temperature?: any; sugarLevel?: any; milkType?: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modifiers: any[]; notes: string; quantity: number; unitPrice: number;
    }) => {
      if (!selectedProduct) return;
      addItem({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: config.quantity,
        size: config.size,
        temperature: config.temperature,
        sugarLevel: config.sugarLevel,
        milkType: config.milkType,
        modifiers: config.modifiers,
        notes: config.notes,
        unitPrice: config.unitPrice,
      });
    },
    [selectedProduct, addItem]
  );

  // addOrder is now async — await it and handle errors
  const handlePayment = useCallback(
    async (payments: Payment[]) => {
      try {
        const order = await addOrder(payments);
        setIsPaymentOpen(false);
        setCompletedOrder(order);
        setIsReceiptOpen(true);
      } catch (err) {
        console.error('Payment failed:', err);
      }
    },
    [addOrder]
  );

  return (
    <div className="flex h-full">
      {/* Left: Menu Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-espresso-900">Kasir</h1>
              <p className="text-sm text-espresso-400">
                Pilih produk untuk membuat pesanan
              </p>
            </div>
            <div className="w-64">
              <SearchInput
                placeholder="Cari produk..."
                onClick={() => setIsSearchOpen(true)}
                readOnly
                className="cursor-pointer"
              />
            </div>
          </div>
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <ProductGrid
            products={filteredProducts}
            onProductClick={handleProductClick}
          />
        </div>
      </div>

      {/* Right: Order Panel */}
      <div className="w-[380px] shrink-0">
        <OrderPanel onCheckout={() => setIsPaymentOpen(true)} />
      </div>

      {/* Modals */}
      <ProductSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleProductClick}
      />
      <ModifierDialog
        product={selectedProduct}
        isOpen={isModifierOpen}
        onClose={() => { setIsModifierOpen(false); setSelectedProduct(null); }}
        onConfirm={handleModifierConfirm}
      />
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onConfirm={handlePayment}
      />
      <ReceiptPreview
        order={completedOrder}
        isOpen={isReceiptOpen}
        onClose={() => { setIsReceiptOpen(false); setCompletedOrder(null); }}
      />
    </div>
  );
}
