import { NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET() {
  try {
    const snap = await adminDb
      .collection(Collections.ACTIVITY_LOG)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const logs = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));

    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
