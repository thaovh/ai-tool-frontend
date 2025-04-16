'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TokenProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Thêm token từ localStorage vào header của request
        const addTokenToHeaders = () => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('access_token');
                if (token) {
                    // Tạo một custom event để thông báo cho middleware biết về token
                    const event = new CustomEvent('tokenAvailable', { detail: { token } });
                    window.dispatchEvent(event);
                }
            }
        };

        // Gọi hàm khi component được mount
        addTokenToHeaders();

        // Thêm event listener để lắng nghe sự kiện tokenAvailable
        const handleTokenAvailable = (event: CustomEvent) => {
            // Thêm token vào header của request
            const headers = new Headers();
            headers.append('x-local-storage-token', event.detail.token);

            // Gửi request với header mới
            fetch(pathname, { headers });
        };

        window.addEventListener('tokenAvailable', handleTokenAvailable as EventListener);

        // Cleanup
        return () => {
            window.removeEventListener('tokenAvailable', handleTokenAvailable as EventListener);
        };
    }, [pathname]);

    return <>{children}</>;
} 