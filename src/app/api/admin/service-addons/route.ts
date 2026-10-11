import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, logActivity } from '@/lib/firebase-admin';
import { CATALOG, serializeAddon } from '@/lib/server/admin-catalog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';

    const snap = await adminDb.collection(CATALOG.ADDONS).get();
    let addons = snap.docs.map((d: any) => serializeAddon(d.id, d.data()));
    if (activeOnly) addons = addons.filter(a => a.status === 'active');
    addons.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, data: addons });
  } catch (err) {
    console.error('Fetch add-ons error:', err);
    return NextResponse.json({ error: 'Failed to load add-ons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Add-on name is required' }, { status: 400 });

    const ref = await adminDb.collection(CATALOG.ADDONS).add({
      name,
      description: body.description || '',
      price: Number(body.price) || 0,
      duration: Number(body.duration) || 0,
      icon: body.icon || '',
      displayOrder: Number(body.display_order ?? body.displayOrder) || 0,
      status: body.status === 'inactive' ? 'inactive' : 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('addon_create', { entityType: 'service_addon', entityId: ref.id, name });
    const created = await ref.get();
    return NextResponse.json({ success: true, id: ref.id, data: serializeAddon(ref.id, created.data()) });
  } catch (err) {
    console.error('Create add-on error:', err);
    return NextResponse.json({ error: 'Failed to create add-on' }, { status: 500 });
  }
}
