import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = adminDb.collection(Collections.REVIEWS).orderBy('createdAt', 'desc') as any;
    const snap = await query.get();

    let reviews = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));

    if (status) {
      reviews = reviews.filter((r: any) => r.status === status);
    }

    return NextResponse.json({ success: true, data: reviews });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, rating, comment, service, source = 'manual' } = body;

    if (!customerName || !rating || !comment) {
      return NextResponse.json({ error: 'Name, rating and comment required' }, { status: 400 });
    }

    const ref = await adminDb.collection(Collections.REVIEWS).add({
      customerName,
      customerPhone: customerPhone || '',
      rating: Number(rating),
      comment,
      service: service || '',
      status: 'pending',
      isFeatured: false,
      source,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: ref.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
