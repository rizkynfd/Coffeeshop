'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useOrderStore } from '@/stores/order-store';
import { useCustomerStore } from '@/stores/customer-store';
import { useMenuStore } from '@/stores/menu-store';
import { formatCurrency, getTimeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Coffee,
  ArrowRight,
  Clock,
} from 'lucide-react';

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
  const max = Math.max(...data.map((d) => d.sales), 1); // Avoid division by zero
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
  const pct = max > 0 ? (value / max) * 100 : 0;
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
  const { customers } = useCustomerStore();
  const { products } = useMenuStore();
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

  // Calculate dynamic sales per hour
  const dailySalesData = useMemo(() => {
    const hourlyData = Array.from({ length: 12 }, (_, i) => {
      const hourStr = (i + 10).toString().padStart(2, '0'); // Assuming store opens at 10 AM
      return { hour: `${hourStr}:00`, sales: 0 };
    });

    completedOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const hour = date.getHours();
      // Map hour to our array index if within 10-21
      if (hour >= 10 && hour <= 21) {
        hourlyData[hour - 10].sales += order.total;
      }
    });
    return hourlyData;
  }, [completedOrders]);

  // Calculate dynamic payment method stats
  const paymentMethodStats = useMemo(() => {
    const stats: Record<string, { method: string; count: number; amount: number }> = {
      cash: { method: 'Tunai', count: 0, amount: 0 },
      qris: { method: 'QRIS', count: 0, amount: 0 },
      card: { method: 'Kartu Debit/Kredit', count: 0, amount: 0 },
    };

    completedOrders.forEach(order => {
      // Look into the payments array if exists, otherwise default to cash
      const method = order.payments && order.payments.length > 0 ? order.payments[0].method : 'cash';
      if (stats[method]) {
        stats[method].count += 1;
        stats[method].amount += order.total;
      }
    });

    return Object.values(stats).sort((a, b) => b.amount - a.amount);
  }, [completedOrders]);

  // Calculate dynamic top products
  const topProducts = useMemo(() => {
    const productStats: Record<string, { name: string; revenue: number }> = {};
    
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productStats[item.productId]) {
          const product = products.find(p => p.id === item.productId);
          productStats[item.productId] = { 
            name: product ? product.name : 'Unknown Product', 
            revenue: 0 
          };
        }
        productStats[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5
  }, [completedOrders, products]);

  const maxSales = Math.max(...topProducts.map((p) => p.revenue), 1);

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
        />
        <StatCard
          title="Total Transaksi"
          value={todayOrders.length.toString()}
          subtitle={`${activeOrders.length} masih aktif`}
          icon={<ShoppingCart className="w-5 h-5 text-sky-accent" />}
          color="bg-sky-50"
        />
        <StatCard
          title="Rata-rata / Order"
          value={formatCurrency(avgOrderValue)}
          subtitle="Per transaksi"
          icon={<Coffee className="w-5 h-5 text-espresso-500" />}
          color="bg-espresso-100"
        />
        <StatCard
          title="Total Pelanggan"
          value={customers.length.toString()}
          subtitle="Pelanggan terdaftar"
          icon={<Users className="w-5 h-5 text-emerald-accent" />}
          color="bg-emerald-50"
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
              <p className="text-xs text-espresso-400 mt-0.5">Hari ini (10:00 - 21:00)</p>
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
            {paymentMethodStats.length > 0 ? paymentMethodStats.map((stat) => (
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
            )) : (
              <p className="text-sm text-espresso-400 text-center py-4">Belum ada transaksi</p>
            )}
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
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <HorizontalBar
                key={p.name}
                label={p.name}
                value={p.revenue}
                max={maxSales}
                rank={i + 1}
              />
            )) : (
              <p className="text-sm text-espresso-400 text-center py-4">Belum ada data penjualan</p>
            )}
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
            {todayOrders.length > 0 ? todayOrders.slice(0, 5).map((order) => (
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
            )) : (
              <p className="text-sm text-espresso-400 text-center py-4">Belum ada pesanan hari ini</p>
            )}
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
