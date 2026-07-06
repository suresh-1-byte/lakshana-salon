import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET() {
  try {
    const snap = await adminDb.collection(Collections.SERVICES).orderBy('categoryName').get();
    const services = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));
    return NextResponse.json({ success: true, data: services });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, categoryId, categoryName, duration, memberPrice, nonMemberPrice, isFeatured = false } = body;

    if (!name || !categoryName || !duration) {
      return NextResponse.json({ error: 'Name, category and duration required' }, { status: 400 });
    }

    const ref = await adminDb.collection(Collections.SERVICES).add({
      name,
      description: description || '',
      categoryId: categoryId || categoryName.toLowerCase().replace(/\s+/g, '-'),
      categoryName,
      duration,
      memberPrice: Number(memberPrice) || 0,
      nonMemberPrice: Number(nonMemberPrice) || 0,
      isFeatured,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('service_create', `Service created: ${name}`);
    return NextResponse.json({ success: true, id: ref.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
