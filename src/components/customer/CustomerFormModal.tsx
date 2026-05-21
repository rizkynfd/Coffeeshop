'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCustomerStore } from '@/stores/customer-store';
import { useToastStore } from '@/stores/toast-store';
import { Save } from 'lucide-react';
import type { Customer } from '@/types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export function CustomerFormModal({ isOpen, onClose, customer }: CustomerFormModalProps) {
  const { addCustomer, updateCustomer } = useCustomerStore();
  const { addToast } = useToastStore();
  const isEditing = !!customer;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
      });
    } else {
      setForm({ name: '', phone: '', email: '' });
    }
  }, [customer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      addToast('Nama dan No. HP wajib diisi', 'error');
      return;
    }

    if (isEditing && customer) {
      updateCustomer(customer.id, form);
      addToast(`Data pelanggan "${form.name}" berhasil diperbarui`, 'success');
    } else {
      addCustomer(form);
      addToast(`Pelanggan "${form.name}" berhasil didaftarkan`, 'success');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Pelanggan' : 'Daftarkan Pelanggan'} size="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">Nama Lengkap *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
            placeholder="Contoh: Budi Santoso"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">No. Handphone *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
            placeholder="Contoh: 081234567890"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-espresso-700 mb-2">Email (Opsional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent text-sm"
            placeholder="budi@example.com"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>Batal</Button>
          <Button type="submit" fullWidth leftIcon={<Save className="w-4 h-4" />}>
            {isEditing ? 'Simpan' : 'Daftarkan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
