// ═══════════════════════════════════════════════════════
//  Firebase Admin SDK - Server-Side Firebase Operations
// ═══════════════════════════════════════════════════════

import * as admin from 'firebase-admin';
import { getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error:', error);
  }
}

// Export Firestore instance
export const adminDb = getFirestore();
export const adminMsg = getMessaging();
export const getAdminDb = () => adminDb;

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
}) {
  try {
    // Check if customer exists
    const customersRef = adminDb.collection(Collections.CUSTOMERS);
    const snapshot = await customersRef.where('phone', '==', data.phone).limit(1).get();

    if (!snapshot.empty) {
      // Customer exists, return existing
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    // Create new customer
    const newCustomer = {
      name: data.name,
      phone: data.phone,
      whatsappNumber: data.whatsappNumber || data.phone,
      email: data.email || null,
      status: 'active',
      totalVisits: 0,
      totalSpent: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await customersRef.add(newCustomer);
    return { id: docRef.id, ...newCustomer };
  } catch (error) {
    console.error('Error in upsertCustomer:', error);
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
    console.error('Error logging activity:', error);
  }
}
