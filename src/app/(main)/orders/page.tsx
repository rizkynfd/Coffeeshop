'use client';

import { useState } from 'react';
import { useOrderStore } from '@/stores/order-store';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, getTimeAgo, getSizeLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Store,
  Truck,
  ShoppingBag,
  AlertTriangle,
  ChevronRight,
  MoreHorizontal,
  User,
  RefreshCw,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const columns: { status: OrderStatus; label: string; icon: React.ReactNode; color: string }[] = [
  {
    status: 'pending',
    label: 'Menunggu',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-amber-accent',
  },
  {
    status: 'preparing',
    label: 'Diproses',
    icon: <ChefHat className="w-4 h-4" />,
    color: 'text-sky-accent',
  },
  {
    status: 'served',
    label: 'Disajikan',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-emerald-accent',
  },
];

const statusBadge: Record<OrderStatus, { variant: any; label: string }> = {
  pending: { variant: 'warning', label: 'Menunggu' },
  preparing: { variant: 'info', label: 'Diproses' },
  served: { variant: 'success', label: 'Disajikan' },
  completed: { variant: 'neutral', label: 'Selesai' },
  cancelled: { variant: 'danger', label: 'Dibatal' },
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'preparing',
  preparing: 'served',
  served: 'completed',
};

const nextStatusLabel: Partial<Record<OrderStatus, string>> = {
  pending: 'Mulai Proses',
  preparing: 'Tandai Siap',
  served: 'Selesai',
};

const typeIcon: Record<string, React.ReactNode> = {
  'dine-in': <Store className="w-3.5 h-3.5" />,
  takeaway: <ShoppingBag className="w-3.5 h-3.5" />,
  delivery: <Truck className="w-3.5 h-3.5" />,
};

const typeLabel: Record<string, string> = {
  'dine-in': 'Dine In',
  takeaway: 'Take Away',
  delivery: 'Delivery',
};

function OrderCard({
  order,
  onAdvance,
  onVoid,
  canVoid,
}: {
  order: Order;
  onAdvance: () => void;
  onVoid: () => void;
  canVoid: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const next = nextStatus[order.status];

  return (
    <div className="bg-cream rounded-xl border border-espresso-200 shadow-card hover:shadow-card-hover transition-all animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-espresso-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-espresso-800 font-mono">
            #{order.orderNumber.split('-').pop()}
          </span>
          <Badge variant="neutral" className="gap-1 text-[10px]">
            {typeIcon[order.type]}
            {typeLabel[order.type]}
            {order.tableNumber && ` · Meja ${order.tableNumber}`}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-espresso-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeAgo(order.createdAt)}
          </span>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-lg hover:bg-espresso-100 text-espresso-400 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actions dropdown */}
      {showActions && (
        <div className="mx-3 mt-2 p-2 bg-espresso-50 rounded-xl border border-espresso-100 animate-fade-in">
          {canVoid && (
            <button
              onClick={() => {
                onVoid();
                setShowActions(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-accent hover:bg-red-50 transition-colors cursor-pointer text-left"
            >
              <XCircle className="w-4 h-4" />
              Void / Batalkan
            </button>
          )}
          {!canVoid && (
            <p className="px-3 py-2 text-xs text-espresso-400">
              Butuh role Supervisor/Owner untuk void
            </p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="px-4 py-3 space-y-1.5">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-espresso-800">
                <span className="font-bold text-espresso-600">
                  {item.quantity}×
                </span>{' '}
                {item.productName}
              </p>
              <p className="text-[11px] text-espresso-400">
                {[
                  getSizeLabel(item.size),
                  item.temperature,
                  ...item.modifiers.map((m) => m.name),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {item.notes && (
                <p className="text-[11px] text-espresso-400 italic">
                  📝 {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-espresso-100 flex items-center justify-between">
        <div>
          {order.customerName && (
            <p className="text-xs text-espresso-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              {order.customerName}
            </p>
          )}
          <p className="text-sm font-bold font-mono text-espresso-900">
            {formatCurrency(order.total)}
          </p>
        </div>
        {next && (
          <Button
            size="sm"
            variant={order.status === 'served' ? 'secondary' : 'primary'}
            onClick={onAdvance}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            {nextStatusLabel[order.status]}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, updateOrderStatus, voidOrder, getActiveOrders } =
    useOrderStore();
  const { hasRole } = useAuthStore();
  const canVoid = hasRole(['supervisor', 'owner']);

  const activeOrders = getActiveOrders();
  const totalActive = activeOrders.length;

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-espresso-200 bg-cream shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-espresso-900">
              Pesanan Aktif
            </h1>
            <p className="text-sm text-espresso-400 mt-0.5">
              {totalActive} pesanan sedang berlangsung
            </p>
          </div>
          <button className="p-2.5 rounded-xl border border-espresso-200 text-espresso-500 hover:bg-espresso-50 transition-colors cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-6">
        {totalActive === 0 ? (
          <EmptyState
            icon={<CheckCircle className="w-8 h-8" />}
            title="Semua Pesanan Selesai"
            description="Tidak ada pesanan aktif saat ini. Tunggu pesanan baru masuk."
            className="h-full"
          />
        ) : (
          <div className="flex gap-4 h-full overflow-x-auto">
            {columns.map((col) => {
              const colOrders = orders.filter(
                (o) => o.status === col.status
              );
              return (
                <div
                  key={col.status}
                  className="flex flex-col w-80 min-w-[280px] shrink-0"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('', col.color)}>{col.icon}</span>
                      <h2 className="font-semibold text-espresso-800 text-sm">
                        {col.label}
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-espresso-100 text-espresso-600 rounded-full">
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {colOrders.length === 0 ? (
                      <div className="border-2 border-dashed border-espresso-200 rounded-xl p-8 text-center text-sm text-espresso-300">
                        Tidak ada pesanan
                      </div>
                    ) : (
                      colOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          canVoid={canVoid}
                          onAdvance={() => {
                            const next = nextStatus[order.status];
                            if (next) updateOrderStatus(order.id, next);
                          }}
                          onVoid={() => voidOrder(order.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
