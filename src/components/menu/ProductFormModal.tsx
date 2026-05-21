'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useMenuStore } from '@/stores/menu-store';
import { useToastStore } from '@/stores/toast-store';
import { formatCurrency, cn } from '@/lib/utils';
import { Plus, Trash2, Save } from 'lucide-react';
import type { Product, ProductVariant, ProductSize } from '@/types';
import { modifiers as allModifiers } from '@/data/mock-products';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const sizeOptions: { value: ProductSize; label: string }[] = [
  { value: 'small', label: 'Small (S)' },
  { value: 'medium', label: 'Medium (M)' },
  { value: 'large', label: 'Large (L)' },
];

const emptyForm = {
  name: '',
  categoryId: '',
  description: '',
  variants: [{ size: 'medium' as ProductSize, price: 0 }] as ProductVariant[],
  hasTemperature: false,
  hasSugarLevel: false,
  hasMilkType: false,
  availableModifiers: [] as string[],
  isAvailable: true,
  isPopular: false,
};

export function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const { categories, addProduct, updateProduct } = useMenuStore();
  const { addToast } = useToastStore();
  const isEditing = !!product;

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        variants: [...product.variants],
        hasTemperature: product.hasTemperature,
        hasSugarLevel: product.hasSugarLevel,
        hasMilkType: product.hasMilkType,
        availableModifiers: [...product.availableModifiers],
        isAvailable: product.isAvailable,
        isPopular: product.isPopular,
      });
    } else {
      setForm(emptyForm);
    }
  }, [product, isOpen]);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addVariant = () => {
    const usedSizes = form.variants.map((v) => v.size);
    const nextSize = sizeOptions.find((s) => !usedSizes.includes(s.value));
    if (!nextSize) return;
    updateField('variants', [...form.variants, { size: nextSize.value, price: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (form.variants.length <= 1) return;
    updateField('variants', form.variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = form.variants.map((v, i) =>
      i === index ? { ...v, [field]: field === 'price' ? Number(value) : value } : v
    );
    updateField('variants', updated);
  };

  const toggleModifier = (modId: string) => {
    const current = form.availableModifiers;
    updateField(
      'availableModifiers',
      current.includes(modId) ? current.filter((m) => m !== modId) : [...current, modId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId || form.variants.some((v) => v.price <= 0)) {
      addToast('Mohon lengkapi semua field yang wajib', 'error');
      return;
    }

    if (isEditing && product) {
      updateProduct(product.id, form);
      addToast(`Produk "${form.name}" berhasil diperbarui`, 'success');
    } else {
      addProduct(form);
      addToast(`Produk "${form.name}" berhasil ditambahkan`, 'success');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Produk' : 'Tambah Produk'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-espresso-700 mb-2">Nama Produk *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
              placeholder="Contoh: Café Latte"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-espresso-700 mb-2">Kategori *</label>
            <select
              value={form.categoryId}
              onChange={(e) => updateField('categoryId', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">Deskripsi</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
            placeholder="Deskripsi singkat produk"
          />
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-espresso-700">Varian & Harga *</label>
            {form.variants.length < 3 && (
              <button type="button" onClick={addVariant} className="text-xs font-medium text-amber-accent hover:underline cursor-pointer flex items-center gap-1">
                <Plus className="w-3 h-3" /> Tambah varian
              </button>
            )}
          </div>
          <div className="space-y-2">
            {form.variants.map((variant, i) => (
              <div key={i} className="flex items-center gap-3">
                <select
                  value={variant.size}
                  onChange={(e) => updateVariant(i, 'size', e.target.value)}
                  className="w-32 px-3 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
                >
                  {sizeOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400 text-sm">Rp</span>
                  <input
                    type="number"
                    value={variant.price || ''}
                    onChange={(e) => updateVariant(i, 'price', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm font-mono"
                    placeholder="0"
                    min={0}
                    required
                  />
                </div>
                {form.variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="p-2 rounded-lg text-espresso-400 hover:text-rose-accent hover:bg-red-50 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Options toggles */}
        <div>
          <label className="text-sm font-medium text-espresso-700 mb-3 block">Opsi Kustomisasi</label>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'hasTemperature' as const, label: 'Hot / Iced' },
              { key: 'hasSugarLevel' as const, label: 'Level Gula' },
              { key: 'hasMilkType' as const, label: 'Pilih Susu' },
              { key: 'isPopular' as const, label: '⭐ Populer' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => updateField(opt.key, !form[opt.key])}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer',
                  form[opt.key]
                    ? 'bg-espresso-900 text-cream border-espresso-900'
                    : 'bg-white text-espresso-600 border-espresso-200 hover:border-espresso-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modifiers */}
        <div>
          <label className="text-sm font-medium text-espresso-700 mb-3 block">Tambahan (Modifiers)</label>
          <div className="flex flex-wrap gap-2">
            {allModifiers.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => toggleModifier(mod.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
                  form.availableModifiers.includes(mod.id)
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-white text-espresso-500 border-espresso-200 hover:border-espresso-300'
                )}
              >
                {mod.name} (+{formatCurrency(mod.price)})
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-espresso-100">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>Batal</Button>
          <Button type="submit" fullWidth leftIcon={<Save className="w-4 h-4" />}>
            {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
