import { NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

export async function DELETE() {
  try {
    const snap = await adminDb.collection(Collections.NOTIFICATIONS).get();
    const batch = adminDb.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return NextResponse.json({ success: true, deleted: snap.size });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
