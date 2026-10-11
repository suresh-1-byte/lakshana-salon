import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { signAdminToken, COOKIE_NAME } from '@/lib/admin-auth';
import { verifyAdminPassword } from '@/lib/server/password';
import { hitRateLimit, resetRateLimit } from '@/lib/server/rate-limit';
import { clientIp } from '@/lib/server/request-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

function sameText(a: string, b: string) {
  const ab = Buffer.from(a.trim().toLowerCase());
  const bb = Buffer.from(b.trim().toLowerCase());
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json().catch(() => ({}));

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || !process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin credentials not configured in environment variables' },
        { status: 500 }
      );
    }

    // Block password guessing: 5 attempts per 15 minutes per IP
    const ip = clientIp(req);
    const { limited, retryAfter } = await hitRateLimit('admin-login', ip, MAX_ATTEMPTS, WINDOW_SECONDS);
    if (limited) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const emailOk = sameText(email, adminEmail);
    const passwordOk = await verifyAdminPassword(password);
    if (!emailOk || !passwordOk) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await resetRateLimit('admin-login', ip, WINDOW_SECONDS);
    const token = await signAdminToken(adminEmail);

    // Log activity to Firestore only if Firebase is configured (non-fatal)
    try {
      const { logActivity } = await import('@/lib/firebase-admin');
      await logActivity('admin_login', { entityType: 'admin' });
    } catch {
      // Firebase not configured — skip activity log, login still succeeds
    }

    const response = NextResponse.json({ success: true, email: adminEmail });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', (err as Error)?.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
