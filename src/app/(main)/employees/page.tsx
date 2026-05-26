'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { AddEmployeeModal } from '@/components/employees/AddEmployeeModal';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast-store';
import { cn } from '@/lib/utils';
import { User as UserIcon, Shield, Search, Loader2 } from 'lucide-react';
import type { User } from '@/types';

export default function EmployeesPage() {
  const { addToast } = useToastStore();
  
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['cashier', 'supervisor', 'owner'])
        .order('name');
        
      if (error) throw error;
      setEmployees(data || []);
    } catch (err: any) {
      addToast('Gagal memuat data pegawai', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900">Manajemen Pegawai</h1>
          <p className="text-sm text-espresso-500 mt-1">
            Kelola akses kasir dan supervisor untuk sistem POS Anda.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          + Tambah Pegawai
        </Button>
      </div>

      <div className="bg-cream border border-espresso-200 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
        <div className="p-4 border-b border-espresso-200 bg-white">
          <div className="max-w-md relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400" />
            <input
              type="text"
              placeholder="Cari nama atau username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-espresso-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-amber-accent focus:ring-2 focus:ring-amber-accent/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-espresso-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-amber-accent" />
              <p>Memuat data pegawai...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((employee) => (
                <div 
                  key={employee.id}
                  className="bg-white border border-espresso-200 rounded-xl p-5 hover:border-amber-accent/50 transition-colors shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-espresso-100 flex items-center justify-center text-lg font-bold text-espresso-600 shrink-0">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-espresso-900 truncate">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-espresso-500 mb-3 truncate">
                        @{employee.username}
                      </p>
                      
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-espresso-50 text-espresso-700">
                        {employee.role === 'supervisor' ? (
                          <Shield className="w-3.5 h-3.5 text-amber-accent" />
                        ) : (
                          <UserIcon className="w-3.5 h-3.5 text-espresso-400" />
                        )}
                        <span className="capitalize">{employee.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-espresso-400">
              <UserIcon className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-espresso-600">Tidak ada pegawai ditemukan</p>
              {search && <p className="text-sm mt-1">Coba gunakan kata kunci pencarian lain.</p>}
            </div>
          )}
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchEmployees}
      />
    </div>
  );
}
