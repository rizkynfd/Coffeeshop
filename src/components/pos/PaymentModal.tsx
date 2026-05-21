'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cart-store';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Banknote,
  QrCode,
  CreditCard,
  Smartphone,
  Check,
  ArrowLeft,
} from 'lucide-react';
import type { Payment, PaymentMethodType } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payments: Payment[]) => void;
}

const paymentMethods: {
  type: PaymentMethodType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: 'cash', label: 'Cash', icon: <Banknote className="w-5 h-5" /> },
  { type: 'qris', label: 'QRIS', icon: <QrCode className="w-5 h-5" /> },
  { type: 'debit', label: 'Debit', icon: <CreditCard className="w-5 h-5" /> },
  { type: 'e-wallet', label: 'E-Wallet', icon: <Smartphone className="w-5 h-5" /> },
];

const quickCashAmounts = [20000, 50000, 100000, 200000, 500000];

export function PaymentModal({ isOpen, onClose, onConfirm }: PaymentModalProps) {
  const { getTotal } = useCartStore();
  const total = getTotal();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);

  const change = selectedMethod === 'cash' ? cashAmount - total : 0;
  const canPay =
    selectedMethod === 'cash' ? cashAmount >= total : selectedMethod !== null;

  const handleConfirm = () => {
    if (!selectedMethod) return;

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      method: selectedMethod,
      amount: selectedMethod === 'cash' ? cashAmount : total,
    };

    onConfirm([payment]);
    resetForm();
  };

  const resetForm = () => {
    setSelectedMethod(null);
    setCashAmount(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Pembayaran" size="lg">
      <div className="p-6">
        {/* Total */}
        <div className="text-center pb-6 border-b border-espresso-100">
          <p className="text-sm text-espresso-500 mb-1">Total Pembayaran</p>
          <p className="text-3xl font-bold font-mono text-espresso-900">
            {formatCurrency(total)}
          </p>
        </div>

        {/* Payment Method Selection */}
        {!selectedMethod && (
          <div className="py-6 space-y-3">
            <h3 className="text-sm font-semibold text-espresso-700">
              Pilih Metode Pembayaran
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.type}
                  onClick={() => {
                    setSelectedMethod(method.type);
                    if (method.type !== 'cash') setCashAmount(total);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-espresso-200 bg-white hover:bg-espresso-50 hover:border-espresso-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-espresso-50 flex items-center justify-center text-espresso-500 group-hover:text-amber-accent transition-colors">
                    {method.icon}
                  </div>
                  <span className="text-sm font-semibold text-espresso-700">
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cash Input */}
        {selectedMethod === 'cash' && (
          <div className="py-6 space-y-4 animate-fade-in">
            <button
              onClick={() => setSelectedMethod(null)}
              className="flex items-center gap-1.5 text-sm text-espresso-500 hover:text-espresso-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>

            <h3 className="text-sm font-semibold text-espresso-700">
              Masukkan Nominal Cash
            </h3>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickCashAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCashAmount(amount)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl border text-sm font-mono font-medium transition-all cursor-pointer',
                    cashAmount === amount
                      ? 'border-amber-accent bg-amber-50 text-amber-accent'
                      : 'border-espresso-200 bg-white text-espresso-600 hover:bg-espresso-50'
                  )}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
              <button
                onClick={() => setCashAmount(total)}
                className={cn(
                  'px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                  cashAmount === total
                    ? 'border-amber-accent bg-amber-50 text-amber-accent'
                    : 'border-espresso-200 bg-white text-espresso-600 hover:bg-espresso-50'
                )}
              >
                Uang Pas
              </button>
            </div>

            {/* Manual Input */}
            <div>
              <label className="block text-sm text-espresso-500 mb-1.5">
                Atau masukkan manual:
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-espresso-400 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-espresso-200 bg-white text-lg font-mono font-bold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-amber-accent/30 focus:border-amber-accent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Change Display */}
            {cashAmount > 0 && (
              <div
                className={cn(
                  'p-4 rounded-xl text-center',
                  change >= 0
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-red-50 border border-red-200'
                )}
              >
                <p className="text-xs text-espresso-500 mb-1">
                  {change >= 0 ? 'Kembalian' : 'Kurang'}
                </p>
                <p
                  className={cn(
                    'text-2xl font-bold font-mono',
                    change >= 0 ? 'text-emerald-700' : 'text-rose-accent'
                  )}
                >
                  {formatCurrency(Math.abs(change))}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Non-Cash Confirmation */}
        {selectedMethod && selectedMethod !== 'cash' && (
          <div className="py-6 space-y-4 animate-fade-in">
            <button
              onClick={() => setSelectedMethod(null)}
              className="flex items-center gap-1.5 text-sm text-espresso-500 hover:text-espresso-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>

            <div className="p-8 rounded-xl bg-espresso-50 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-espresso-100 flex items-center justify-center text-espresso-500">
                {paymentMethods.find((m) => m.type === selectedMethod)?.icon}
              </div>
              <p className="text-sm text-espresso-500 mb-1">
                Pembayaran via{' '}
                <span className="font-semibold text-espresso-700">
                  {paymentMethods.find((m) => m.type === selectedMethod)?.label}
                </span>
              </p>
              <p className="text-2xl font-bold font-mono text-espresso-900">
                {formatCurrency(total)}
              </p>
              <p className="text-xs text-espresso-400 mt-2">
                Konfirmasi setelah pembayaran diterima
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      {selectedMethod && (
        <div className="px-6 py-4 border-t border-espresso-100 bg-cream/95">
          <Button
            size="lg"
            fullWidth
            onClick={handleConfirm}
            disabled={!canPay}
            leftIcon={<Check className="w-5 h-5" />}
          >
            {selectedMethod === 'cash'
              ? `Konfirmasi — Kembalian ${formatCurrency(Math.max(0, change))}`
              : 'Konfirmasi Pembayaran'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
