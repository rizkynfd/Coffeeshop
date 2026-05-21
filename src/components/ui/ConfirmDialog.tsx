'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="p-6 text-center">
        <div
          className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            isDanger ? 'bg-red-50' : 'bg-amber-50'
          }`}
        >
          {isDanger ? (
            <Trash2 className="w-7 h-7 text-rose-accent" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-amber-accent" />
          )}
        </div>

        <h3 className="text-lg font-bold text-espresso-900 mb-2">{title}</h3>
        <p className="text-sm text-espresso-500 leading-relaxed max-w-xs mx-auto">
          {message}
        </p>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
