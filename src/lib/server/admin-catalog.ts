// ═══════════════════════════════════════════════════════
//  Service catalog (services, categories, add-ons) — Firestore
//  Server-only helpers shared by the /api/admin catalog routes.
// ═══════════════════════════════════════════════════════

import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';
import { serviceCategories as websiteCategories } from '@/lib/services-data';

export const CATALOG = {
  SERVICES: Collections.SERVICES,
  CATEGORIES: 'service_categories',
  ADDONS: 'service_addons',
} as const;

/** Firestore Timestamp | Date | string → ISO string (or null) */
export function toIso(value: any): string | null {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value?._seconds === 'number') return new Date(value._seconds * 1000).toISOString();
  return null;
}

/** "₹1,000" / "₹3,000–₹5,500" / 1000 → 1000 */
export function parsePrice(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const match = value.match(/[\d,]+(\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, '')) || 0 : 0;
}

/** "1 hr 30 min" / "45 min" / "2 hr+" / 60 → minutes */
export function parseDuration(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const hours = value.match(/(\d+(?:\.\d+)?)\s*h/i);
  const mins = value.match(/(\d+)\s*m/i);
  let total = 0;
  if (hours) total += Math.round(Number(hours[1]) * 60);
  if (mins) total += Number(mins[1]);
  if (!hours && !mins) total = parseInt(value, 10) || 0;
  return total;
}

export function formatDuration(minutes: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'general';
}

// ── Normalisers: Firestore doc → shape used by the admin UI ──────────

export function serializeCategory(id: string, d: any) {
  return {
    id,
    name: d.name || '',
    description: d.description || null,
    icon: d.icon || null,
    display_order: d.displayOrder ?? d.display_order ?? 0,
    status: d.status || (d.isActive === false ? 'inactive' : 'active'),
    created_at: toIso(d.createdAt),
    updated_at: toIso(d.updatedAt),
  };
}

export function serializeAddon(id: string, d: any) {
  return {
    id,
    name: d.name || '',
    description: d.description || null,
    price: Number(d.price) || 0,
    duration: Number(d.duration) || 0,
    icon: d.icon || null,
    display_order: d.displayOrder ?? d.display_order ?? 0,
    status: d.status || (d.isActive === false ? 'inactive' : 'active'),
    created_at: toIso(d.createdAt),
    updated_at: toIso(d.updatedAt),
  };
}

export function serializeService(id: string, d: any) {
  const price = parsePrice(d.nonMemberPrice ?? d.price);
  const member = parsePrice(d.memberPrice ?? d.offer_price);
  const duration = d.durationMinutes ?? parseDuration(d.duration);
  return {
    id,
    name: d.name || '',
    category: d.categoryName || d.category || 'General',
    category_id: d.categoryId || null,
    description: d.description || null,
    price,
    offer_price: member && member !== price ? member : null,
    duration,
    duration_label: typeof d.duration === 'string' ? d.duration : formatDuration(duration),
    image: d.image || null,
    display_order: d.displayOrder ?? d.display_order ?? 0,
    status: d.isActive === false || d.status === 'inactive' ? 'inactive' : 'active',
    addon_ids: Array.isArray(d.addonIds) ? d.addonIds : [],
    created_at: toIso(d.createdAt),
    updated_at: toIso(d.updatedAt),
  };
}

/** Admin UI payload (snake_case or legacy camelCase) → Firestore service fields */
export function serviceFieldsFromBody(body: any, categoryName?: string) {
  const out: Record<string, unknown> = {};
  if (body.name !== undefined) out.name = String(body.name).trim();
  if (body.description !== undefined) out.description = body.description || '';

  const categoryId = body.category_id ?? body.categoryId;
  if (categoryId !== undefined) out.categoryId = categoryId || null;
  const catName = categoryName ?? body.category ?? body.categoryName;
  if (catName !== undefined) out.categoryName = catName;

  const price = body.price ?? body.nonMemberPrice;
  if (price !== undefined) out.nonMemberPrice = parsePrice(price);
  if (body.offer_price !== undefined || body.memberPrice !== undefined) {
    const member = body.offer_price ?? body.memberPrice;
    out.memberPrice = member === null || member === '' ? parsePrice(price ?? 0) : parsePrice(member);
  } else if (price !== undefined) {
    out.memberPrice = parsePrice(price);
  }

  if (body.duration !== undefined) {
    const minutes = parseDuration(body.duration);
    out.durationMinutes = minutes;
    out.duration = typeof body.duration === 'string' && /[a-z]/i.test(body.duration)
      ? body.duration
      : formatDuration(minutes);
  }
  const order = body.display_order ?? body.displayOrder;
  if (order !== undefined) out.displayOrder = Number(order) || 0;

  if (body.status !== undefined) out.isActive = body.status !== 'inactive';
  else if (body.isActive !== undefined) out.isActive = !!body.isActive;
  if (body.isFeatured !== undefined) out.isFeatured = !!body.isFeatured;
  if (body.image !== undefined) out.image = body.image || null;
  if (Array.isArray(body.addon_ids)) out.addonIds = body.addon_ids;
  return out;
}

// ── One-time seeding from the public website's price list ──────────

let seedPromise: Promise<void> | null = null;

/**
 * The public website's menu lives in `src/lib/services-data.ts`. The admin
 * catalog is stored in Firestore. On first use, copy the website menu into
 * Firestore so the admin panel's service lists are never empty. A flag in
 * settings/catalog prevents re-seeding after the admin edits or deletes items.
 */
export function ensureCatalogSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedCatalog().catch(err => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function seedCatalog() {
  const flagRef = adminDb.collection(Collections.SETTINGS).doc('catalog');
  const flag = await flagRef.get();
  if (flag.exists && flag.data()?.seeded) return;

  const [catSnap, svcSnap] = await Promise.all([
    adminDb.collection(CATALOG.CATEGORIES).limit(1).get(),
    adminDb.collection(CATALOG.SERVICES).get(),
  ]);

  const batch = adminDb.batch();
  const now = FieldValue.serverTimestamp();

  if (catSnap.empty) {
    if (svcSnap.empty) {
      // Fresh database: import categories + services from the website menu
      websiteCategories.forEach((cat, ci) => {
        batch.set(adminDb.collection(CATALOG.CATEGORIES).doc(cat.id), {
          name: cat.title,
          description: cat.description,
          icon: cat.icon,
          displayOrder: ci,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
        cat.services.forEach((svc, si) => {
          const minutes = parseDuration(svc.duration);
          batch.set(adminDb.collection(CATALOG.SERVICES).doc(), {
            name: svc.name,
            description: svc.note || '',
            categoryId: cat.id,
            categoryName: cat.title,
            duration: svc.duration,
            durationMinutes: minutes,
            nonMemberPrice: parsePrice(svc.nonMember),
            memberPrice: parsePrice(svc.member),
            displayOrder: si,
            isActive: true,
            isFeatured: false,
            addonIds: [],
            createdAt: now,
            updatedAt: now,
          });
        });
      });
    } else {
      // Services already exist (created earlier): derive categories from them
      const names = new Map<string, string>();
      svcSnap.docs.forEach((doc: any) => {
        const d = doc.data();
        const name = d.categoryName || 'General';
        const id = d.categoryId || slugify(name);
        names.set(id, name);
        if (!d.categoryId) batch.update(doc.ref, { categoryId: id });
      });
      Array.from(names.entries()).forEach(([id, name], i) => {
        batch.set(adminDb.collection(CATALOG.CATEGORIES).doc(id), {
          name,
          description: '',
          icon: '',
          displayOrder: i,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
      });
    }
  }

  batch.set(flagRef, { seeded: true, seededAt: now }, { merge: true });
  await batch.commit();
}
