import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'tenant' | 'landlord' | 'admin' | null;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isVerified?: boolean; // Cho KYC của chủ trọ
}

interface AuthState {
  token: string | null;
  role: UserRole;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, role: UserRole, user: UserProfile) => void;
  logout: () => void;
  updateVerification: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      user: null,
      isAuthenticated: false,
      login: (token, role, user) => set({ token, role, user, isAuthenticated: true }),
      logout: () => set({ token: null, role: null, user: null, isAuthenticated: false }),
      updateVerification: (status) => set((state) => ({
        user: state.user ? { ...state.user, isVerified: status } : null
      })),
    }),
    {
      name: 'dormi-auth-storage',
    }
  )
);
