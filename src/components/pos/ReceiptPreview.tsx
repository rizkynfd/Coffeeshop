'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatTime, formatDate, getSizeLabel } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';
import { Printer, Check, CheckCircle2 } from 'lucide-react';
import type { Order } from '@/types';

interface ReceiptPreviewProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptPreview({ order, isOpen, onClose }: ReceiptPreviewProps) {
  const { settings } = useSettingsStore();
  const [hasPrinted, setHasPrinted] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
    setHasPrinted(true);
  };

  const handleClose = () => {
    setHasPrinted(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm" showCloseButton={false}>
      <div className="p-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-accent" />
          </div>
        </div>
        <h3 className="text-center text-lg font-bold text-espresso-900 mb-1">
          Pembayaran Berhasil!
        </h3>
        <p className="text-center text-sm text-espresso-400 mb-6">
          Order #{order.orderNumber}
        </p>

        {/* Printed Badge */}
        {hasPrinted && (
          <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-accent" />
            <span className="text-sm text-emerald-accent font-medium">Struk sudah dicetak</span>
          </div>
        )}

        {/* Receipt */}
        <div className="bg-espresso-50 rounded-xl p-5 receipt-text border border-espresso-100">
          {/* Header — from Settings */}
          <div className="text-center border-b border-dashed border-espresso-300 pb-3 mb-3">
            <p className="font-bold text-sm">☕ {settings.storeName.toUpperCase()}</p>
            <p className="text-espresso-500">{settings.storeAddress}</p>
            <p className="text-espresso-500">Telp: {settings.storePhone}</p>
          </div>

          {/* Order Info */}
          <div className="border-b border-dashed border-espresso-300 pb-3 mb-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-espresso-500">No. Order</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-espresso-500">Tanggal</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-espresso-500">Waktu</span>
              <span>{formatTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-espresso-500">Kasir</span>
              <span>{order.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-espresso-500">Tipe</span>
              <span className="capitalize">{order.type.replace('-', ' ')}</span>
            </div>
            {order.tableNumber && (
              <div className="flex justify-between">
                <span className="text-espresso-500">Meja</span>
                <span>{order.tableNumber}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-b border-dashed border-espresso-300 pb-3 mb-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between">
                  <span className="font-medium">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-mono">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
                {/* Details */}
                <div className="text-espresso-400 text-[11px] ml-4">
                  {item.size && <span>{getSizeLabel(item.size)}</span>}
                  {item.temperature && <span> · {item.temperature}</span>}
                  {item.modifiers.map((m) => (
                    <span key={m.modifierId}> · +{m.name}</span>
                  ))}
                  {item.notes && (
                    <span className="block italic">📝 {item.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-espresso-500">Subtotal</span>
              <span className="font-mono">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-accent">
                <span>Diskon {order.discountLabel}</span>
                <span className="font-mono">
                  -{formatCurrency(order.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-espresso-500">PPN (11%)</span>
              <span className="font-mono">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-dashed border-espresso-300">
              <span>TOTAL</span>
              <span className="font-mono">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-3 pt-3 border-t border-dashed border-espresso-300 space-y-1">
            {order.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between">
                <span className="text-espresso-500 capitalize">
                  {payment.method.replace('-', ' ')}
                </span>
                <span className="font-mono">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
            {order.payments[0]?.method === 'cash' && (
              <div className="flex justify-between font-medium">
                <span className="text-espresso-500">Kembalian</span>
                <span className="font-mono">
                  {formatCurrency(
                    order.payments[0].amount - order.total
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Footer — from Settings */}
          <div className="text-center mt-4 pt-3 border-t border-dashed border-espresso-300">
            <p className="text-espresso-400">{settings.receiptFooter1}</p>
            <p className="text-espresso-400">{settings.receiptFooter2}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-espresso-100 flex gap-3 no-print">
        <Button
          variant={hasPrinted ? 'secondary' : 'secondary'}
          size="lg"
          fullWidth
          onClick={handlePrint}
          className={hasPrinted ? 'border-emerald-200 text-emerald-600' : ''}
        >
          {hasPrinted ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-accent" />
              Cetak Lagi
            </>
          ) : (
            <>
              <Printer className="w-4 h-4 mr-2" />
              Cetak Struk
            </>
          )}
        </Button>
        <Button size="lg" fullWidth onClick={handleClose}>
          Selesai
        </Button>
      </div>
    </Modal>
  );
}
