/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cấu hình CORS
    async headers() {
        return [
            {
                // Áp dụng cho tất cả các routes
                source: '/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
                ],
            },
        ];
    },
    // Cấu hình ESLint
    eslint: {
        // Tắt kiểm tra ESLint trong quá trình build
        ignoreDuringBuilds: true,
    },
};

export default nextConfig; 