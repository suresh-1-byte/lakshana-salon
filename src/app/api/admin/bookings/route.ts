import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity, upsertCustomer } from '@/lib/firebase-admin';
import { BookingError, serializeBooking, updateBooking } from '@/lib/server/bookings';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '500'));

    const snap = await adminDb.collection(Collections.BOOKINGS).get();

    let bookings = snap.docs.map((d: any) => serializeBooking(d.id, d.data()));

    if (status && status !== 'all') bookings = bookings.filter(b => b.status === status);
    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(b =>
        b.name?.toLowerCase().includes(q) ||
        b.phone?.includes(q) ||
        b.email?.toLowerCase().includes(q)
      );
    }

    // Newest first
    bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const total = bookings.length;
    const paginated = bookings.slice((page - 1) * limit, page * limit);

    return NextResponse.json(
      {
        success: true,
        data: paginated,
        pagination: { total, page, limit, hasMore: page * limit < total },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Fetch bookings error:', err);
    return NextResponse.json({ error: 'Failed to load bookings' }, { status: 500 });
  }
}

/**
 * POST /api/admin/bookings — create a booking from the admin panel
 * (walk-in / phone booking). Stored in the same `bookings` collection as
 * website bookings so it shows up in the bookings list and calendar.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const services = Array.isArray(body.services) ? body.services : [];

    if (!name || !phone) {
      return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
    }
    if (services.length === 0) {
      return NextResponse.json({ error: 'Select at least one service' }, { status: 400 });
    }
    if (!body.scheduledDate || !body.scheduledTime) {
      return NextResponse.json({ error: 'Appointment date and time are required' }, { status: 400 });
    }

    const customerId = await upsertCustomer({
      name,
      phone,
      email: body.email || undefined,
      services: services.map((s: any) => s.name),
    });

    const ref = await adminDb.collection(Collections.BOOKINGS).add({
      name,
      phone,
      email: body.email || '',
      customerId,
      services,
      addons: Array.isArray(body.addons) ? body.addons : [],
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime,
      duration: Number(body.duration) || null,
      notes: body.notes || '',
      totalAmount: Number(body.totalAmount) || 0,
      advanceAmount: Number(body.advanceAmount) || 0,
      membershipId: body.membershipId || null,
      source: 'admin',
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('booking_create', { entityType: 'booking', entityId: ref.id, name });

    // Confirm straight away unless the admin chose to leave it pending
    let booking: any;
    let warning: string | undefined;
    if (body.status === 'confirmed') {
      try {
        booking = await updateBooking(ref.id, { status: 'confirmed' });
      } catch (err) {
        if (!(err instanceof BookingError)) throw err;
        warning = `Booking saved as pending: ${err.message}`;
      }
    }
    if (!booking) {
      const created = await ref.get();
      booking = serializeBooking(ref.id, created.data());
    }

    return NextResponse.json({ success: true, id: ref.id, data: booking, warning });
  } catch (err) {
    console.error('Create booking error:', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
