import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'cashier' as UserRole
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan');
      }

      addToast('Pegawai berhasil ditambahkan!', 'success');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'cashier'
      });
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-espresso-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-cream rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-espresso-200 shrink-0">
          <h2 className="text-xl font-bold text-espresso-900">
            Tambah Pegawai Baru
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-espresso-400 hover:text-espresso-600 hover:bg-espresso-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-espresso-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-espresso-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent"
                placeholder="Misal: Budi Santoso"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-espresso-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-espresso-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent"
                placeholder="Misal: budisantoso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-espresso-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent"
                placeholder="Misal: budi@kopishop.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-espresso-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-700 mb-1">
                Jabatan (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2 bg-white border border-espresso-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent"
              >
                <option value="cashier">Kasir</option>
                <option value="supervisor">Supervisor</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-espresso-200 bg-espresso-50 flex justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="employee-form"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Pegawai'}
          </Button>
        </div>
      </div>
    </div>
  );
}
