import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean; // tracks if persist has rehydrated from localStorage
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  checkSession: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error || !data.user) return false;

          // Fetch user profile from public.users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const userObj: User = {
              id: profile.id,
              name: profile.name,
              username: profile.username,
              role: profile.role as UserRole,
              isActive: profile.is_active,
            };
            set({ user: userObj, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (err) {
          console.error(err);
          return false;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      // Called on app boot — verify Supabase session is still valid
      // and restore user profile if session exists but store is empty
      checkSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            // No valid session → clear auth state
            set({ user: null, isAuthenticated: false });
            return;
          }

          // Session exists — check if we already have user in store
          const { user } = get();
          if (user) return; // already restored from localStorage, all good

          // Session exists but user missing from store (edge case) → restore from DB
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            set({
              user: {
                id: profile.id,
                name: profile.name,
                username: profile.username,
                role: profile.role as UserRole,
                isActive: profile.is_active,
              },
              isAuthenticated: true,
            });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (err) {
          console.error('checkSession error:', err);
        }
      },
    }),
    {
      name: 'auth-storage',
      // Called once after localStorage is read
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
