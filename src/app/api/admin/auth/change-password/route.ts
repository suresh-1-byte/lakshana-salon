import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';
import { hashPassword, verifyAdminPassword } from '@/lib/server/password';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json().catch(() => ({}));

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both passwords required' }, { status: 400 });
    }
    if (newPassword.length < 10 || newPassword.length > 128) {
      return NextResponse.json({ error: 'New password must be 10–128 characters' }, { status: 400 });
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return NextResponse.json({ error: 'New password must contain letters and numbers' }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'New password must be different from the current one' }, { status: 400 });
    }

    if (!(await verifyAdminPassword(currentPassword))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Store only a salted scrypt hash. Login checks this before ADMIN_PASSWORD.
    // Also remove the plain-text field older versions of this route wrote.
    await adminDb.collection(Collections.SETTINGS).doc('admin').set(
      {
        adminPasswordHash: await hashPassword(newPassword),
        adminPasswordOverride: FieldValue.delete(),
        passwordChangedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await logActivity('password_change', { entityType: 'admin' });

    return NextResponse.json({ success: true, message: 'Password updated. Use the new password next time you log in.' });
  } catch (err) {
    console.error('Change password error:', (err as Error)?.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
