// ═══════════════════════════════════════════════════════
//  Customer Profile API - Complete History & Management (Firebase)
// ═══════════════════════════════════════════════════════

import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';
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
  // Get customer data
  const customerDoc = await adminDb.collection(Collections.CUSTOMERS).doc(customerId).get();

  if (!customerDoc.exists) return null;

  const customerData = customerDoc.data()!;
  const phone: string = customerData.phone || '';

  // Get all related data in parallel. Website bookings are linked by phone
  // number (they carry no customerId), so match on either.
  const [bookings, payments, appointments, consultations, packages, membership] = await Promise.all([
    getCustomerBookings(customerId, phone),
    getCustomerPayments(customerId, phone),
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

  const isDeleted = customerData.isDeleted === true || customerData.status === 'deleted';

  const customer: Customer = {
    id: customerDoc.id,
    customerId: customerData.customerId,
    name: customerData.name || '',
    phone,
    whatsappNumber: customerData.whatsappNumber || '',
    email: customerData.email || '',
    dateOfBirth: customerData.dateOfBirth || '',
    anniversary: customerData.anniversary || '',
    gender: customerData.gender || '',
    address: customerData.address || '',
    city: customerData.city || '',
    notes: customerData.notes || '',
    memberSince: toIso(customerData.memberSince) || toIso(customerData.createdAt) || undefined,
    preferredStylist: customerData.preferredStylist || '',
    preferredServices: customerData.preferredServices || [],
    customerPhoto: customerData.customerPhoto,
    totalVisits: customerData.totalVisits || 0,
    totalSpent: customerData.totalSpent || 0,
    lastVisit: toIso(customerData.lastVisit) || undefined,
    loyaltyStatus: customerData.loyaltyStatus,
    status: isDeleted ? 'deleted' : customerData.status || 'active',
    isDeleted,
    deletedAt: toIso(customerData.deletedAt) || undefined,
    createdAt: toIso(customerData.createdAt) || '',
    updatedAt: toIso(customerData.updatedAt) || undefined,
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
}

// ── helpers ──────────────────────────────────────────────

function toIso(value: any): string | null {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}

function byDateDesc<T>(field: (item: T) => string | null | undefined) {
  return (a: T, b: T) => (field(b) || '').localeCompare(field(a) || '');
}

/**
 * Run single-field equality queries (no composite Firestore index needed)
 * and merge the results, de-duplicated by document id.
 */
async function findDocs(collection: string, filters: Array<[string, unknown]>) {
  const valid = filters.filter(([, value]) => value !== undefined && value !== null && value !== '');
  const snaps = await Promise.all(
    valid.map(([field, value]) =>
      adminDb.collection(collection).where(field, '==', value).get().catch(() => null)
    )
  );
  const docs = new Map<string, any>();
  snaps.forEach(snap => snap?.docs.forEach((doc: any) => docs.set(doc.id, doc)));
  return Array.from(docs.values());
}

/**
 * Get customer bookings
 */
async function getCustomerBookings(customerId: string, phone: string): Promise<Booking[]> {
  try {
    const docs = await findDocs(Collections.BOOKINGS, [['customerId', customerId], ['phone', phone]]);
    return docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          services: data.services || [],
          status: data.status || 'pending',
          notes: data.notes,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          createdAt: toIso(data.createdAt) || '',
          updatedAt: toIso(data.updatedAt) || undefined,
          customerId: data.customerId,
        } as Booking;
      })
      .sort(byDateDesc(b => b.createdAt));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

/**
 * Get customer payments
 */
async function getCustomerPayments(customerId: string, phone: string): Promise<Bill[]> {
  try {
    const docs = await findDocs(Collections.BILLING, [['customerId', customerId], ['customerPhone', phone]]);
    return docs
      .map(doc => {
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
          createdAt: toIso(data.createdAt) || '',
        } as Bill;
      })
      .sort(byDateDesc(p => p.createdAt));
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
    const docs = await findDocs(Collections.APPOINTMENTS, [['customerId', customerId]]);
    return docs
      .map(doc => {
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
          createdAt: toIso(data.createdAt) || '',
          updatedAt: toIso(data.updatedAt) || undefined,
        } as Appointment;
      })
      .sort(byDateDesc(a => a.appointmentDate));
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
    const docs = await findDocs(Collections.CONSULTATIONS, [['customerId', customerId]]);
    return docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId,
          customerName: data.customerName,
          consultantId: data.consultantId,
          consultantName: data.consultantName,
          consultationDate: toIso(data.consultationDate) || '',
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
          createdAt: toIso(data.createdAt) || '',
          updatedAt: toIso(data.updatedAt) || undefined,
        } as Consultation;
      })
      .sort(byDateDesc(c => c.consultationDate));
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return [];
  }
}

/**
 * Get customer packages (prepaid balance packages)
 */
async function getCustomerPackages(customerId: string): Promise<CustomerPackage[]> {
  try {
    const docs = await findDocs(Collections.CUSTOMER_PACKAGES, [['customerId', customerId]]);
    return docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId,
          packageId: data.packageId,
          packageName: data.packageName || 'Prepaid Package',
          purchaseDate: data.purchaseDate || toIso(data.createdAt) || '',
          expiryDate: data.expiryDate,
          totalSessions: data.totalSessions,
          remainingSessions: data.remainingSessions,
          totalAmount: data.totalAmount,
          availableBalance: data.availableBalance,
          usedAmount: data.usedAmount,
          status: data.status,
          usageHistory: data.usageHistory || [],
          createdAt: toIso(data.createdAt) || '',
          updatedAt: toIso(data.updatedAt) || undefined,
        } as CustomerPackage;
      })
      .sort(byDateDesc(p => p.purchaseDate));
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

/**
 * Get the customer's active membership (membership wallet)
 */
async function getCustomerMembership(customerId: string): Promise<Membership | null> {
  try {
    const [wallets, legacy] = await Promise.all([
      findDocs(Collections.MEMBERSHIP_WALLETS, [['customerId', customerId]]),
      findDocs(Collections.MEMBERSHIPS, [['customerId', customerId]]),
    ]);
    const doc = [...wallets, ...legacy].find(d => d.data().status === 'active');
    if (!doc) return null;
    const data = doc.data();

    return {
      id: doc.id,
      customerId: data.customerId,
      customerName: data.customerName,
      tier: data.tier || data.packageName || 'Membership',
      joiningDate: data.joiningDate || toIso(data.startDate) || toIso(data.createdAt) || '',
      expiryDate: toIso(data.expiryDate) || '',
      benefits: data.benefits || [],
      discountPercentage: data.discountPercentage,
      availableBalance: data.availableBalance,
      membershipCardUrl: data.membershipCardUrl,
      qrCode: data.qrCode,
      barcode: data.barcode,
      status: data.status,
      createdAt: toIso(data.createdAt) || '',
      updatedAt: toIso(data.updatedAt) || undefined,
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
    const names = (booking.services || []).map((s: any) => s?.name).filter(Boolean).join(', ');
    events.push({
      id: booking.id,
      type: 'booking',
      title: 'Booking',
      description: names || `${booking.services.length} service(s) booked`,
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
      title: appointment.appointmentType || 'Appointment',
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
    const balance = (pkg as any).availableBalance;
    events.push({
      id: pkg.id,
      type: 'package',
      title: pkg.packageName,
      description: balance !== undefined
        ? `Package balance ₹${Number(balance).toLocaleString('en-IN')}`
        : `Package purchased - ${pkg.remainingSessions}/${pkg.totalSessions} sessions remaining`,
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
  return events
    .filter(e => e.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

    updateData.updatedAt = FieldValue.serverTimestamp();

    await adminDb.collection(Collections.CUSTOMERS).doc(customerId).update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating customer:', error);
    return { success: false, error: 'Failed to update customer' };
  }
}

/**
 * Soft delete customer (hidden from lists, can be restored)
 */
export async function deleteCustomer(customerId: string) {
  try {
    await adminDb.collection(Collections.CUSTOMERS).doc(customerId).update({
      status: 'deleted',
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
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
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error restoring customer:', error);
    return { success: false, error: 'Failed to restore customer' };
  }
}
