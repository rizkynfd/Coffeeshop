'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  BookOpen,
  Package,
  Users,
  BarChart3,
  Clock,
  Settings,
  LogOut,
  Coffee,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['cashier', 'supervisor', 'owner'],
  },
  {
    label: 'Kasir (POS)',
    href: '/pos',
    icon: <ShoppingCart className="w-5 h-5" />,
    roles: ['cashier', 'supervisor', 'owner'],
  },
  {
    label: 'Pesanan Aktif',
    href: '/orders',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['cashier', 'supervisor', 'owner'],
  },
  {
    label: 'Menu',
    href: '/menu',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['supervisor', 'owner'],
  },
  {
    label: 'Inventori',
    href: '/inventory',
    icon: <Package className="w-5 h-5" />,
    roles: ['supervisor', 'owner'],
  },
  {
    label: 'Pelanggan',
    href: '/customers',
    icon: <Users className="w-5 h-5" />,
    roles: ['supervisor', 'owner'],
  },
  {
    label: 'Pegawai',
    href: '/employees',
    icon: <Users className="w-5 h-5" />,
    roles: ['owner'],
  },
  {
    label: 'Laporan',
    href: '/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['owner'],
  },
  {
    label: 'Shift',
    href: '/shifts',
    icon: <Clock className="w-5 h-5" />,
    roles: ['supervisor', 'owner'],
  },
  {
    label: 'Pengaturan',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['owner'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const roleLabel: Record<UserRole, string> = {
    cashier: 'Kasir',
    supervisor: 'Supervisor',
    owner: 'Owner',
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen gradient-sidebar text-espresso-300 transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-espresso-800/50 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-amber-accent flex items-center justify-center shrink-0">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-display text-lg font-semibold text-cream leading-tight">
              KopiKasir
            </h1>
            <p className="text-[10px] text-espresso-500 uppercase tracking-wider">
              Coffee Shop POS
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group',
                isActive
                  ? 'bg-espresso-800 text-cream shadow-sm'
                  : 'text-espresso-400 hover:bg-espresso-800/50 hover:text-espresso-200'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span
                className={cn(
                  'shrink-0 transition-colors',
                  isActive
                    ? 'text-amber-accent'
                    : 'text-espresso-500 group-hover:text-espresso-300'
                )}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate animate-fade-in">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2 border-t border-espresso-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-espresso-500 hover:text-espresso-300 hover:bg-espresso-800/50 transition-colors text-sm cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Kecilkan</span>
            </>
          )}
        </button>
      </div>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-espresso-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-espresso-700 flex items-center justify-center text-sm font-semibold text-cream shrink-0">
            {user?.name?.charAt(0) || '?'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-cream truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-espresso-500">
                {user ? roleLabel[user.role] : ''}
              </p>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              'p-2 rounded-lg text-espresso-500 hover:text-rose-accent hover:bg-espresso-800/50 transition-colors cursor-pointer',
              collapsed && 'mx-auto'
            )}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
