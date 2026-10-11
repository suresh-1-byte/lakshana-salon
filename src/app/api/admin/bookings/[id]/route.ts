import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, logActivity } from '@/lib/firebase-admin';
import { BookingError, serializeBooking, updateBooking } from '@/lib/server/bookings';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const doc = await adminDb.collection(Collections.BOOKINGS).doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: serializeBooking(doc.id, doc.data()) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const body = await req.json();
    const booking = await updateBooking(id, {
      status: body.status,
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime,
      notes: body.notes,
    });
    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ success: false, error: err.message, ...err.extra }, { status: err.status });
    }
    console.error('Update booking error:', err);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await adminDb.collection(Collections.BOOKINGS).doc(id).delete();
    await logActivity('booking_delete', { entityType: 'booking', entityId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
