'use client';

import { useMemo } from 'react';
import { useOrderStore } from '@/stores/order-store';
import { useMenuStore } from '@/stores/menu-store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { TrendingUp, ShoppingBag, CreditCard, Users } from 'lucide-react';
import { useCustomerStore } from '@/stores/customer-store';

function StatCard({ title, value, sub, icon, color }: { title: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold font-mono text-espresso-900">{value}</p>
      <p className="text-sm font-medium text-espresso-700 mt-1">{title}</p>
      <p className="text-xs text-espresso-400 mt-0.5">{sub}</p>
    </div>
  );
}

function BarChart({ data }: { data: { hour: string; sales: number }[] }) {
  const max = Math.max(...data.map(d => d.sales), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 mt-4">
      {data.map(d => (
        <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" title={`${d.hour}: ${formatCurrency(d.sales)}`}>
          <div className="w-full flex flex-col justify-end h-28">
            <div className="w-full rounded-t bg-espresso-200 group-hover:bg-amber-accent transition-colors" style={{ height: `${(d.sales / max) * 100}%` }} />
          </div>
          <span className="text-[9px] text-espresso-400">{d.hour.split(':')[0]}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { getTodayOrders } = useOrderStore();
  const { products } = useMenuStore();
  const { customers } = useCustomerStore();
  
  const todayOrders = getTodayOrders();
  const completed = todayOrders.filter(o => o.status === 'completed');
  const totalRev = completed.reduce((s, o) => s + o.total, 0);
  const totalItems = completed.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
  const avgOrder = completed.length > 0 ? Math.round(totalRev / completed.length) : 0;
  
  // Calculate dynamic sales per hour
  const dailySalesData = useMemo(() => {
    const hourlyData = Array.from({ length: 12 }, (_, i) => {
      const hourStr = (i + 10).toString().padStart(2, '0');
      return { hour: `${hourStr}:00`, sales: 0 };
    });

    completed.forEach(order => {
      const date = new Date(order.createdAt);
      const hour = date.getHours();
      if (hour >= 10 && hour <= 21) {
        hourlyData[hour - 10].sales += order.total;
      }
    });
    return hourlyData;
  }, [completed]);

  // Calculate dynamic top products
  const topProducts = useMemo(() => {
    const productStats: Record<string, { name: string; revenue: number; sold: number }> = {};
    
    completed.forEach(order => {
      order.items.forEach(item => {
        if (!productStats[item.productId]) {
          const product = products.find(p => p.id === item.productId);
          productStats[item.productId] = { 
            name: product ? product.name : 'Unknown Product', 
            revenue: 0,
            sold: 0
          };
        }
        productStats[item.productId].revenue += item.subtotal;
        productStats[item.productId].sold += item.quantity;
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [completed, products]);

  const maxTop = Math.max(...topProducts.map(p => p.revenue), 1);

  // Calculate dynamic payment method stats
  const paymentMethodStats = useMemo(() => {
    const stats: Record<string, { method: string; count: number; amount: number }> = {
      cash: { method: 'Cash', count: 0, amount: 0 },
      qris: { method: 'QRIS', count: 0, amount: 0 },
      debit: { method: 'Debit/Kredit', count: 0, amount: 0 },
      'e-wallet': { method: 'E-Wallet', count: 0, amount: 0 },
    };

    completed.forEach(order => {
      const method = order.payments && order.payments.length > 0 ? order.payments[0].method : 'cash';
      const key = method;
      if (stats[key]) {
        stats[key].count += 1;
        stats[key].amount += order.total;
      }
    });

    return Object.values(stats).sort((a, b) => b.amount - a.amount);
  }, [completed]);

  const totalPayments = paymentMethodStats.reduce((s, p) => s + p.amount, 0) || 1; // Prevent div zero

  // Calculate cashier performance
  const cashierPerformance = useMemo(() => {
    const stats: Record<string, { name: string; orders: number; revenue: number; avg: number }> = {};
    
    completed.forEach(order => {
      const cashierName = order.cashierName || 'Unknown';
      if (!stats[cashierName]) {
        stats[cashierName] = { name: cashierName, orders: 0, revenue: 0, avg: 0 };
      }
      stats[cashierName].orders += 1;
      stats[cashierName].revenue += order.total;
    });

    return Object.values(stats).map(cashier => ({
      ...cashier,
      avg: cashier.orders > 0 ? Math.round(cashier.revenue / cashier.orders) : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [completed]);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900">Laporan & Analitik</h1>
        <p className="text-sm text-espresso-400 mt-1">Ringkasan penjualan hari ini</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pendapatan" value={formatCurrency(totalRev)} sub={`${completed.length} transaksi selesai`} icon={<TrendingUp className="w-5 h-5 text-amber-accent" />} color="bg-amber-50" />
        <StatCard title="Item Terjual" value={formatNumber(totalItems)} sub="Dari semua kategori" icon={<ShoppingBag className="w-5 h-5 text-sky-accent" />} color="bg-sky-50" />
        <StatCard title="Rata-rata / Order" value={formatCurrency(avgOrder)} sub="Per transaksi" icon={<CreditCard className="w-5 h-5 text-espresso-500" />} color="bg-espresso-100" />
        <StatCard title="Total Pelanggan" value={customers.length.toString()} sub="Semua pelanggan terdaftar" icon={<Users className="w-5 h-5 text-emerald-accent" />} color="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Chart */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
          <h2 className="font-bold text-espresso-900">Penjualan per Jam</h2>
          <p className="text-xs text-espresso-400 mt-0.5">Hover untuk melihat detail</p>
          <BarChart data={dailySalesData} />
        </div>

        {/* Top Products */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
          <h2 className="font-bold text-espresso-900 mb-4">Produk Terlaris</h2>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-espresso-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-espresso-700">{p.name}</span>
                    <div className="flex items-center gap-3 text-xs text-espresso-500">
                      <span>{p.sold} terjual</span>
                      <span className="font-mono font-semibold text-espresso-800">{formatCurrency(p.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-espresso-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-accent rounded-full transition-all duration-500" style={{ width: `${(p.revenue / maxTop) * 100}%` }} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-espresso-400 text-center py-4">Belum ada data</p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
          <h2 className="font-bold text-espresso-900 mb-4">Pendapatan per Metode Bayar</h2>
          <div className="space-y-4">
            {paymentMethodStats.map((stat) => {
              const pct = (stat.amount / totalPayments) * 100;
              const colors: Record<string, string> = { Cash: 'bg-amber-accent', QRIS: 'bg-sky-accent', 'Debit/Kredit': 'bg-emerald-accent' };
              return (
                <div key={stat.method}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors[stat.method] || 'bg-espresso-500'}`} />
                      <span className="text-sm font-medium text-espresso-700">{stat.method}</span>
                      <span className="text-xs text-espresso-400">{stat.count} transaksi</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-espresso-900">{formatCurrency(stat.amount)}</span>
                  </div>
                  <div className="h-2 bg-espresso-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[stat.method] || 'bg-espresso-500'} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-right text-[10px] text-espresso-400 mt-0.5">{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cashier Performance */}
        <div className="bg-cream rounded-2xl border border-espresso-200 p-5 shadow-card">
          <h2 className="font-bold text-espresso-900 mb-4">Performa Kasir</h2>
          <div className="space-y-3">
            {cashierPerformance.length > 0 ? cashierPerformance.map((cashier) => (
              <div key={cashier.name} className="flex items-center gap-4 p-4 rounded-xl bg-espresso-50 border border-espresso-100">
                <div className="w-10 h-10 rounded-full bg-espresso-200 flex items-center justify-center text-sm font-bold text-espresso-600 shrink-0 uppercase">
                  {cashier.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-espresso-800 text-sm">{cashier.name}</p>
                  <p className="text-xs text-espresso-400">{cashier.orders} pesanan · avg {formatCurrency(cashier.avg)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold font-mono text-espresso-900 text-sm">{formatCurrency(cashier.revenue)}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-espresso-400 text-center py-4">Belum ada transaksi</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
