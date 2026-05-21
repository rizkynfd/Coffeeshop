'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AddStockItemModal } from '@/components/inventory/AddStockItemModal';
import { StockMovementModal } from '@/components/inventory/StockMovementModal';
import { useInventoryStore } from '@/stores/inventory-store';
import { useToastStore } from '@/stores/toast-store';
import { cn } from '@/lib/utils';
import { Plus, AlertTriangle, ArrowUp, ArrowDown, Trash2, Package } from 'lucide-react';
import type { StockItem } from '@/types';

export default function InventoryPage() {
  const { stockItems, deleteStockItem, getLowStockItems } = useInventoryStore();
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [movementModal, setMovementModal] = useState<{ open: boolean; item: StockItem | null; type: 'in' | 'out' }>({
    open: false,
    item: null,
    type: 'in',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<StockItem | null>(null);

  const filtered = stockItems.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const isLow = s.currentStock <= s.minimumStock;
    if (filter === 'low') return matchSearch && isLow;
    if (filter === 'ok') return matchSearch && !isLow;
    return matchSearch;
  });

  const lowStockCount = getLowStockItems().length;

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteStockItem(deleteConfirm.id);
    addToast(`Bahan "${deleteConfirm.name}" dihapus dari inventori`, 'success');
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900">Inventori</h1>
          <p className="text-sm text-espresso-400 mt-1">
            Kelola stok bahan baku dan supplies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
            Tambah Bahan Baru
          </Button>
        </div>
      </div>

      {/* Alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-accent shrink-0" />
          <span>
            <strong>{lowStockCount} bahan</strong> hampir habis. Segera lakukan
            restok.
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <SearchInput
          placeholder="Cari bahan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          showShortcut={false}
          className="max-w-xs"
        />
        <div className="flex items-center bg-white border border-espresso-200 rounded-xl overflow-hidden">
          {(['all', 'low', 'ok'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                filter === f
                  ? 'bg-espresso-900 text-cream'
                  : 'text-espresso-500 hover:bg-espresso-50'
              )}
            >
              {f === 'all' ? 'Semua' : f === 'low' ? '⚠ Menipis' : '✓ Cukup'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-cream rounded-2xl border border-espresso-200 overflow-hidden shadow-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-espresso-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-espresso-500 uppercase tracking-wider">
                Bahan
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-espresso-500 uppercase tracking-wider">
                Stok Saat Ini
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-espresso-500 uppercase tracking-wider">
                Minimum
              </th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-espresso-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-espresso-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso-100">
            {filtered.map((item) => {
              const isLow = item.currentStock <= item.minimumStock;
              const pct = Math.min((item.currentStock / (item.minimumStock || 1)) * 100, 100);
              return (
                <tr
                  key={item.id}
                  className={cn(
                    'hover:bg-espresso-50/50 transition-colors',
                    isLow && 'bg-amber-50/30'
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-espresso-100 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-espresso-400" />
                      </div>
                      <div>
                        <p className="font-medium text-espresso-800 text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-espresso-400">
                          Restok: {item.lastRestocked}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono font-bold text-espresso-900">
                      {item.currentStock} {item.unit}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-mono text-espresso-500">
                      {item.minimumStock} {item.unit}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <Badge variant={isLow ? 'warning' : 'success'} dot>
                        {isLow ? 'Menipis' : 'Cukup'}
                      </Badge>
                      <div className="w-16 h-1.5 bg-espresso-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            isLow ? 'bg-amber-accent' : 'bg-emerald-accent'
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Stock In"
                        onClick={() => setMovementModal({ open: true, item, type: 'in' })}
                        className="p-2 rounded-lg text-emerald-accent hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        title="Stock Out"
                        onClick={() => setMovementModal({ open: true, item, type: 'out' })}
                        className="p-2 rounded-lg text-espresso-400 hover:bg-espresso-100 transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        title="Hapus"
                        onClick={() => setDeleteConfirm(item)}
                        className="p-2 rounded-lg text-espresso-400 hover:text-rose-accent hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-espresso-400 text-sm">
                  Tidak ada bahan yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddStockItemModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      
      <StockMovementModal
        isOpen={movementModal.open}
        onClose={() => setMovementModal({ open: false, item: null, type: 'in' })}
        item={movementModal.item}
        type={movementModal.type}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Hapus Bahan?"
        message={`Bahan "${deleteConfirm?.name}" akan dihapus dari inventori. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Hapus"
      />
    </div>
  );
}
