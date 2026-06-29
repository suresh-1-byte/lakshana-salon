import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken, COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const adminEmail    = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Admin credentials not configured in environment variables' },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Sign JWT — no Firebase dependency here
    const token = await signAdminToken(email);

    // Log activity to Firestore only if Firebase is configured (non-fatal)
    try {
      const { logActivity } = await import('@/lib/firebase-admin');
      await logActivity('admin_login', `Admin logged in: ${email}`);
    } catch {
      // Firebase not configured — skip activity log, login still succeeds
    }

    const response = NextResponse.json({ success: true, email });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
