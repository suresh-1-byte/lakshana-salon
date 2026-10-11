// ═══════════════════════════════════════════════════════
//  Firebase Admin SDK - Server-Side Firebase Operations
// ═══════════════════════════════════════════════════════

import * as admin from 'firebase-admin';
import { getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { optionalPastDate, phoneKey } from '@/lib/server/validation';

// Initialize Firebase Admin SDK only if environment variables are available
// This prevents build-time errors when env vars aren't available
function initializeFirebaseAdmin() {
  // Skip initialization during build time
  if (typeof window === 'undefined' && !process.env.FIREBASE_PROJECT_ID) {
    return null;
  }

  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check if required environment variables are present
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  try {
    const app = admin.initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // Handle both escaped and unescaped newlines
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      projectId,
    });
    return app;
  } catch (error) {
    return null;
  }
}

// Lazy initialization - only initialize when actually used
let _adminDb: ReturnType<typeof getFirestore> | null = null;
let _adminMsg: ReturnType<typeof getMessaging> | null = null;

export const getAdminDb = () => {
  if (!_adminDb) {
    initializeFirebaseAdmin();
    _adminDb = getFirestore();
    try {
      // Optional form fields often arrive as `undefined`; without this
      // Firestore rejects the whole write ("Cannot use undefined as a value").
      _adminDb.settings({ ignoreUndefinedProperties: true });
    } catch {
      // settings() can only be called once per instance (e.g. after hot reload)
    }
  }
  return _adminDb;
};

export const getAdminMessaging = () => {
  if (!_adminMsg) {
    initializeFirebaseAdmin();
    _adminMsg = getMessaging();
  }
  return _adminMsg;
};

// Export for backward compatibility
export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get: (target, prop) => {
    const db = getAdminDb();
    return (db as any)[prop];
  }
});

export const adminMsg = new Proxy({} as ReturnType<typeof getMessaging>, {
  get: (target, prop) => {
    const msg = getAdminMessaging();
    return (msg as any)[prop];
  }
});

// Export Firestore utilities
export { FieldValue, Timestamp };

// Collection names
export const Collections = {
  CUSTOMERS: 'customers',
  SERVICES: 'services',
  BOOKINGS: 'bookings',
  APPOINTMENTS: 'appointments',
  BILLING: 'payments',
  PACKAGES: 'packages',
  MEMBERSHIPS: 'memberships',
  MEMBERSHIP_WALLETS: 'membership_wallets',
  CONSULTATIONS: 'consultations',
  CUSTOMER_PACKAGES: 'customer_packages',
  ENQUIRIES: 'enquiries',
  WHATSAPP_MESSAGES: 'whatsapp_messages',
  MESSAGE_TEMPLATES: 'message_templates',
  NOTIFICATIONS: 'notifications',
  GOOGLE_SHEETS_SYNC: 'google_sheets_sync_log',
  REVIEWS: 'reviews',
  GALLERY: 'gallery',
  SETTINGS: 'settings',
  COUPONS: 'coupons',
  STAFF: 'staff',
  ACTIVITY_LOG: 'audit_logs',
  FCM_TOKENS: 'fcm_tokens',
} as const;

/**
 * Find a customer by phone number regardless of how it was typed
 * ("+91 98765 43210" and "9876543210" are the same customer). Prefers an
 * active record if duplicates exist. Returns null when not found.
 *
 * Records saved before `phoneKey` existed are still found (exact-match and
 * full-scan fallbacks); they gain `phoneKey` the next time they are updated.
 */
export async function findCustomerByPhone(phone: string) {
  const key = phoneKey(phone);
  if (!key) return null;
  const customersRef = adminDb.collection(Collections.CUSTOMERS);

  const pick = (docs: any[]) =>
    docs.find(d => !(d.data().isDeleted === true || d.data().status === 'deleted')) || docs[0] || null;

  const byKey = await customersRef.where('phoneKey', '==', key).get();
  if (!byKey.empty) return pick(byKey.docs);

  const exact = await customersRef.where('phone', '==', phone).get();
  if (!exact.empty) return pick(exact.docs);

  const all = await customersRef.get();
  return pick(all.docs.filter((d: any) => phoneKey(d.data().phone) === key));
}

// Helper function: Upsert customer (create, or update the existing record for this phone)
// Visits and spending are NOT changed here — they follow paid bills
// (see lib/server/customer-stats.ts).
export async function upsertCustomer(data: {
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  dateOfBirth?: string | null;
  anniversary?: string | null;
  services?: string[];
}): Promise<string> {
  const key = phoneKey(data.phone);
  const dateOfBirth = optionalPastDate(data.dateOfBirth);
  const anniversary = optionalPastDate(data.anniversary);

  const doc = await findCustomerByPhone(data.phone);

  if (doc) {
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (key) updateData.phoneKey = key;

    // A deleted customer who books again becomes active again
    const existing = doc.data();
    if (existing?.isDeleted || existing?.status === 'deleted') {
      updateData.status = 'active';
      updateData.isDeleted = false;
      updateData.deletedAt = null;
    }

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.whatsappNumber) updateData.whatsappNumber = data.whatsappNumber;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (anniversary) updateData.anniversary = anniversary;

    await doc.ref.update(updateData);
    return doc.id;
  }

  // Create new customer
  const docRef = await adminDb.collection(Collections.CUSTOMERS).add({
    name: data.name,
    phone: data.phone,
    phoneKey: key || null,
    whatsappNumber: data.whatsappNumber || data.phone,
    email: data.email || null,
    dateOfBirth,
    anniversary,
    status: 'active',
    isDeleted: false,
    totalVisits: 0,
    totalSpent: 0,
    loyaltyStatus: 'Bronze',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

// Helper function: Log activity
export async function logActivity(action: string, details: any = {}) {
  try {
    await adminDb.collection(Collections.ACTIVITY_LOG).add({
      action,
      entityType: details.entityType || 'unknown',
      entityId: details.entityId || null,
      details,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // Log activity failed - non-critical, continue
  }
}
