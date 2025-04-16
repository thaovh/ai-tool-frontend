import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các đường dẫn không cần xác thực
const publicPaths = ['/login', '/register', '/forgot-password'];

// Danh sách các route cần bỏ qua middleware
const ignoreRoutes = [
    '/api',
    '/_next',
    '/favicon.ico',
    '/login',
    '/register',
    '/forgot-password',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Kiểm tra xem có phải route cần bỏ qua không
    if (ignoreRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Kiểm tra xem đường dẫn hiện tại có phải là đường dẫn công khai không
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Lấy token từ cookie
    const cookieToken = request.cookies.get('access_token')?.value;

    // Lấy token từ localStorage thông qua header
    const localToken = request.headers.get('x-local-storage-token');

    // Sử dụng token từ cookie hoặc localStorage
    const token = cookieToken || localToken;

    // Nếu người dùng đã đăng nhập và đang cố truy cập trang đăng nhập, chuyển hướng đến trang chủ
    if (token && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Nếu người dùng chưa đăng nhập và đang cố truy cập trang được bảo vệ, chuyển hướng đến trang đăng nhập
    if (!token && !isPublicPath) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Chỉ định các route cần apply middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 