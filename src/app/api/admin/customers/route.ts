import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = adminDb.collection(Collections.CUSTOMERS).orderBy('createdAt', 'desc');

    const snap = await query.get();
    let customers = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
      lastVisit: d.data().lastVisit?.toDate?.()?.toISOString() ?? d.data().lastVisit,
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? d.data().updatedAt,
    }));

    // Client-side search filter
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter((c: any) =>
        (c as any).name?.toLowerCase().includes(q) ||
        (c as any).phone?.includes(q) ||
        (c as any).email?.toLowerCase().includes(q)
      );
    }

    const total = customers.length;
    const paginated = customers.slice((page - 1) * limit, page * limit);

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, address, dateOfBirth, anniversary, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // Check if customer with same phone exists
    const existing = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('phone', '==', phone)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: 'Customer with this phone already exists', existingId: existing.docs[0].id },
        { status: 409 }
      );
    }

    const ref = await adminDb.collection(Collections.CUSTOMERS).add({
      name,
      phone,
      email: email || '',
      address: address || '',
      dateOfBirth: dateOfBirth || '',
      anniversary: anniversary || '',
      notes: notes || '',
      totalVisits: 0,
      totalSpent: 0,
      lastVisit: null,
      loyaltyStatus: 'Bronze',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('customer_create', `New customer created: ${name} (${phone})`);

    return NextResponse.json({ success: true, id: ref.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
