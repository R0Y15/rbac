import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth-token');
    const isAuthPage = request.nextUrl.pathname.startsWith('/sign-in');
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin');

    if (isAdminPage && !authToken) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (isAuthPage && authToken) {
        return NextResponse.redirect(new URL('/admin/users', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/sign-in'],
}; 
