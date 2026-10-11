// ═══════════════════════════════════════════════════════
//  Customer Profile API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';
import { getCustomerProfile, deleteCustomer, restoreCustomer } from '@/lib/api/customer-profile';
import { customerFieldsError, customerFieldsFromBody, phoneDigits, serializeCustomer } from '@/lib/server/customers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const profile = await getCustomerProfile(id);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, profile }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json({ error: 'Failed to fetch customer profile' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const result = await deleteCustomer(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    await logActivity('customer_delete', { entityType: 'customer', entityId: id });
    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (body.action === 'restore') {
      const result = await restoreCustomer(id);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      await logActivity('customer_restore', { entityType: 'customer', entityId: id });
      return NextResponse.json({ success: true, message: 'Customer restored successfully' });
    }

    // Regular profile edit
    const ref = adminDb.collection(Collections.CUSTOMERS).doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const fields = customerFieldsFromBody(body);
    const invalid = customerFieldsError(fields);
    if (invalid) {
      return NextResponse.json({ success: false, error: invalid }, { status: 400 });
    }
    if (fields.name !== undefined && !fields.name) {
      return NextResponse.json({ success: false, error: 'Name cannot be empty' }, { status: 400 });
    }
    if (fields.phone !== undefined) {
      if (!fields.phone) {
        return NextResponse.json({ success: false, error: 'Phone cannot be empty' }, { status: 400 });
      }
      // Don't allow two customers with the same phone number
      if (phoneDigits(fields.phone) !== phoneDigits(existing.data()?.phone)) {
        const snap = await adminDb.collection(Collections.CUSTOMERS).get();
        const clash = snap.docs.find(
          (d: any) => d.id !== id && phoneDigits(d.data().phone) === phoneDigits(fields.phone)
        );
        if (clash) {
          return NextResponse.json(
            { success: false, error: 'Another customer already uses this phone number' },
            { status: 409 }
          );
        }
      }
    }

    await ref.update({
      ...fields,
      ...(fields.phone ? { phoneKey: phoneDigits(fields.phone) } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await logActivity('customer_update', { entityType: 'customer', entityId: id });

    const updated = await ref.get();
    return NextResponse.json({ success: true, data: serializeCustomer(id, updated.data()) });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
