'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMenuStore } from '@/stores/menu-store';
import { formatCurrency } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import type { Product } from '@/types';

interface ProductSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductSearch({
  isOpen,
  onClose,
  onSelectProduct,
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const products = useMenuStore((s) => s.products);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-espresso-950/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl mx-4 bg-cream rounded-2xl shadow-modal border border-espresso-200/50 animate-scale-in overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 border-b border-espresso-100">
          <Search className="w-5 h-5 text-espresso-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 py-4 text-base bg-transparent text-espresso-900 placeholder:text-espresso-400 focus:outline-none"
            placeholder="Cari produk..."
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md hover:bg-espresso-100 text-espresso-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-1 text-[10px] font-mono text-espresso-400 bg-espresso-100 rounded border border-espresso-200">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.length === 0 ? (
            <div className="py-8 text-center text-sm text-espresso-400">
              Ketik nama produk untuk mencari...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-espresso-400">
              Tidak ada produk ditemukan untuk &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((product) => {
              const minPrice = Math.min(
                ...product.variants.map((v) => v.price)
              );
              return (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  disabled={!product.isAvailable}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:bg-espresso-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-lg bg-espresso-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      '☕'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-espresso-800 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-espresso-400">
                      {product.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold font-mono text-espresso-900">
                      {formatCurrency(minPrice)}
                    </p>
                    {!product.isAvailable && (
                      <p className="text-[10px] text-rose-accent font-medium">
                        Habis
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
