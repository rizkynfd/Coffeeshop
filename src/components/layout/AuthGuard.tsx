'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated, checkSession } = useAuthStore();
  const router = useRouter();

  // On first mount, verify the Supabase session is still valid
  useEffect(() => {
    void checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for Zustand to rehydrate from localStorage before deciding anything
  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-espresso-50">
        <div className="text-center animate-fade-in">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-espresso-400">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  // Hydrated but not authenticated → redirect to login
  if (!isAuthenticated) {
    router.replace('/login');
    return (
      <div className="h-screen flex items-center justify-center bg-espresso-50">
        <div className="text-center animate-fade-in">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-espresso-400">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
