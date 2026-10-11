import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, logActivity } from '@/lib/firebase-admin';
import { CATALOG, serializeAddon } from '@/lib/server/admin-catalog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const ref = adminDb.collection(CATALOG.ADDONS).doc(id);
    if (!(await ref.get()).exists) return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });

    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (body.name !== undefined) update.name = String(body.name).trim();
    if (body.description !== undefined) update.description = body.description || '';
    if (body.price !== undefined) update.price = Number(body.price) || 0;
    if (body.duration !== undefined) update.duration = Number(body.duration) || 0;
    if (body.icon !== undefined) update.icon = body.icon || '';
    if (body.display_order !== undefined || body.displayOrder !== undefined) {
      update.displayOrder = Number(body.display_order ?? body.displayOrder) || 0;
    }
    if (body.status !== undefined) update.status = body.status === 'inactive' ? 'inactive' : 'active';

    await ref.update(update);
    await logActivity('addon_update', { entityType: 'service_addon', entityId: id });
    const updated = await ref.get();
    return NextResponse.json({ success: true, data: serializeAddon(id, updated.data()) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update add-on' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await adminDb.collection(CATALOG.ADDONS).doc(id).delete();

    // Detach the add-on from any services that offered it
    const svcSnap = await adminDb.collection(CATALOG.SERVICES).where('addonIds', 'array-contains', id).get();
    if (!svcSnap.empty) {
      const batch = adminDb.batch();
      svcSnap.docs.forEach((d: any) => batch.update(d.ref, { addonIds: FieldValue.arrayRemove(id) }));
      await batch.commit();
    }

    await logActivity('addon_delete', { entityType: 'service_addon', entityId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete add-on' }, { status: 500 });
  }
}
