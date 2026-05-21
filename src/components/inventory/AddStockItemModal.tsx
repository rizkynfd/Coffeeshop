'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useInventoryStore } from '@/stores/inventory-store';
import { useToastStore } from '@/stores/toast-store';
import { PackagePlus } from 'lucide-react';

interface AddStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_UNITS = ['kg', 'gram', 'liter', 'ml', 'pcs', 'kaleng', 'botol', 'pack'];

export function AddStockItemModal({ isOpen, onClose }: AddStockItemModalProps) {
  const { addStockItem } = useInventoryStore();
  const { addToast } = useToastStore();

  const [form, setForm] = useState({
    name: '',
    unit: 'kg',
    currentStock: '',
    minimumStock: '',
  });

  const handleClose = () => {
    setForm({ name: '', unit: 'kg', currentStock: '', minimumStock: '' });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Nama bahan wajib diisi', 'error');
      return;
    }
    addStockItem({
      name: form.name.trim(),
      unit: form.unit,
      currentStock: parseFloat(form.currentStock) || 0,
      minimumStock: parseFloat(form.minimumStock) || 0,
      lastRestocked: new Date().toISOString().split('T')[0],
    });
    addToast(`Bahan "${form.name}" berhasil ditambahkan`, 'success');
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Bahan Baru" size="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">Nama Bahan *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
            placeholder="Contoh: Biji Kopi Arabika"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">Satuan *</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm((f) => ({ ...f, unit: u }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                  form.unit === u
                    ? 'bg-espresso-900 text-cream border-espresso-900'
                    : 'bg-white text-espresso-600 border-espresso-200 hover:border-espresso-400'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-espresso-700 mb-2">Stok Awal</label>
            <div className="relative">
              <input
                type="number"
                value={form.currentStock}
                onChange={(e) => setForm((f) => ({ ...f, currentStock: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm font-mono"
                placeholder="0"
                min={0}
                step="any"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-espresso-400">{form.unit}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-espresso-700 mb-2">Minimum Stok</label>
            <div className="relative">
              <input
                type="number"
                value={form.minimumStock}
                onChange={(e) => setForm((f) => ({ ...f, minimumStock: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm font-mono"
                placeholder="0"
                min={0}
                step="any"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-espresso-400">{form.unit}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={handleClose}>Batal</Button>
          <Button type="submit" fullWidth leftIcon={<PackagePlus className="w-4 h-4" />}>
            Tambah Bahan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
