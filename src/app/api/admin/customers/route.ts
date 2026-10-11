import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';
import {
  customerFieldsError,
  customerFieldsFromBody,
  isDeletedCustomer,
  phoneDigits,
  serializeCustomer,
} from '@/lib/server/customers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const phone = searchParams.get('phone');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '1000'));

    const snap = await adminDb.collection(Collections.CUSTOMERS).get();

    let customers = snap.docs
      .filter((d: any) => includeDeleted || !isDeletedCustomer(d.data()))
      .map((d: any) => serializeCustomer(d.id, d.data()));

    // Exact phone lookup (used by the New Booking form)
    if (phone) {
      const wanted = phoneDigits(phone);
      customers = customers.filter(c => phoneDigits(c.phone) === wanted);
    }

    if (search) {
      const q = search.toLowerCase();
      const qDigits = q.replace(/\D/g, '');
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (qDigits.length > 0 && c.phone.replace(/\D/g, '').includes(qDigits))
      );
    }

    // Newest first
    customers.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const total = customers.length;
    const paginated = customers.slice((page - 1) * limit, page * limit);

    return NextResponse.json(
      {
        success: true,
        data: paginated,
        pagination: { total, page, limit, hasMore: page * limit < total },
      },
      { headers: NO_STORE }
    );
  } catch (err) {
    console.error('Fetch customers error:', err);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fields = customerFieldsFromBody(body);

    if (!fields.name || !fields.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }
    const invalid = customerFieldsError(fields);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    // Is there already a customer with this phone number?
    const wanted = phoneDigits(fields.phone);
    const snap = await adminDb.collection(Collections.CUSTOMERS).get();
    const existing = snap.docs.find((d: any) => phoneDigits(d.data().phone) === wanted);

    if (existing) {
      if (isDeletedCustomer(existing.data())) {
        // A previously deleted customer is coming back: restore and update them
        await existing.ref.update({
          ...fields,
          phoneKey: wanted,
          status: 'active',
          isDeleted: false,
          deletedAt: null,
          updatedAt: FieldValue.serverTimestamp(),
        });
        await logActivity('customer_restore', { entityType: 'customer', entityId: existing.id });
        const restored = await existing.ref.get();
        return NextResponse.json({
          success: true,
          id: existing.id,
          data: serializeCustomer(existing.id, restored.data()),
        });
      }
      return NextResponse.json(
        { error: 'A customer with this phone number already exists', existingId: existing.id },
        { status: 409 }
      );
    }

    const ref = await adminDb.collection(Collections.CUSTOMERS).add({
      name: fields.name,
      phone: fields.phone,
      phoneKey: wanted,
      whatsappNumber: fields.whatsappNumber || fields.phone,
      email: fields.email || '',
      address: fields.address || '',
      city: fields.city || '',
      gender: fields.gender || '',
      dateOfBirth: fields.dateOfBirth || '',
      anniversary: fields.anniversary || '',
      notes: fields.notes || '',
      preferredStylist: fields.preferredStylist || '',
      status: 'active',
      isDeleted: false,
      totalVisits: 0,
      totalSpent: 0,
      lastVisit: null,
      loyaltyStatus: 'Bronze',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('customer_create', { entityType: 'customer', entityId: ref.id, name: fields.name });
    const created = await ref.get();
    return NextResponse.json({ success: true, id: ref.id, data: serializeCustomer(ref.id, created.data()) });
  } catch (err) {
    console.error('Create customer error:', err);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
