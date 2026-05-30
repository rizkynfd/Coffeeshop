'use client';

import { cn, formatCurrency, getSizeLabel } from '@/lib/utils';
import type { Product } from '@/types';
import { Plus, Star, Ban } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-espresso-100 flex items-center justify-center text-espresso-300 mb-4">
          <Ban className="w-8 h-8" />
        </div>
        <p className="text-espresso-500 font-medium">Tidak ada produk</p>
        <p className="text-sm text-espresso-400 mt-1">Coba kategori lain atau ubah pencarian</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product)}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const hasMultipleSizes = product.variants.length > 1;

  return (
    <button
      onClick={onClick}
      disabled={!product.isAvailable}
      className={cn(
        'relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer group',
        product.isAvailable
          ? 'bg-white border-espresso-200 hover:border-espresso-300 hover:shadow-card-hover active:scale-[0.98]'
          : 'bg-espresso-50 border-espresso-200 opacity-60 cursor-not-allowed'
      )}
    >
      {/* Image placeholder */}
      <div className="relative w-full aspect-square rounded-lg bg-gradient-to-br from-espresso-100 to-espresso-200 mb-3 overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-espresso-300">
            <span className="text-3xl">☕</span>
          </div>
        )}

        {/* Popular badge */}
        {product.isPopular && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-accent text-white text-[10px] font-bold">
            <Star className="w-2.5 h-2.5 fill-current" />
            Populer
          </div>
        )}

        {/* Out of stock overlay — more prominent */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-espresso-950/60 flex flex-col items-center justify-center rounded-lg gap-1.5">
            <span className="text-2xl">🚫</span>
            <span className="px-3 py-1 bg-rose-accent text-white text-xs font-bold rounded-full tracking-wide uppercase">
              Stok Habis
            </span>
          </div>
        )}

        {/* Quick add button */}
        {product.isAvailable && (
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-amber-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md scale-90 group-hover:scale-100">
            <Plus className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-espresso-800 truncate leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-espresso-400 mt-0.5 line-clamp-1">
          {product.description}
        </p>
      </div>

      {/* Price */}
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-base font-bold font-mono text-espresso-900">
          {formatCurrency(minPrice)}
        </span>
        {hasMultipleSizes && (
          <span className="text-xs text-espresso-400">
            ({product.variants.map((v) => getSizeLabel(v.size)).join('/')})
          </span>
        )}
      </div>
    </button>
  );
}
