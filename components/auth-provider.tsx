'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import Cookies from 'js-cookie';
import { Skeleton } from '@/components/ui/skeleton';

const publicPaths = ['/login', '/register', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, isLoading, setUser, setToken, setLoading, logout } = useAuthStore();

    // Kiểm tra xác thực khi component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Kiểm tra token trong cookie
                const token = Cookies.get('access_token');
                console.log('\x1b[36m%s\x1b[0m', '[Auth] Checking authentication...');

                if (token) {
                    // Nếu có token, lấy thông tin người dùng
                    const response = await authAPI.getProfile();
                    if (response.data?.user) {
                        setUser(response.data.user);
                        setToken(token);
                        console.log('\x1b[32m%s\x1b[0m', '[Auth] User authenticated successfully');
                    }
                } else {
                    console.log('\x1b[33m%s\x1b[0m', '[Auth] No token found');
                    logout();
                }
            } catch (error) {
                console.error('\x1b[31m%s\x1b[0m', '[Auth] Authentication error:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [setUser, setToken, setLoading, logout]);

    // Xử lý chuyển hướng sau khi đã kiểm tra xác thực
    useEffect(() => {
        if (isLoading) return;

        console.log('\x1b[36m%s\x1b[0m', '[Auth] Current path:', pathname);
        console.log('\x1b[36m%s\x1b[0m', '[Auth] Is authenticated:', isAuthenticated);

        if (isAuthenticated && publicPaths.includes(pathname)) {
            console.log('\x1b[33m%s\x1b[0m', '[Auth] Redirecting to dashboard...');
            router.push('/dashboard');
        } else if (!isAuthenticated && !publicPaths.includes(pathname)) {
            console.log('\x1b[33m%s\x1b[0m', '[Auth] Redirecting to login...');
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Hiển thị loading state
    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="space-y-4 w-full max-w-md p-8">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 