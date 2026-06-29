import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    const snap = await adminDb
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    let bookings = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    })) as any[];

    if (status) bookings = bookings.filter(b => b.status === status);
    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(b =>
        b.name?.toLowerCase().includes(q) ||
        b.phone?.includes(q) ||
        b.email?.toLowerCase().includes(q)
      );
    }

    const total = bookings.length;
    const paginated = bookings.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { total, page, limit, hasMore: page * limit < total },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
