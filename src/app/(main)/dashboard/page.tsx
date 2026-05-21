'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useOrderStore } from '@/stores/order-store';
import { formatCurrency, formatCurrency as fc, getTimeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Coffee,
  ArrowRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { dailySalesData, topProducts, paymentMethodStats } from '@/data/mock-orders';
import { mockCustomers } from '@/data/mock-customers';

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-accent bg-emerald-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold font-mono text-espresso-900">{value}</p>
      <p className="text-sm font-medium text-espresso-700 mt-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-espresso-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function MiniBarChart({ data }: { data: { hour: string; sales: number }[] }) {
  const max = Math.max(...data.map((d) => d.sales));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => {
        const height = (d.sales / max) * 100;
        const isNow =
          d.hour ===
          `${new Date().getHours().toString().padStart(2, '0')}:00`;
        return (
          <div
            key={d.hour}
            className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
            title={`${d.hour}: ${formatCurrency(d.sales)}`}
          >
            <div className="w-full relative flex flex-col justify-end h-20">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80 ${
                  isNow ? 'bg-amber-accent' : 'bg-espresso-200'
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[8px] text-espresso-400 hidden lg:block">
              {d.hour.split(':')[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBar({
  label,
  value,
  max,
  rank,
}: {
  label: string;
  value: number;
  max: number;
  rank: number;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold font-mono text-espresso-400 w-4">
        {rank}
      </span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-espresso-700">{label}</span>
          <span className="text-xs font-mono text-espresso-500">
            {formatCurrency(value)}
          </span>
        </div>
        <div className="h-2 bg-espresso-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-accent rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getTodayOrders } = useOrderStore();
  const router = useRouter();

  const todayOrders = getTodayOrders();
  const completedOrders = todayOrders.filter(
    (o) => o.status === 'completed'
  );
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue =
    completedOrders.length > 0
      ? Math.round(totalRevenue / completedOrders.length)
      : 0;
  const activeOrders = todayOrders.filter((o) =>
    ['pending', 'preparing', 'served'].includes(o.status)
  );

  const maxSales = Math.max(...topProducts.map((p) => p.revenue));

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900">
            Dashboard
          </h1>
          <p className="text-sm text-espresso-400 mt-1">
            Selamat datang kembali,{' '}
            <span className="font-semibold text-espresso-600">
              {user?.name}
            </span>{' '}
            ·{' '}
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <Button onClick={() => router.push('/pos')} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Buka Kasir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Penjualan Hari Ini"
          value={formatCurrency(totalRevenue)}
          subtitle={`${completedOrders.length} transaksi`}
          icon={<TrendingUp className="w-5 h-5 text-amber-accent" />}
          color="bg-amber-50"
          trend="+12.4%"
        />
        <StatCard
          title="Total Transaksi"
          value={todayOrders.length.toString()}
          subtitle={`${activeOrders.length} masih aktif`}
          icon={<ShoppingCart className="w-5 h-5 text-sky-accent" />}
          color="bg-sky-50"
          trend="+3"
        />
        <StatCard
          title="Rata-rata / Order"
          value={formatCurrency(avgOrderValue)}
          subtitle="Per transaksi"
          icon={<Coffee className="w-5 h-5 text-espresso-500" />}
          color="bg-espresso-100"
        />
        <StatCard
          title="Pelanggan Hari Ini"
          value={mockCustomers.length.toString()}
          subtitle="Total terdaftar"
          icon={<Users className="w-5 h-5 text-emerald-accent" />}
          color="bg-emerald-50"
          trend="+2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-espresso-900">
                Penjualan Per Jam
              </h2>
              <p className="text-xs text-espresso-400 mt-0.5">Hari ini</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-espresso-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-accent" />
                Sekarang
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-espresso-200" />
                Lainnya
              </div>
            </div>
          </div>
          <MiniBarChart data={dailySalesData} />
        </div>

        {/* Payment Methods */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
          <h2 className="text-base font-bold text-espresso-900 mb-4">
            Metode Pembayaran
          </h2>
          <div className="space-y-3">
            {paymentMethodStats.map((stat) => (
              <div
                key={stat.method}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-espresso-700">
                    {stat.method}
                  </p>
                  <p className="text-xs text-espresso-400">
                    {stat.count} transaksi
                  </p>
                </div>
                <p className="text-sm font-bold font-mono text-espresso-900">
                  {formatCurrency(stat.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-espresso-900">
              Produk Terlaris
            </h2>
            <span className="text-xs text-espresso-400">Hari ini</span>
          </div>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <HorizontalBar
                key={p.name}
                label={p.name}
                value={p.revenue}
                max={maxSales}
                rank={i + 1}
              />
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-espresso-900">
              Pesanan Terbaru
            </h2>
            <button
              onClick={() => router.push('/orders')}
              className="text-xs font-medium text-amber-accent hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {todayOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b border-espresso-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-espresso-50 flex items-center justify-center">
                    {order.type === 'dine-in' ? (
                      <Coffee className="w-4 h-4 text-espresso-400" />
                    ) : order.type === 'takeaway' ? (
                      <ShoppingCart className="w-4 h-4 text-espresso-400" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-espresso-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-espresso-800">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-espresso-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getTimeAgo(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-espresso-900">
                    {formatCurrency(order.total)}
                  </p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string }> = {
    pending: { variant: 'warning', label: 'Menunggu' },
    preparing: { variant: 'info', label: 'Diproses' },
    served: { variant: 'success', label: 'Disajikan' },
    completed: { variant: 'neutral', label: 'Selesai' },
    cancelled: { variant: 'danger', label: 'Dibatal' },
  };
  const cfg = map[status] || { variant: 'neutral', label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
