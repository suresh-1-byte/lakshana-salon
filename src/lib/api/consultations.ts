// ═══════════════════════════════════════════════════════
//  Consultations API - Firebase Implementation
// ═══════════════════════════════════════════════════════

import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';
import type { Consultation, ConsultationStatus } from '@/types/admin';

/**
 * Create consultation
 */
const toList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map(String).filter(Boolean)
    : typeof value === 'string'
      ? value.split(',').map(v => v.trim()).filter(Boolean)
      : [];

export async function createConsultation(data: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    if (!data.customerId) {
      return { success: false, error: 'Customer is required' };
    }

    // Store the customer's name so lists don't need an extra lookup
    let customerName = (data as any).customerName || '';
    if (!customerName) {
      const customerDoc = await adminDb.collection(Collections.CUSTOMERS).doc(data.customerId).get();
      if (!customerDoc.exists) return { success: false, error: 'Customer not found' };
      customerName = customerDoc.data()?.name || '';
    }

    const consultationData = {
      customerId: data.customerId,
      customerName,
      consultantId: data.consultantId || null,
      consultationDate: data.consultationDate,
      hairType: data.hairType,
      skinType: data.skinType,
      problems: data.problems,
      suggestions: data.suggestions,
      recommendedServices: toList(data.recommendedServices),
      recommendedProducts: toList(data.recommendedProducts),
      beforeImages: data.beforeImages || [],
      notes: data.notes,
      nextVisit: data.nextVisit,
      status: data.status || 'completed',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection(Collections.CONSULTATIONS)
      .add(consultationData);

    return { success: true, consultationId: docRef.id };
  } catch (error) {
    console.error('Error creating consultation:', error);
    return { success: false, error: 'Failed to create consultation' };
  }
}

/**
 * Update consultation
 */
export async function updateConsultation(consultationId: string, updates: Partial<Consultation>) {
  try {
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    if (updates.consultantId !== undefined) updateData.consultantId = updates.consultantId;
    if (updates.consultationDate !== undefined) updateData.consultationDate = updates.consultationDate;
    if (updates.hairType !== undefined) updateData.hairType = updates.hairType;
    if (updates.skinType !== undefined) updateData.skinType = updates.skinType;
    if (updates.problems !== undefined) updateData.problems = updates.problems;
    if (updates.suggestions !== undefined) updateData.suggestions = updates.suggestions;
    if (updates.recommendedServices !== undefined) updateData.recommendedServices = updates.recommendedServices;
    if (updates.recommendedProducts !== undefined) updateData.recommendedProducts = updates.recommendedProducts;
    if (updates.beforeImages !== undefined) updateData.beforeImages = updates.beforeImages;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.nextVisit !== undefined) updateData.nextVisit = updates.nextVisit;
    if (updates.status !== undefined) updateData.status = updates.status;

    await adminDb
      .collection(Collections.CONSULTATIONS)
      .doc(consultationId)
      .update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating consultation:', error);
    return { success: false, error: 'Failed to update consultation' };
  }
}

/**
 * Get consultation by ID
 */
export async function getConsultation(consultationId: string): Promise<Consultation | null> {
  try {
    const doc = await adminDb
      .collection(Collections.CONSULTATIONS)
      .doc(consultationId)
      .get();

    if (!doc.exists) return null;

    const data = doc.data()!;
    return {
      id: doc.id,
      customerId: data.customerId,
      consultantId: data.consultantId,
      consultationDate: data.consultationDate,
      hairType: data.hairType,
      skinType: data.skinType,
      problems: data.problems,
      suggestions: data.suggestions,
      recommendedServices: data.recommendedServices || [],
      recommendedProducts: data.recommendedProducts || [],
      beforeImages: data.beforeImages || [],
      notes: data.notes,
      nextVisit: data.nextVisit,
      status: data.status,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as Consultation;
  } catch (error) {
    console.error('Error fetching consultation:', error);
    return null;
  }
}

/**
 * Get consultations
 */
export async function getConsultations(filters?: {
  customerId?: string;
  status?: ConsultationStatus;
}): Promise<Consultation[]> {
  try {
    // Filter + sort in memory so no composite Firestore index is needed
    let query = adminDb.collection(Collections.CONSULTATIONS) as any;

    if (filters?.customerId) {
      query = query.where('customerId', '==', filters.customerId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) return [];

    const toIso = (v: any) => v?.toDate?.()?.toISOString?.() || v || '';

    return snapshot.docs
      .filter((doc: any) => !filters?.status || doc.data().status === filters.status)
      .sort((a: any, b: any) =>
        String(toIso(b.data().consultationDate)).localeCompare(String(toIso(a.data().consultationDate)))
      )
      .map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: data.customerId,
        customerName: data.customerName,
        consultantId: data.consultantId,
        consultantName: data.consultantName,
        consultationDate: toIso(data.consultationDate),
        hairType: data.hairType,
        skinType: data.skinType,
        problems: data.problems,
        suggestions: data.suggestions,
        recommendedServices: data.recommendedServices || [],
        recommendedProducts: data.recommendedProducts || [],
        beforeImages: data.beforeImages || [],
        notes: data.notes,
        nextVisit: data.nextVisit,
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Consultation;
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return [];
  }
}

/**
 * Delete consultation
 */
export async function deleteConsultation(consultationId: string) {
  try {
    await adminDb
      .collection(Collections.CONSULTATIONS)
      .doc(consultationId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting consultation:', error);
    return { success: false, error: 'Failed to delete consultation' };
  }
}

/**
 * Convert consultation to appointment
 */
export async function convertToAppointment(consultationId: string, appointmentData: {
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  staffId?: string;
  staffName?: string;
  notes?: string;
}) {
  try {
    const consultation = await getConsultation(consultationId);
    
    if (!consultation) {
      return { success: false, error: 'Consultation not found' };
    }

    // Get customer details
    const customerDoc = await adminDb
      .collection(Collections.CUSTOMERS)
      .doc(consultation.customerId)
      .get();

    if (!customerDoc.exists) {
      return { success: false, error: 'Customer not found' };
    }

    const customer = customerDoc.data()!;

    // Create appointment from consultation
    const appointmentType = consultation.recommendedServices?.[0] || 'Consultation';
    
    // Create a booking from the consultation (shows in Bookings & Calendar)
    const bookingRef = await adminDb.collection(Collections.BOOKINGS).add({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      customerId: consultation.customerId,
      services: [{ name: appointmentType, duration: `${appointmentData.duration || 60} min` }],
      scheduledDate: appointmentData.appointmentDate,
      scheduledTime: appointmentData.appointmentTime,
      notes: appointmentData.notes || `Converted from consultation: ${consultation.problems || ''}`,
      source: 'consultation',
      status: 'confirmed',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const result = { id: bookingRef.id };

    // Update consultation status
    await updateConsultation(consultationId, {
      status: 'completed',
      nextVisit: appointmentData.appointmentDate,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error converting consultation to appointment:', error);
    return { success: false, error: 'Failed to convert consultation' };
  }
}
