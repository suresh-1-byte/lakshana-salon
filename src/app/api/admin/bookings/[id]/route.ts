import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, scheduledDate, scheduledTime, notes } = body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (status)        updateData.status = status;
    if (scheduledDate) updateData.scheduledDate = scheduledDate;
    if (scheduledTime) updateData.scheduledTime = scheduledTime;
    if (notes !== undefined) updateData.notes = notes;

    await adminDb.collection('bookings').doc(id).update(updateData);
    await logActivity('booking_update', `Booking ${status || 'updated'}: ${id}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await adminDb.collection('bookings').doc(id).delete();
    await logActivity('booking_delete', `Booking deleted: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
