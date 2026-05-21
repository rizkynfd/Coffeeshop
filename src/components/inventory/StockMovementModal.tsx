'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useInventoryStore } from '@/stores/inventory-store';
import { useAuthStore } from '@/stores/auth-store';
import { useToastStore } from '@/stores/toast-store';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { StockItem } from '@/types';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockItem | null;
  type: 'in' | 'out';
}

export function StockMovementModal({ isOpen, onClose, item, type }: StockMovementModalProps) {
  const { stockIn, stockOut } = useInventoryStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const isIn = type === 'in';

  const handleClose = () => {
    setQuantity('');
    setNotes('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      addToast('Masukkan jumlah yang valid', 'error');
      return;
    }
    if (!isIn && qty > item.currentStock) {
      addToast(`Stok tidak cukup. Stok saat ini: ${item.currentStock} ${item.unit}`, 'error');
      return;
    }

    const recordedBy = user?.name || 'Unknown';
    if (isIn) {
      stockIn(item.id, qty, notes, recordedBy);
      addToast(`+${qty} ${item.unit} ${item.name} ditambahkan`, 'success');
    } else {
      stockOut(item.id, qty, notes, recordedBy);
      addToast(`-${qty} ${item.unit} ${item.name} dikurangi`, 'warning');
    }
    handleClose();
  };

  if (!item) return null;

  const afterStock = isIn
    ? item.currentStock + (parseFloat(quantity) || 0)
    : Math.max(0, item.currentStock - (parseFloat(quantity) || 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isIn ? 'Stock In — Tambah Stok' : 'Stock Out — Kurangi Stok'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Item info */}
        <div className={`flex items-center gap-3 p-4 rounded-xl ${isIn ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isIn ? 'bg-emerald-100' : 'bg-amber-100'}`}>
            {isIn
              ? <ArrowUp className="w-5 h-5 text-emerald-accent" />
              : <ArrowDown className="w-5 h-5 text-amber-accent" />
            }
          </div>
          <div>
            <p className="font-semibold text-espresso-900 text-sm">{item.name}</p>
            <p className="text-xs text-espresso-500">
              Stok saat ini: <span className="font-mono font-bold">{item.currentStock} {item.unit}</span>
            </p>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">
            Jumlah ({item.unit}) *
          </label>
          <div className="relative">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-lg font-mono font-bold text-espresso-900"
              placeholder="0"
              min={0.001}
              step="any"
              required
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-espresso-400">{item.unit}</span>
          </div>
        </div>

        {/* Stock preview */}
        {quantity && (
          <div className="flex items-center justify-between px-4 py-3 bg-espresso-50 rounded-xl text-sm">
            <span className="text-espresso-600">Stok setelah ini</span>
            <span className={`font-mono font-bold ${afterStock < item.minimumStock ? 'text-rose-accent' : 'text-espresso-900'}`}>
              {afterStock.toFixed(afterStock % 1 === 0 ? 0 : 2)} {item.unit}
            </span>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">Catatan</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
            placeholder={isIn ? 'Contoh: Restok dari supplier' : 'Contoh: Dipakai untuk batch pagi'}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={handleClose}>Batal</Button>
          <Button
            type="submit"
            fullWidth
            variant={isIn ? 'primary' : 'secondary'}
            leftIcon={isIn ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          >
            {isIn ? 'Tambah Stok' : 'Kurangi Stok'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
