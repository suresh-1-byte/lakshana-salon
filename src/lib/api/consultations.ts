// ═══════════════════════════════════════════════════════
//  Consultations API - Firebase Implementation
// ═══════════════════════════════════════════════════════

import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';
import type { Consultation, ConsultationStatus } from '@/types/admin';
import { createAppointment } from './appointments';

/**
 * Create consultation
 */
export async function createConsultation(data: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const consultationData = {
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
    let query = adminDb.collection(Collections.CONSULTATIONS) as any;

    if (filters?.customerId) {
      query = query.where('customerId', '==', filters.customerId);
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.orderBy('consultationDate', 'desc').get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
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
    
    const result = await createAppointment({
      booking_id: `CNS${Date.now()}`,
      customer_id: consultation.customerId,
      customer_name: customer.name || '',
      customer_phone: customer.phone || '',
      staff_id: appointmentData.staffId || null,
      staff_name: appointmentData.staffName || null,
      service_id: null,
      package_id: null,
      appointment_date: appointmentData.appointmentDate,
      appointment_time: appointmentData.appointmentTime,
      duration: appointmentData.duration,
      booking_status: 'confirmed',
      payment_status: 'pending',
      advance_amount: 0,
      total_amount: 0,
      notes: appointmentData.notes || `Converted from consultation: ${consultation.problems || ''}`,
    });

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
