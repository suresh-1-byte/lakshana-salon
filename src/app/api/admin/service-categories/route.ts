import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, logActivity } from '@/lib/firebase-admin';
import {
  CATALOG,
  ensureCatalogSeeded,
  serializeCategory,
  serializeService,
  slugify,
} from '@/lib/server/admin-catalog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await ensureCatalogSeeded();

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';
    const withServices = searchParams.get('withServices') === 'true';

    const [catSnap, svcSnap] = await Promise.all([
      adminDb.collection(CATALOG.CATEGORIES).get(),
      adminDb.collection(CATALOG.SERVICES).get(),
    ]);

    let categories: any[] = catSnap.docs.map((d: any) => serializeCategory(d.id, d.data()));
    if (activeOnly) categories = categories.filter(c => c.status === 'active');
    categories.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));

    const services = svcSnap.docs.map((d: any) => serializeService(d.id, d.data()));
    categories = categories.map(c => {
      const own = services.filter(s => s.category_id === c.id);
      return {
        ...c,
        service_count: own.length,
        ...(withServices
          ? { services: own.filter(s => s.status === 'active').sort((a, b) => a.display_order - b.display_order) }
          : {}),
      };
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    console.error('Fetch categories error:', err);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 });

    // Use a readable slug as the id, falling back to an auto id on collision
    let ref = adminDb.collection(CATALOG.CATEGORIES).doc(slugify(name));
    if ((await ref.get()).exists) ref = adminDb.collection(CATALOG.CATEGORIES).doc();

    await ref.set({
      name,
      description: body.description || '',
      icon: body.icon || '',
      displayOrder: Number(body.display_order ?? body.displayOrder) || 0,
      status: body.status === 'inactive' ? 'inactive' : 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('category_create', { entityType: 'service_category', entityId: ref.id, name });
    const created = await ref.get();
    return NextResponse.json({ success: true, id: ref.id, data: serializeCategory(ref.id, created.data()) });
  } catch (err) {
    console.error('Create category error:', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
