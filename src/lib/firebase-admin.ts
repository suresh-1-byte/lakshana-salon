// Server-side Firebase Admin SDK — fault-tolerant init
// When Firebase credentials are not configured, all DB calls return safe empty results
// so the admin panel UI still loads and JWT auth still works.

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

// ── Collections ───────────────────────────────────────────────────
export const Collections = {
  BOOKINGS:      'bookings',
  CUSTOMERS:     'customers',
  BILLING:       'billing',
  GALLERY:       'gallery',
  SERVICES:      'services',
  REVIEWS:       'reviews',
  NOTIFICATIONS: 'notifications',
  COUPONS:       'coupons',
  SETTINGS:      'settings',
  ACTIVITY_LOG:  'activity_log',
  FCM_TOKENS:    'fcm_tokens',
} as const;

export { FieldValue, Timestamp };

// ── Lazy initialiser ─────────────────────────────────────────────
let _app:     App | null     = null;
let _db:      Firestore | null = null;
let _msg:     Messaging | null = null;
let _initErr: string | null  = null;

function getAdminApp(): App | null {
  if (_app) return _app;
  if (_initErr) return null;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Skip init if credentials are placeholders or missing
  if (
    !projectId   || projectId   === 'your_project_id' ||
    !clientEmail || clientEmail.includes('your_project') ||
    !privateKey  || privateKey.includes('YOUR_KEY_HERE')
  ) {
    _initErr = 'Firebase credentials not configured — using mock mode';
    console.warn('⚠️  Firebase Admin: credentials not configured. DB operations will return empty results.');
    return null;
  }

  try {
    if (getApps().length > 0) {
      _app = getApps()[0];
    } else {
      _app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId: projectId,
        databaseURL: `https://${projectId}.firebaseio.com`,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
    return _app;
  } catch (err) {
    _initErr = String(err);
    console.error('Firebase Admin init error:', err);
    return null;
  }
}

// ── Safe Firestore accessor ───────────────────────────────────────
export function getAdminDb(): Firestore | null {
  if (_db) return _db;
  const app = getAdminApp();
  if (!app) return null;
  try { _db = getFirestore(app); return _db; } catch { return null; }
}

// ── Safe Messaging accessor ───────────────────────────────────────
export function getAdminMsg(): Messaging | null {
  if (_msg) return _msg;
  const app = getAdminApp();
  if (!app) return null;
  try { _msg = getMessaging(app); return _msg; } catch { return null; }
}

// Back-compat exports used by existing routes
export const adminDb  = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    if (!db) {
      // Return a mock collection that returns empty snapshots
      if (prop === 'collection') {
        return () => mockCollection();
      }
      return () => Promise.resolve(null);
    }
    const val = (db as any)[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  },
});

export const adminMsg = new Proxy({} as Messaging, {
  get(_target, prop) {
    const msg = getAdminMsg();
    if (!msg) {
      return () => Promise.resolve({ successCount: 0, failureCount: 0, responses: [] });
    }
    const val = (msg as any)[prop];
    return typeof val === 'function' ? val.bind(msg) : val;
  },
});

// ── Mock collection (returns empty results when no Firebase) ───────
function mockCollection(): any {
  const emptySnap = { docs: [], empty: true, size: 0, forEach: () => {}, get: () => Promise.resolve(emptySnap) };
  const mockDoc   = {
    get:    () => Promise.resolve({ exists: false, data: () => undefined, id: 'mock' }),
    set:    () => Promise.resolve(),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    id:     'mock',
  };
  const mockRef = {
    add:    () => Promise.resolve({ id: 'mock-' + Date.now() }),
    doc:    () => mockDoc,
    where:  () => mockRef,
    orderBy:() => mockRef,
    limit:  () => mockRef,
    get:    () => Promise.resolve(emptySnap),
    set:    () => Promise.resolve(),
  };
  return mockRef;
}

// ── Activity Logger ───────────────────────────────────────────────
export async function logActivity(
  action: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  try {
    const db = getAdminDb();
    if (!db) return; // Firebase not configured — skip silently
    await db.collection(Collections.ACTIVITY_LOG).add({
      action,
      description,
      metadata: metadata || {},
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // Never throw on logging failure
  }
}

// ── Customer Upsert ───────────────────────────────────────────────
export async function upsertCustomer(data: {
  name: string;
  phone: string;
  email?: string;
  visitAmount?: number;
  services?: string[];
}) {
  const db = getAdminDb();
  if (!db) return 'mock-customer';

  const { name, phone, email, visitAmount = 0 } = data;

  try {
    const existing = await db
      .collection(Collections.CUSTOMERS)
      .where('phone', '==', phone)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      await doc.ref.update({
        totalVisits: FieldValue.increment(1),
        totalSpent:  FieldValue.increment(visitAmount),
        lastVisit:   FieldValue.serverTimestamp(),
        updatedAt:   FieldValue.serverTimestamp(),
      });
      return doc.id;
    }

    const ref = await db.collection(Collections.CUSTOMERS).add({
      name,
      phone,
      email:         email || '',
      address:       '',
      dateOfBirth:   '',
      anniversary:   '',
      notes:         '',
      totalVisits:   1,
      totalSpent:    visitAmount,
      lastVisit:     FieldValue.serverTimestamp(),
      loyaltyStatus: 'Bronze',
      createdAt:     FieldValue.serverTimestamp(),
      updatedAt:     FieldValue.serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error('upsertCustomer error:', err);
    return 'error-customer';
  }
}
