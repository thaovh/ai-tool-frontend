"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra xem đã đăng nhập chưa
        const response = await authAPI.getProfile();
        if (response.data) {
          // Nếu đã đăng nhập, chuyển hướng đến trang dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Nếu chưa đăng nhập, chuyển hướng đến trang login
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
