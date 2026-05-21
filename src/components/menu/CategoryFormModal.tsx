'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useMenuStore } from '@/stores/menu-store';
import { useToastStore } from '@/stores/toast-store';
import { Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

const EMOJI_OPTIONS = ['☕', '🍵', '🥤', '🧃', '🍰', '🥐', '🍳', '🥗', '🍜', '🧋', '🍫', '🫖'];

export function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const { addCategory, updateCategory } = useMenuStore();
  const { addToast } = useToastStore();
  const isEditing = !!category;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('☕');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon || '☕');
    } else {
      setName('');
      setIcon('☕');
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Nama kategori wajib diisi', 'error');
      return;
    }
    if (isEditing && category) {
      updateCategory(category.id, { name, icon });
      addToast(`Kategori "${name}" berhasil diperbarui`, 'success');
    } else {
      addCategory({ name, icon, order: 99 });
      addToast(`Kategori "${name}" berhasil ditambahkan`, 'success');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Kategori' : 'Tambah Kategori'} size="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Icon picker */}
        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-3">Icon Kategori</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={cn(
                  'w-10 h-10 rounded-xl text-xl transition-all cursor-pointer border-2',
                  icon === emoji
                    ? 'border-amber-accent bg-amber-50 scale-110'
                    : 'border-espresso-200 hover:border-espresso-300 bg-white'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">Nama Kategori *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">{icon}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
              placeholder="Contoh: Espresso Based"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>Batal</Button>
          <Button type="submit" fullWidth leftIcon={<Save className="w-4 h-4" />}>
            {isEditing ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
