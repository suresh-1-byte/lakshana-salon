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
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased from 20 to 50

    // Use index on createdAt for faster queries
    let query = adminDb
      .collection(Collections.CUSTOMERS)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    const snap = await query.get();
    
    let customers = snap.docs.map((d: any) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        dateOfBirth: data.dateOfBirth || '',
        totalVisits: data.totalVisits || 0,
        totalSpent: data.totalSpent || 0,
        loyaltyStatus: data.loyaltyStatus || 'Bronze',
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
      };
    });

    // Client-side search filter (faster for small datasets)
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter((c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: { 
        total: customers.length, 
        page, 
        limit, 
        hasMore: customers.length === limit 
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
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
