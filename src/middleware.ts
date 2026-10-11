import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth';
import { isCronRequest } from '@/lib/server/request-auth';

export const runtime = 'nodejs';

// Routes that are always public — no JWT required
const PUBLIC_PATHS = [
  '/admin/login',
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
];

// API routes outside /api/admin that expose or change customer data,
// send messages or notifications: admin session required.
const ADMIN_ONLY_API = [
  '/api/admin',
  '/api/customers',
  '/api/birthdays',
  '/api/reports',
  '/api/whatsapp',
  '/api/notify',
  '/api/fcm-token/list',
  '/api/fcm-token/cleanup',
  '/api/fcm-token/delete-all',
];

// Scheduled jobs: Vercel Cron (Bearer CRON_SECRET) or the admin.
const CRON_API = ['/api/cron'];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));

async function hasAdminSession(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  return !!(await verifyAdminToken(token));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect /admin panel pages (redirect to login if no valid token)
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

  if (matches(pathname, CRON_API)) {
    if (isCronRequest(req) || (await hasAdminSession(req))) return NextResponse.next();
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (matches(pathname, ADMIN_ONLY_API)) {
    if (await hasAdminSession(req)) return NextResponse.next();
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/customers/:path*',
    '/api/birthdays/:path*',
    '/api/reports/:path*',
    '/api/whatsapp/:path*',
    '/api/notify',
    '/api/fcm-token/:path*',
    '/api/cron/:path*',
  ],
};
