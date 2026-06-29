import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await adminDb.collection(Collections.CUSTOMERS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    const data = doc.data()!;
    const [bookingsSnap, billsSnap] = await Promise.all([
      adminDb.collection(Collections.BOOKINGS).where('phone', '==', data.phone).orderBy('createdAt', 'desc').limit(20).get(),
      adminDb.collection(Collections.BILLING).where('customerPhone', '==', data.phone).orderBy('createdAt', 'desc').limit(20).get(),
    ]);
    const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt }));
    const bills = billsSnap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt }));
    return NextResponse.json({ success: true, data: {
      id: doc.id, ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
      lastVisit: data.lastVisit?.toDate?.()?.toISOString() ?? data.lastVisit,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
      bookings, bills,
    }});
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
    const body = await req.json();
    const { name, phone, email, address, dateOfBirth, anniversary, notes, loyaltyStatus } = body;
    const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (anniversary !== undefined) updateData.anniversary = anniversary;
    if (notes !== undefined) updateData.notes = notes;
    if (loyaltyStatus) updateData.loyaltyStatus = loyaltyStatus;
    await adminDb.collection(Collections.CUSTOMERS).doc(id).update(updateData);
    await logActivity('customer_update', `Customer updated: ${id}`);
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
    await adminDb.collection(Collections.CUSTOMERS).doc(id).delete();
    await logActivity('customer_delete', `Customer deleted: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
