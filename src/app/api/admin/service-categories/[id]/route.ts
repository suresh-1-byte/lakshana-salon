import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, logActivity } from '@/lib/firebase-admin';
import { CATALOG, serializeCategory } from '@/lib/server/admin-catalog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const ref = adminDb.collection(CATALOG.CATEGORIES).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (body.name !== undefined) update.name = String(body.name).trim();
    if (body.description !== undefined) update.description = body.description || '';
    if (body.icon !== undefined) update.icon = body.icon || '';
    if (body.display_order !== undefined || body.displayOrder !== undefined) {
      update.displayOrder = Number(body.display_order ?? body.displayOrder) || 0;
    }
    if (body.status !== undefined) update.status = body.status === 'inactive' ? 'inactive' : 'active';

    await ref.update(update);

    // Keep the denormalised category name on services in sync
    if (update.name && update.name !== existing.data()?.name) {
      const svcSnap = await adminDb.collection(CATALOG.SERVICES).where('categoryId', '==', id).get();
      if (!svcSnap.empty) {
        const batch = adminDb.batch();
        svcSnap.docs.forEach((d: any) => batch.update(d.ref, { categoryName: update.name as string }));
        await batch.commit();
      }
    }

    await logActivity('category_update', { entityType: 'service_category', entityId: id });
    const updated = await ref.get();
    return NextResponse.json({ success: true, data: serializeCategory(id, updated.data()) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const svcSnap = await adminDb.collection(CATALOG.SERVICES).where('categoryId', '==', id).limit(1).get();
    if (!svcSnap.empty) {
      return NextResponse.json(
        { error: 'This category still has services. Move or delete them first.' },
        { status: 409 }
      );
    }
    await adminDb.collection(CATALOG.CATEGORIES).doc(id).delete();
    await logActivity('category_delete', { entityType: 'service_category', entityId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
