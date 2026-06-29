import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { adminDb, Collections, logActivity } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both passwords required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (currentPassword !== adminPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Store new password in Firestore settings (in real prod, use env update or hashed store)
    await adminDb.collection(Collections.SETTINGS).doc('admin').set(
      { adminPasswordOverride: newPassword, updatedAt: new Date().toISOString() },
      { merge: true }
    );

    await logActivity('password_change', 'Admin changed password');

    return NextResponse.json({ success: true, message: 'Password updated. Restart server to apply env change.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
