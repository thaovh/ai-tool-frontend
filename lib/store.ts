import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: 'ADMIN' | 'USER';
    status: 'ACTIVE' | 'INACTIVE';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setToken: (token) => set({ token, isAuthenticated: !!token }),
            setLoading: (loading) => set({ isLoading: loading }),
            logout: () => set({ user: null, token: null, isAuthenticated: false, isLoading: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
); 