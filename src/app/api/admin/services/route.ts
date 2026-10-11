import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, logActivity } from '@/lib/firebase-admin';
import {
  CATALOG,
  ensureCatalogSeeded,
  serializeService,
  serviceFieldsFromBody,
} from '@/lib/server/admin-catalog';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await ensureCatalogSeeded();

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';
    const categoryId = searchParams.get('categoryId');

    const snap = await adminDb.collection(CATALOG.SERVICES).get();
    let services = snap.docs.map((d: any) => serializeService(d.id, d.data()));

    if (activeOnly) services = services.filter(s => s.status === 'active');
    if (categoryId) services = services.filter(s => s.category_id === categoryId);

    services.sort((a, b) =>
      a.category.localeCompare(b.category) ||
      a.display_order - b.display_order ||
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({ success: true, data: services });
  } catch (err) {
    console.error('Fetch services error:', err);
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fields = serviceFieldsFromBody(body);

    if (!fields.name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

    // Resolve the category name from its id
    if (fields.categoryId && !body.category && !body.categoryName) {
      const cat = await adminDb.collection(CATALOG.CATEGORIES).doc(String(fields.categoryId)).get();
      fields.categoryName = cat.exists ? cat.data()?.name : 'General';
    }

    const ref = await adminDb.collection(CATALOG.SERVICES).add({
      description: '',
      categoryName: 'General',
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
      addonIds: [],
      ...fields,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('service_create', { entityType: 'service', entityId: ref.id, name: fields.name });
    const created = await ref.get();
    return NextResponse.json({ success: true, id: ref.id, data: serializeService(ref.id, created.data()) });
  } catch (err) {
    console.error('Create service error:', err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
