import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'admin@example.com',
  full_name: 'Admin User',
  role: 'admin',
  created_at: new Date().toISOString()
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  signIn: async (email: string, password: string) => {
    // Simple mock authentication
    if (email === 'admin@example.com' && password === 'admin123') {
      set({ user: mockUser });
    } else {
      throw new Error('Invalid credentials');
    }
  },
  signOut: async () => {
    set({ user: null });
  },
}));