import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, logActivity } from '@/lib/firebase-admin';
import { CATALOG, serializeService, serviceFieldsFromBody } from '@/lib/server/admin-catalog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await adminDb.collection(CATALOG.SERVICES).doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: serializeService(doc.id, doc.data()) });
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
    const fields = serviceFieldsFromBody(body);

    if (fields.categoryId && !body.category && !body.categoryName) {
      const cat = await adminDb.collection(CATALOG.CATEGORIES).doc(String(fields.categoryId)).get();
      if (cat.exists) fields.categoryName = cat.data()?.name;
    }

    const ref = adminDb.collection(CATALOG.SERVICES).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    await ref.update({ ...fields, updatedAt: FieldValue.serverTimestamp() });
    await logActivity('service_update', { entityType: 'service', entityId: id });

    const updated = await ref.get();
    return NextResponse.json({ success: true, data: serializeService(id, updated.data()) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await adminDb.collection(CATALOG.SERVICES).doc(id).delete();
    await logActivity('service_delete', { entityType: 'service', entityId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
