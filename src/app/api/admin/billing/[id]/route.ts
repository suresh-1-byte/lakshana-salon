import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';
import { applyBillToCustomer, billCounts } from '@/lib/server/customer-stats';

const BILL_STATUSES = ['paid', 'pending', 'refunded', 'cancelled'];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await adminDb.collection(Collections.BILLING).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    const data = doc.data()!;
    return NextResponse.json({ success: true, data: { id: doc.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt } });
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
    const { status } = await req.json();
    if (!BILL_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Status must be one of: ${BILL_STATUSES.join(', ')}` }, { status: 400 });
    }

    const ref = adminDb.collection(Collections.BILLING).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    const bill = doc.data()!;

    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });

    // Keep customer visits & spending in step with paid bills
    const wasCounted = billCounts(bill);
    const nowCounted = status === 'paid';
    if (wasCounted !== nowCounted) {
      await applyBillToCustomer(bill.customerId, Number(bill.total) || 0, nowCounted ? 1 : -1);
    }

    await logActivity('billing_status', { entityType: 'billing', entityId: id, from: bill.status, to: status });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
