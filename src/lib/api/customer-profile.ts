// ═══════════════════════════════════════════════════════
//  Customer Profile API - Complete History & Management (Firebase)
// ═══════════════════════════════════════════════════════

import { adminDb, Collections } from '@/lib/firebase-admin';
import type { Customer, Booking, Bill, Appointment, Consultation, CustomerPackage, Membership } from '@/types/admin';

export interface CustomerProfile extends Customer {
  bookings: Booking[];
  payments: Bill[];
  appointments: Appointment[];
  consultations: Consultation[];
  packages: CustomerPackage[];
  membership?: Membership;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'booking' | 'payment' | 'appointment' | 'consultation' | 'package' | 'membership' | 'note';
  title: string;
  description?: string;
  amount?: number;
  date: string;
  status?: string;
}

/**
 * Get complete customer profile with all history
 */
export async function getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
  try {
    // Get customer data
    const customerDoc = await adminDb.collection(Collections.CUSTOMERS).doc(customerId).get();

    if (!customerDoc.exists) return null;

    const customerData = customerDoc.data()!;

    // Get all related data in parallel
    const [bookings, payments, appointments, consultations, packages, membership] = await Promise.all([
      getCustomerBookings(customerId),
      getCustomerPayments(customerId),
      getCustomerAppointments(customerId),
      getCustomerConsultations(customerId),
      getCustomerPackages(customerId),
      getCustomerMembership(customerId),
    ]);

    // Build timeline
    const timeline = buildTimeline({
      bookings,
      payments,
      appointments,
      consultations,
      packages,
      membership: membership ? [membership] : [],
    });

    const customer: Customer = {
      id: customerDoc.id,
      customerId: customerData.customerId,
      name: customerData.name,
      phone: customerData.phone,
      whatsappNumber: customerData.whatsappNumber,
      email: customerData.email,
      dateOfBirth: customerData.dateOfBirth,
      anniversary: customerData.anniversary,
      gender: customerData.gender,
      address: customerData.address,
      city: customerData.city,
      notes: customerData.notes,
      memberSince: customerData.memberSince || customerData.createdAt,
      preferredStylist: customerData.preferredStylist,
      preferredServices: customerData.preferredServices || [],
      customerPhoto: customerData.customerPhoto,
      totalVisits: customerData.totalVisits || 0,
      totalSpent: customerData.totalSpent || 0,
      lastVisit: customerData.lastVisit,
      status: customerData.status || 'active',
      isDeleted: customerData.isDeleted || false,
      deletedAt: customerData.deletedAt,
      createdAt: customerData.createdAt?.toDate?.().toISOString() || customerData.createdAt,
      updatedAt: customerData.updatedAt?.toDate?.().toISOString() || customerData.updatedAt,
    };

    return {
      ...customer,
      bookings,
      payments,
      appointments,
      consultations,
      packages,
      membership: membership || undefined,
      timeline,
    };
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return null;
  }
}

/**
 * Get customer bookings
 */
async function getCustomerBookings(customerId: string): Promise<Booking[]> {
  try {
    const snapshot = await adminDb
      .collection(Collections.BOOKINGS)
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        services: data.services || [],
        status: data.status,
        notes: data.notes,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
        customerId: data.customerId,
      } as Booking;
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

/**
 * Get customer payments
 */
async function getCustomerPayments(customerId: string): Promise<Bill[]> {
  try {
    const snapshot = await adminDb
      .collection(Collections.BILLING)
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        items: data.items || [],
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        paymentMethod: data.paymentMethod,
        status: data.status,
        notes: data.notes,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      } as Bill;
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

/**
 * Get customer appointments
 */
async function getCustomerAppointments(customerId: string): Promise<Appointment[]> {
  try {
    const snapshot = await adminDb
      .collection(Collections.APPOINTMENTS)
      .where('customerId', '==', customerId)
      .orderBy('appointmentDate', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        staffId: data.staffId,
        staffName: data.staffName,
        appointmentType: data.appointmentType,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        duration: data.duration,
        status: data.status,
        notes: data.notes,
        reminderSent: data.reminderSent,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
      } as Appointment;
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

/**
 * Get customer consultations
 */
async function getCustomerConsultations(customerId: string): Promise<Consultation[]> {
  try {
    const snapshot = await adminDb
      .collection(Collections.CONSULTATIONS)
      .where('customerId', '==', customerId)
      .orderBy('consultationDate', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: data.customerId,
        customerName: data.customerName,
        consultantId: data.consultantId,
        consultantName: data.consultantName,
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
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
      } as Consultation;
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return [];
  }
}

/**
 * Get customer packages
 */
async function getCustomerPackages(customerId: string): Promise<CustomerPackage[]> {
  try {
    const snapshot = await adminDb
      .collection(Collections.CUSTOMER_PACKAGES)
      .where('customerId', '==', customerId)
      .orderBy('purchaseDate', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: data.customerId,
        packageId: data.packageId,
        packageName: data.packageName,
        purchaseDate: data.purchaseDate,
        expiryDate: data.expiryDate,
        totalSessions: data.totalSessions,
        remainingSessions: data.remainingSessions,
        status: data.status,
        usageHistory: data.usageHistory || [],
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
      } as CustomerPackage;
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

/**
 * Get customer membership
 */
async function getCustomerMembership(customerId: string): Promise<Membership | null> {
  try {
    const snapshot = await adminDb
      .collection(Collections.MEMBERSHIPS)
      .where('customerId', '==', customerId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      customerId: data.customerId,
      customerName: data.customerName,
      tier: data.tier,
      joiningDate: data.joiningDate,
      expiryDate: data.expiryDate,
      benefits: data.benefits || [],
      discountPercentage: data.discountPercentage,
      membershipCardUrl: data.membershipCardUrl,
      qrCode: data.qrCode,
      barcode: data.barcode,
      status: data.status,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
    } as Membership;
  } catch (error) {
    console.error('Error fetching membership:', error);
    return null;
  }
}

/**
 * Build customer timeline
 */
function buildTimeline(data: {
  bookings: Booking[];
  payments: Bill[];
  appointments: Appointment[];
  consultations: Consultation[];
  packages: CustomerPackage[];
  membership: Membership[];
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Add bookings
  data.bookings.forEach(booking => {
    events.push({
      id: booking.id,
      type: 'booking',
      title: 'Booking',
      description: `${booking.services.length} service(s) booked`,
      date: booking.createdAt,
      status: booking.status,
    });
  });

  // Add payments
  data.payments.forEach(payment => {
    events.push({
      id: payment.id,
      type: 'payment',
      title: 'Payment',
      description: `Invoice #${payment.invoiceNumber}`,
      amount: payment.total,
      date: payment.createdAt,
      status: payment.status,
    });
  });

  // Add appointments
  data.appointments.forEach(appointment => {
    events.push({
      id: appointment.id,
      type: 'appointment',
      title: appointment.appointmentType,
      description: `Scheduled appointment`,
      date: appointment.appointmentDate,
      status: appointment.status,
    });
  });

  // Add consultations
  data.consultations.forEach(consultation => {
    events.push({
      id: consultation.id,
      type: 'consultation',
      title: 'Consultation',
      description: consultation.problems || 'Hair & Skin consultation',
      date: consultation.consultationDate,
      status: consultation.status,
    });
  });

  // Add packages
  data.packages.forEach(pkg => {
    events.push({
      id: pkg.id,
      type: 'package',
      title: pkg.packageName,
      description: `Package purchased - ${pkg.remainingSessions}/${pkg.totalSessions} sessions remaining`,
      date: pkg.purchaseDate,
      status: pkg.status,
    });
  });

  // Add membership
  data.membership.forEach(membership => {
    events.push({
      id: membership.id,
      type: 'membership',
      title: `${membership.tier} Membership`,
      description: `Membership activated`,
      date: membership.joiningDate,
      status: membership.status,
    });
  });

  // Sort by date descending
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Update customer
 */
export async function updateCustomer(customerId: string, updates: Partial<Customer>) {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.whatsappNumber !== undefined) updateData.whatsappNumber = updates.whatsappNumber;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.dateOfBirth !== undefined) updateData.dateOfBirth = updates.dateOfBirth;
    if (updates.anniversary !== undefined) updateData.anniversary = updates.anniversary;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.preferredStylist !== undefined) updateData.preferredStylist = updates.preferredStylist;
    if (updates.preferredServices !== undefined) updateData.preferredServices = updates.preferredServices;
    if (updates.customerPhoto !== undefined) updateData.customerPhoto = updates.customerPhoto;

    updateData.updatedAt = new Date().toISOString();

    await adminDb.collection(Collections.CUSTOMERS).doc(customerId).update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating customer:', error);
    return { success: false, error: 'Failed to update customer' };
  }
}

/**
 * Soft delete customer
 */
export async function deleteCustomer(customerId: string) {
  try {
    await adminDb.collection(Collections.CUSTOMERS).doc(customerId).update({
      status: 'deleted',
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return { success: false, error: 'Failed to delete customer' };
  }
}

/**
 * Restore deleted customer
 */
export async function restoreCustomer(customerId: string) {
  try {
    await adminDb.collection(Collections.CUSTOMERS).doc(customerId).update({
      status: 'active',
      isDeleted: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error restoring customer:', error);
    return { success: false, error: 'Failed to restore customer' };
  }
}
