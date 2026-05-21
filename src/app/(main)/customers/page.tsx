'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomerFormModal } from '@/components/customer/CustomerFormModal';
import { useCustomerStore } from '@/stores/customer-store';
import { useToastStore } from '@/stores/toast-store';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  User,
  Phone,
  Mail,
  Star,
  TrendingUp,
  ShoppingBag,
  X,
  Award,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const { customers, deleteCustomer } = useCustomerStore();
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modals state
  const [formModal, setFormModal] = useState<{ open: boolean; customer: Customer | null }>({
    open: false,
    customer: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const selected = customers.find((c) => c.id === selectedId) || null;

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteCustomer(deleteConfirm.id);
    addToast(`Pelanggan "${deleteConfirm.name}" berhasil dihapus`, 'success');
    if (selectedId === deleteConfirm.id) {
      setSelectedId(null);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="h-full flex">
      {/* Customer List */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-espresso-200">
        <div className="px-6 py-4 border-b border-espresso-200 bg-cream space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-espresso-900">Pelanggan</h1>
            <Button size="sm" onClick={() => setFormModal({ open: true, customer: null })}>
              + Daftarkan
            </Button>
          </div>
          <SearchInput
            placeholder="Cari nama atau nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            showShortcut={false}
          />
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-espresso-100">
          {filtered.map((customer) => (
            <button
              key={customer.id}
              onClick={() => setSelectedId(customer.id)}
              className={cn(
                'w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-espresso-50 transition-colors cursor-pointer',
                selected?.id === customer.id && 'bg-espresso-50 border-l-2 border-l-amber-accent'
              )}
            >
              <div className="w-11 h-11 rounded-full bg-espresso-200 flex items-center justify-center text-base font-bold text-espresso-600 shrink-0">
                {customer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-espresso-800 truncate">
                  {customer.name}
                </p>
                <p className="text-xs text-espresso-400">{customer.phone}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-amber-accent justify-end">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">
                    {formatNumber(customer.loyaltyPoints)} pts
                  </span>
                </div>
                <p className="text-xs text-espresso-400 mt-0.5">
                  {customer.totalOrders} pesanan
                </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
             <div className="p-8 text-center text-espresso-400 text-sm">
               Tidak ada pelanggan yang ditemukan
             </div>
          )}
        </div>
      </div>

      {/* Customer Detail */}
      <div className="w-96 shrink-0 flex flex-col bg-cream relative">
        {selected ? (
          <>
            <div className="px-6 py-4 border-b border-espresso-200 flex items-center justify-between">
              <h2 className="font-bold text-espresso-900">Detail Pelanggan</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFormModal({ open: true, customer: selected })}
                  className="p-1.5 rounded-lg hover:bg-espresso-100 text-espresso-500 cursor-pointer"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(selected)}
                  className="p-1.5 rounded-lg hover:bg-red-50 hover:text-rose-accent text-espresso-500 cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-espresso-200 mx-1"></div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 rounded-lg hover:bg-espresso-100 text-espresso-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Avatar & Name */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-espresso-200 flex items-center justify-center text-3xl font-bold text-espresso-600 mx-auto mb-3">
                  {selected.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-espresso-900">
                  {selected.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-espresso-400">
                  <Phone className="w-3.5 h-3.5" />
                  {selected.phone}
                </div>
                {selected.email && (
                  <div className="flex items-center justify-center gap-2 text-sm text-espresso-400">
                    <Mail className="w-3.5 h-3.5" />
                    {selected.email}
                  </div>
                )}
              </div>

              {/* Loyalty Points */}
              <div className="bg-gradient-to-br from-amber-50 to-espresso-50 rounded-2xl border border-amber-200 p-5 text-center">
                <Award className="w-8 h-8 text-amber-accent mx-auto mb-2" />
                <p className="text-3xl font-bold font-mono text-espresso-900">
                  {formatNumber(selected.loyaltyPoints)}
                </p>
                <p className="text-sm text-espresso-500 mt-1">Poin Loyalty</p>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-xs text-espresso-400">
                    Setara dengan{' '}
                    <span className="font-semibold text-amber-accent">
                      {formatCurrency(selected.loyaltyPoints * 100)}
                    </span>{' '}
                    diskon
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-espresso-50 rounded-xl p-4 text-center">
                  <ShoppingBag className="w-5 h-5 text-espresso-400 mx-auto mb-2" />
                  <p className="text-xl font-bold font-mono text-espresso-900">
                    {selected.totalOrders}
                  </p>
                  <p className="text-xs text-espresso-400">Total Pesanan</p>
                </div>
                <div className="bg-espresso-50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-emerald-accent mx-auto mb-2" />
                  <p className="text-xl font-bold font-mono text-espresso-900">
                    {formatCurrency(selected.totalSpent)}
                  </p>
                  <p className="text-xs text-espresso-400">Total Belanja</p>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-espresso-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Bergabung
                  </span>
                  <span className="font-medium text-espresso-700">
                    {formatDate(selected.joinedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-espresso-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Kunjungan Terakhir
                  </span>
                  <span className="font-medium text-espresso-700">
                    {formatDate(selected.lastVisit)}
                  </span>
                </div>
              </div>

              {/* Favorite Items */}
              {selected.favoriteItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-espresso-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-accent" />
                    Item Favorit
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.favoriteItems.map((id) => (
                      <Badge key={id} variant="default">
                        {id.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-espresso-100 flex items-center justify-center text-espresso-300 mb-4">
              <User className="w-8 h-8" />
            </div>
            <p className="font-medium text-espresso-500">Pilih pelanggan</p>
            <p className="text-sm text-espresso-400 mt-1">
              Klik nama pelanggan untuk melihat detail dan riwayat
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, customer: null })}
        customer={formModal.customer}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Hapus Pelanggan?"
        message={`Data pelanggan "${deleteConfirm?.name}" akan dihapus permanen.`}
        confirmLabel="Ya, Hapus"
      />
    </div>
  );
}
