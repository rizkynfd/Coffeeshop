'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';
import { Coffee, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const success = await login(email, password);
    if (success) {
      router.push('/pos');
    } else {
      setError('Email atau password salah');
    }
    setIsLoading(false);
  };

  const demoAccounts = [
    { email: 'dimas@kopikasir.com', role: 'Kasir', color: 'bg-espresso-600' },
    { email: 'rizky@kopikasir.com', role: 'Supervisor', color: 'bg-sky-accent' },
    { email: 'ahmad@kopikasir.com', role: 'Owner', color: 'bg-amber-accent' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-sidebar relative overflow-hidden items-center justify-center p-12">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-espresso-800/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-accent/10 blur-3xl" />
        
        <div className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-amber-accent flex items-center justify-center shadow-xl">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-cream mb-4">
            KopiKasir
          </h1>
          <p className="text-espresso-400 text-lg leading-relaxed mb-8">
            Sistem kasir modern untuk coffee shop Anda. 
            Cepat, intuitif, dan dirancang untuk barista.
          </p>
          <div className="flex items-center justify-center gap-8 text-espresso-500">
            <div className="text-center">
              <p className="text-2xl font-bold text-cream font-mono">250+</p>
              <p className="text-xs mt-1">Transaksi/hari</p>
            </div>
            <div className="w-px h-12 bg-espresso-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-cream font-mono">&lt;3s</p>
              <p className="text-xs mt-1">Per order</p>
            </div>
            <div className="w-px h-12 bg-espresso-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-cream font-mono">99%</p>
              <p className="text-xs mt-1">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-espresso-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-amber-accent flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-espresso-900">
                KopiKasir
              </h1>
              <p className="text-xs text-espresso-400">Coffee Shop POS</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-espresso-900 mb-2">
              Selamat Datang
            </h2>
            <p className="text-espresso-500">
              Masuk ke akun Anda untuk memulai shift
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-espresso-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-espresso-200 bg-white text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-amber-accent/30 focus:border-amber-accent transition-all"
                placeholder="Masukkan email"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-espresso-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-espresso-200 bg-white text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-amber-accent/30 focus:border-amber-accent transition-all"
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-espresso-400 hover:text-espresso-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Masuk
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-8 border-t border-espresso-200">
            <p className="text-xs font-medium text-espresso-400 uppercase tracking-wider mb-4">
              Akun Demo (klik untuk login cepat)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('demo1234');
                    setError('');
                  }}
                  className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl border border-espresso-200 bg-white hover:bg-espresso-50 hover:border-espresso-300 transition-all cursor-pointer group"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${account.color} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {account.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center overflow-hidden w-full">
                    <p className="text-sm font-medium text-espresso-700 group-hover:text-espresso-900 truncate">
                      {account.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-espresso-400">
                      {account.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-espresso-400 mt-3 text-center">
              Password untuk semua akun demo: <code className="font-mono bg-espresso-100 px-1.5 py-0.5 rounded">demo1234</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
