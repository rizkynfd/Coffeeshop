'use client';

import { useState } from 'react';
import { useMenuStore } from '@/stores/menu-store';
import { useToastStore } from '@/stores/toast-store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProductFormModal } from '@/components/menu/ProductFormModal';
import { CategoryFormModal } from '@/components/menu/CategoryFormModal';
import { formatCurrency, getSizeLabel, cn } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tag,
  ImagePlus,
  Star,
} from 'lucide-react';
import type { Product, Category } from '@/types';

export default function MenuPage() {
  const {
    products,
    categories,
    toggleAvailability,
    deleteProduct,
    deleteCategory,
  } = useMenuStore();
  const { addToast } = useToastStore();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [productModal, setProductModal] = useState<{ open: boolean; product?: Product | null }>({ open: false });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category?: Category | null }>({ open: false });
  const [deleteProductConfirm, setDeleteProductConfirm] = useState<Product | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<Category | null>(null);

  const filtered = products.filter((p) => {
    const matchCat = activeCategoryId === 'all' || p.categoryId === activeCategoryId;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDeleteProduct = () => {
    if (!deleteProductConfirm) return;
    deleteProduct(deleteProductConfirm.id);
    addToast(`Produk "${deleteProductConfirm.name}" dihapus`, 'success');
    setDeleteProductConfirm(null);
  };

  const handleDeleteCategory = () => {
    if (!deleteCategoryConfirm) return;
    deleteCategory(deleteCategoryConfirm.id);
    addToast(`Kategori "${deleteCategoryConfirm.name}" dihapus`, 'success');
    setDeleteCategoryConfirm(null);
  };

  return (
    <div className="h-full flex">
      {/* Left: Category Sidebar */}
      <div className="w-64 shrink-0 border-r border-espresso-200 bg-cream flex flex-col">
        <div className="p-4 border-b border-espresso-100">
          <h2 className="text-sm font-semibold text-espresso-700">Kategori</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {[{ id: 'all', name: 'Semua Menu', icon: '📋' }, ...categories].map((cat) => {
            const count =
              cat.id === 'all'
                ? products.length
                : products.filter((p) => p.categoryId === cat.id).length;
            return (
              <div key={cat.id} className="group relative">
                <button
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    activeCategoryId === cat.id
                      ? 'bg-espresso-900 text-cream'
                      : 'text-espresso-600 hover:bg-espresso-50'
                  )}
                >
                  <span>{cat.name}</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      activeCategoryId === cat.id
                        ? 'bg-espresso-700 text-espresso-200'
                        : 'bg-espresso-100 text-espresso-500'
                    )}
                  >
                    {count}
                  </span>
                </button>
                {/* Edit/Delete category buttons — appear on hover */}
                {cat.id !== 'all' && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-cream border border-espresso-200 rounded-lg shadow-card px-1 py-0.5">
                    <button
                      onClick={() => setCategoryModal({ open: true, category: cat as Category })}
                      className="p-1 rounded text-espresso-400 hover:text-espresso-700 cursor-pointer"
                      title="Edit kategori"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteCategoryConfirm(cat as Category)}
                      className="p-1 rounded text-espresso-400 hover:text-rose-accent cursor-pointer"
                      title="Hapus kategori"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-3 border-t border-espresso-100">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCategoryModal({ open: true })}
          >
            Tambah Kategori
          </Button>
        </div>
      </div>

      {/* Right: Product List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-espresso-200 bg-cream flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-xl font-bold text-espresso-900 shrink-0">Manajemen Menu</h1>
            <SearchInput
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              showShortcut={false}
              className="max-w-xs"
            />
          </div>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setProductModal({ open: true })}
          >
            Tambah Produk
          </Button>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <EmptyState
              title="Tidak ada produk"
              description="Coba ubah filter atau tambah produk baru"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <MenuProductCard
                  key={product.id}
                  product={product}
                  onToggle={() => {
                    toggleAvailability(product.id);
                    addToast(
                      `${product.name} ditandai ${product.isAvailable ? 'habis' : 'tersedia'}`,
                      'info'
                    );
                  }}
                  onEdit={() => setProductModal({ open: true, product })}
                  onDelete={() => setDeleteProductConfirm(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={productModal.open}
        onClose={() => setProductModal({ open: false })}
        product={productModal.product}
      />
      <CategoryFormModal
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal({ open: false })}
        category={categoryModal.category}
      />
      <ConfirmDialog
        isOpen={!!deleteProductConfirm}
        onClose={() => setDeleteProductConfirm(null)}
        onConfirm={handleDeleteProduct}
        title="Hapus Produk?"
        message={`Produk "${deleteProductConfirm?.name}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Hapus"
      />
      <ConfirmDialog
        isOpen={!!deleteCategoryConfirm}
        onClose={() => setDeleteCategoryConfirm(null)}
        onConfirm={handleDeleteCategory}
        title="Hapus Kategori?"
        message={`Kategori "${deleteCategoryConfirm?.name}" akan dihapus. Produk di kategori ini tidak ikut terhapus.`}
        confirmLabel="Ya, Hapus"
      />
    </div>
  );
}

function MenuProductCard({
  product,
  onToggle,
  onEdit,
  onDelete,
}: {
  product: Product;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'bg-cream rounded-xl border shadow-card hover:shadow-card-hover transition-all',
        product.isAvailable ? 'border-espresso-200' : 'border-espresso-200 opacity-60'
      )}
    >
      {/* Image & Badges */}
      <div className="relative h-36 bg-gradient-to-br from-espresso-100 to-espresso-200 rounded-t-xl flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">☕</span>
        )}
        <div className="absolute inset-0 bg-espresso-950/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            onClick={onEdit}
            className="p-2 bg-white rounded-lg text-espresso-700 hover:bg-espresso-50 cursor-pointer"
            title="Edit Gambar"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
        </div>
        {product.isPopular && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-accent text-white text-[10px] font-bold">
            <Star className="w-2.5 h-2.5 fill-current" />
            Populer
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-rose-accent text-white text-[10px] font-bold">
            Habis
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-espresso-900 truncate">{product.name}</h3>
            <p className="text-xs text-espresso-400 mt-0.5 line-clamp-1">{product.description}</p>
          </div>
        </div>

        {/* Variants */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.variants.map((v) => (
            <span
              key={v.size}
              className="px-2 py-1 text-[10px] font-mono font-medium bg-espresso-50 text-espresso-600 rounded-lg border border-espresso-200"
            >
              {getSizeLabel(v.size)} — {formatCurrency(v.price)}
            </span>
          ))}
        </div>

        {/* Modifiers */}
        {product.availableModifiers.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Tag className="w-3 h-3 text-espresso-400" />
            <span className="text-[11px] text-espresso-400">
              {product.availableModifiers.length} tambahan tersedia
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-espresso-100">
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer',
              product.isAvailable
                ? 'text-emerald-accent hover:text-emerald-700'
                : 'text-espresso-400 hover:text-espresso-600'
            )}
          >
            {product.isAvailable ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            {product.isAvailable ? 'Tersedia' : 'Habis'}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-espresso-400 hover:text-espresso-700 hover:bg-espresso-100 transition-colors cursor-pointer"
              title="Edit produk"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-espresso-400 hover:text-rose-accent hover:bg-red-50 transition-colors cursor-pointer"
              title="Hapus produk"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
