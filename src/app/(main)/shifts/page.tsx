'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useShiftStore } from '@/stores/shift-store';
import { useToastStore } from '@/stores/toast-store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import {
  Clock,
  PlayCircle,
  StopCircle,
  Calculator,
  AlertTriangle,
  History,
} from 'lucide-react';

export default function ShiftsPage() {
  const { user } = useAuthStore();
  const { activeShift, history, openShift, closeShift } = useShiftStore();
  const { addToast } = useToastStore();

  const [startingCash, setStartingCash] = useState<number>(500000);
  const [actualCash, setActualCash] = useState<number>(activeShift?.expectedCash || 0);
  const [isClosing, setIsClosing] = useState(false);

  // Auto-update actualCash when closing panel opens
  const handleInitiateClose = () => {
    if (activeShift) {
      setActualCash(activeShift.expectedCash);
    }
    setIsClosing(true);
  };

  const handleOpenShift = () => {
    if (!user) return;
    openShift(user.name, startingCash);
    addToast('Shift berhasil dibuka', 'success');
  };

  const handleCloseShift = () => {
    if (!activeShift) return;
    closeShift(actualCash);
    setIsClosing(false);
    addToast('Shift berhasil ditutup', 'success');
  };

  const variance = actualCash - (activeShift?.expectedCash || 0);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900">Manajemen Shift</h1>
        <p className="text-sm text-espresso-400 mt-1">
          Kelola buka dan tutup shift kasir
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Shift Card */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-espresso-900">Shift Saat Ini</h2>
            {activeShift?.status === 'active' ? (
              <Badge variant="success" dot>Aktif</Badge>
            ) : (
              <Badge variant="neutral">Tidak ada shift aktif</Badge>
            )}
          </div>

          {activeShift && activeShift.status === 'active' ? (
            <div className="space-y-6">
              {/* User & Time Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-espresso-50 border border-espresso-100">
                <div className="w-12 h-12 rounded-full bg-espresso-200 flex items-center justify-center text-lg font-bold text-espresso-600">
                  {activeShift.cashierName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-espresso-900">{activeShift.cashierName}</p>
                  <p className="text-sm text-espresso-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    Mulai: {formatTime(activeShift.startTime.toISOString())}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-espresso-100 bg-white">
                  <p className="text-xs font-medium text-espresso-500 mb-1 uppercase tracking-wider">Kas Awal</p>
                  <p className="text-lg font-bold font-mono text-espresso-900">
                    {formatCurrency(activeShift.startingCash)}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-espresso-100 bg-white">
                  <p className="text-xs font-medium text-espresso-500 mb-1 uppercase tracking-wider">Pendapatan Shift</p>
                  <p className="text-lg font-bold font-mono text-espresso-900">
                    {formatCurrency(activeShift.revenue)}
                  </p>
                  <p className="text-[11px] text-espresso-400 mt-0.5">{activeShift.transactions} transaksi</p>
                </div>
              </div>

              {/* Action */}
              {!isClosing ? (
                <Button 
                  fullWidth 
                  size="lg" 
                  variant="secondary"
                  leftIcon={<StopCircle className="w-5 h-5" />}
                  onClick={handleInitiateClose}
                >
                  Tutup Shift
                </Button>
              ) : (
                <div className="p-5 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 space-y-4 animate-fade-in">
                  <h3 className="font-semibold text-espresso-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-accent" />
                    Rekonsiliasi Kas
                  </h3>
                  
                  <div>
                    <label className="block text-sm text-espresso-500 mb-1.5">Kas Fisik Aktual (Laci)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400 font-medium">Rp</span>
                      <input
                        type="number"
                        value={actualCash}
                        onChange={(e) => setActualCash(Number(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-espresso-200 bg-white text-lg font-mono font-bold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-amber-accent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-espresso-600">
                      <span>Kas Sistem (Seharusnya)</span>
                      <span className="font-mono font-semibold">{formatCurrency(activeShift.expectedCash)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-espresso-200/50">
                      <span className="font-medium text-espresso-900">Selisih</span>
                      <span className={`font-mono font-bold ${variance === 0 ? 'text-emerald-600' : variance < 0 ? 'text-rose-accent' : 'text-amber-accent'}`}>
                        {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                      </span>
                    </div>
                  </div>

                  {variance !== 0 && (
                    <div className="flex gap-2 p-3 rounded-lg bg-red-50 text-red-800 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Terdapat selisih kas fisik dan sistem. Harap pastikan jumlah benar sebelum menutup.
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" fullWidth onClick={() => setIsClosing(false)}>Batal</Button>
                    <Button fullWidth onClick={handleCloseShift}>Konfirmasi Tutup</Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8 text-emerald-accent" />
              </div>
              <h3 className="text-lg font-semibold text-espresso-900 mb-2">Mulai Shift Baru</h3>
              <p className="text-sm text-espresso-500 mb-6 max-w-xs mx-auto">
                Masukkan saldo kas awal di laci untuk memulai shift.
              </p>
              <div className="max-w-xs mx-auto mb-6 text-left">
                <label className="block text-sm font-medium text-espresso-700 mb-2">Kas Awal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400 font-medium">Rp</span>
                  <input
                    type="number"
                    value={startingCash}
                    onChange={(e) => setStartingCash(Number(e.target.value) || 0)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-espresso-200 bg-white text-lg font-mono font-bold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-emerald-accent"
                  />
                </div>
              </div>
              <Button size="lg" leftIcon={<PlayCircle className="w-5 h-5" />} className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleOpenShift}>
                Buka Shift
              </Button>
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-6 shadow-card flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-lg font-bold text-espresso-900 flex items-center gap-2">
              <History className="w-5 h-5 text-espresso-400" />
              Riwayat Shift
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {history.map((h) => {
              const diff = (h.actualCash || 0) - h.expectedCash;
              return (
                <div key={h.id} className="p-4 rounded-xl border border-espresso-100 bg-white hover:bg-espresso-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-espresso-900 text-sm">{h.cashierName}</p>
                      <p className="text-xs text-espresso-400 mt-0.5">{formatDate(h.startTime.toISOString())}</p>
                    </div>
                    <Badge variant="neutral" className="text-[10px]">Ditutup</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-espresso-500 text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(h.startTime.toISOString())} - {h.endTime ? formatTime(h.endTime.toISOString()) : '?'}
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-espresso-900">{formatCurrency(h.revenue)}</p>
                      {diff !== 0 && (
                        <p className={`text-[10px] font-medium mt-0.5 ${diff < 0 ? 'text-rose-accent' : 'text-amber-accent'}`}>
                          Selisih: {formatCurrency(diff)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {history.length === 0 && (
              <div className="py-8 text-center text-espresso-400 text-sm">
                Belum ada riwayat shift.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
