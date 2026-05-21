'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/stores/settings-store';
import { useToastStore } from '@/stores/toast-store';
import {
  Store,
  Printer,
  Receipt,
  Users,
  Shield,
  Bell,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();
  const { addToast } = useToastStore();
  
  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);
  
  // Local state for form edits
  const [form, setForm] = useState(settings);

  // Sync form with settings if they change externally
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(form);
    setIsSaved(true);
    addToast('Pengaturan berhasil disimpan', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const tabs = [
    { id: 'general', label: 'Toko', icon: <Store className="w-4 h-4" /> },
    { id: 'receipt', label: 'Struk', icon: <Receipt className="w-4 h-4" /> },
    { id: 'hardware', label: 'Perangkat', icon: <Printer className="w-4 h-4" /> },
    { id: 'team', label: 'Tim', icon: <Users className="w-4 h-4" /> },
    { id: 'security', label: 'Keamanan', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifikasi', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900">Pengaturan</h1>
          <p className="text-sm text-espresso-400 mt-1">Konfigurasi sistem kasir</p>
        </div>
        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="text-sm text-emerald-600 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Disimpan
            </span>
          )}
          <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
            Simpan Perubahan
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar Tabs */}
        <div className="w-64 shrink-0 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-left',
                activeTab === tab.id
                  ? 'bg-espresso-900 text-cream shadow-md'
                  : 'text-espresso-600 hover:bg-espresso-50 hover:text-espresso-900'
              )}
            >
              <span className={cn(activeTab === tab.id ? 'text-amber-accent' : 'text-espresso-400')}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-cream rounded-2xl border border-espresso-200 shadow-card overflow-y-auto p-8">
          
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h2 className="text-lg font-bold text-espresso-900 mb-6">Profil Toko</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-espresso-700 mb-2">Nama Toko</label>
                  <input 
                    type="text" 
                    name="storeName"
                    value={form.storeName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-espresso-700 mb-2">Alamat</label>
                  <textarea 
                    rows={3} 
                    name="storeAddress"
                    value={form.storeAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent resize-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-espresso-700 mb-2">Telepon</label>
                    <input 
                      type="text" 
                      name="storePhone"
                      value={form.storePhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      name="storeEmail"
                      value={form.storeEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent" 
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-espresso-100">
                  <h3 className="text-sm font-bold text-espresso-900 mb-4">Pajak & Biaya</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-espresso-700 mb-2">PPN (%)</label>
                      <input 
                        type="number" 
                        name="taxRate"
                        value={form.taxRate}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent" 
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-espresso-700 mb-2">Service Charge (%)</label>
                      <input 
                        type="number" 
                        name="serviceCharge"
                        value={form.serviceCharge}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent" 
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h2 className="text-lg font-bold text-espresso-900 mb-6">Pengaturan Struk</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-espresso-700 mb-2">Pesan Footer 1</label>
                  <input 
                    type="text" 
                    name="receiptFooter1"
                    value={form.receiptFooter1}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso-700 mb-2">Pesan Footer 2</label>
                  <input 
                    type="text" 
                    name="receiptFooter2"
                    value={form.receiptFooter2}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-accent" 
                  />
                </div>
                
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-espresso-900 text-sm">Cetak Logo</p>
                    <p className="text-xs text-espresso-500">Tampilkan logo hitam putih di atas struk</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="printLogo"
                      checked={form.printLogo}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-espresso-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-accent"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'general' && activeTab !== 'receipt' && (
            <div className="flex flex-col items-center justify-center h-full text-center text-espresso-500 animate-fade-in">
              <Store className="w-12 h-12 text-espresso-200 mb-4" />
              <p className="font-medium">Pengaturan {tabs.find(t => t.id === activeTab)?.label}</p>
              <p className="text-sm text-espresso-400 mt-1 max-w-xs">Modul ini akan tersedia pada pembaruan sistem berikutnya.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
