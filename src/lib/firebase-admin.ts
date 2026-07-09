// ═══════════════════════════════════════════════════════
//  Firebase Admin SDK - Server-Side Firebase Operations
// ═══════════════════════════════════════════════════════

import * as admin from 'firebase-admin';
import { getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

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

// Helper function: Upsert customer
export async function upsertCustomer(data: {
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  dateOfBirth?: string | null;
  services?: string[];
}): Promise<string> {
  try {
    // Check if customer exists
    const customersRef = adminDb.collection(Collections.CUSTOMERS);
    const snapshot = await customersRef.where('phone', '==', data.phone).limit(1).get();

    if (!snapshot.empty) {
      // Customer exists, update with new data (including DOB if provided)
      const doc = snapshot.docs[0];
      const updateData: any = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      
      // Update name if provided
      if (data.name) updateData.name = data.name;
      
      // Update email if provided
      if (data.email) updateData.email = data.email;
      
      // Update WhatsApp number if provided
      if (data.whatsappNumber) updateData.whatsappNumber = data.whatsappNumber;
      
      // Update DOB if provided (only if not already set or if new value provided)
      if (data.dateOfBirth) {
        updateData.dateOfBirth = data.dateOfBirth;
      }
      
      // Increment total visits
      updateData.totalVisits = FieldValue.increment(1);
      
      await doc.ref.update(updateData);
      return doc.id;
    }

    // Create new customer
    const newCustomer = {
      name: data.name,
      phone: data.phone,
      whatsappNumber: data.whatsappNumber || data.phone,
      email: data.email || null,
      dateOfBirth: data.dateOfBirth || null,
      status: 'active',
      totalVisits: 1,
      totalSpent: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await customersRef.add(newCustomer);
    return docRef.id;
  } catch (error) {
    throw error;
  }
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
