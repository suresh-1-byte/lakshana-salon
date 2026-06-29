import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth';

export const runtime = 'nodejs';

// Routes that are always public — no JWT required
const PUBLIC_PATHS = [
  '/admin/login',
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect /admin panel pages (redirect to login if no token)
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    const payload = await verifyAdminToken(token);
    if (!payload) {
      const res = NextResponse.redirect(new URL('/admin/login', req.url));
      res.cookies.delete(COOKIE_NAME);
      return res;
    }
    return NextResponse.next();
  }

  // Protect /api/admin/* (return 401 JSON if no token)
  if (pathname.startsWith('/api/admin')) {
    const token =
      req.cookies.get(COOKIE_NAME)?.value ||
      req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
