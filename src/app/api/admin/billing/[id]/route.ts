import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await adminDb.collection(Collections.BILLING).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    const data = doc.data()!;
    return NextResponse.json({ success: true, data: { id: doc.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { status } = await req.json();
    await adminDb.collection(Collections.BILLING).doc(id).update({ status });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
