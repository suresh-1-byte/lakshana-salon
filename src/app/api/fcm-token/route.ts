import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';
import { clientIp, isAdminRequest } from '@/lib/server/request-auth';
import { hitRateLimit } from '@/lib/server/rate-limit';
import { isValidEmail } from '@/lib/server/validation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Save FCM token from browser. Public (website visitors can subscribe), but a
// token only gets the `admin` role — and with it booking alerts — when it is
// registered from a browser that is logged in to the admin panel.
export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json().catch(() => ({}));

    if (typeof token !== 'string' || token.length < 20 || token.length > 4096) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
    }

    const { limited } = await hitRateLimit('fcm-token', clientIp(req), 20, 3600);
    if (limited) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const isAdmin = await isAdminRequest(req);
    const ref = adminDb.collection(Collections.FCM_TOKENS).doc(token);
    const existing = await ref.get();
    const now = new Date().toISOString();

    await ref.set(
      {
        token,
        email: isValidEmail(email) ? String(email).trim().toLowerCase() : existing.data()?.email || null,
        // Never downgrade an admin device; only an admin session can grant the role
        role: isAdmin || existing.data()?.role === 'admin' ? 'admin' : 'subscriber',
        createdAt: existing.data()?.createdAt || now,
        updatedAt: now,
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, message: 'Token registered' });
  } catch (err) {
    // Notifications are optional; never break the site over them
    console.error('FCM token registration failed:', (err as Error)?.message);
    return NextResponse.json({ success: false, error: 'Could not register token' }, { status: 500 });
  }
}
