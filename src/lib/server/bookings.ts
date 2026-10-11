// ═══════════════════════════════════════════════════════
//  Booking helpers shared by the /api/admin/bookings routes
// ═══════════════════════════════════════════════════════

import { adminDb, Collections, FieldValue, findCustomerByPhone, logActivity } from '@/lib/firebase-admin';
import { parsePrice, toIso } from '@/lib/server/admin-catalog';

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rescheduled',
  'no-show',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export function serializeBooking(id: string, d: any) {
  return {
    ...d,
    id,
    name: d.name || '',
    phone: d.phone || '',
    email: d.email || '',
    services: Array.isArray(d.services) ? d.services : [],
    addons: Array.isArray(d.addons) ? d.addons : [],
    status: d.status || 'pending',
    scheduledDate: d.scheduledDate || null,
    scheduledTime: d.scheduledTime || null,
    notes: d.notes || '',
    totalAmount: d.totalAmount ?? null,
    advanceAmount: d.advanceAmount ?? null,
    source: d.source || 'website',
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
    confirmedAt: toIso(d.confirmedAt),
  };
}

export class BookingError extends Error {
  constructor(message: string, public status = 400, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

/** Sum of the booking's service prices (member price string like "₹2,000") */
function bookingServiceTotal(booking: any): number {
  if (typeof booking.totalAmount === 'number' && booking.totalAmount > 0) return booking.totalAmount;
  let total = 0;
  for (const service of booking.services || []) {
    total += parsePrice(service.price ?? service.member);
  }
  for (const addon of booking.addons || []) {
    total += parsePrice(addon.price);
  }
  return total;
}

/**
 * Update a booking's status / schedule / notes.
 *
 * Confirming a booking for a customer with an active prepaid package deducts
 * the service amount from the package balance; cancelling a confirmed booking
 * refunds it again.
 */
export async function updateBooking(
  id: string,
  changes: { status?: string; scheduledDate?: string; scheduledTime?: string; notes?: string }
) {
  const { status, scheduledDate, scheduledTime, notes } = changes;

  if (status && !BOOKING_STATUSES.includes(status as BookingStatus)) {
    throw new BookingError('Invalid status');
  }

  const bookingRef = adminDb.collection(Collections.BOOKINGS).doc(id);
  const bookingDoc = await bookingRef.get();
  if (!bookingDoc.exists) throw new BookingError('Booking not found', 404);

  const bookingData: any = bookingDoc.data() || {};
  const previousStatus = bookingData.status || 'pending';

  // ── Package deduction when confirming ─────────────────────────────
  if (status === 'confirmed' && previousStatus !== 'confirmed' && !bookingData.packageDeducted && bookingData.phone) {
    const customerDoc = await findCustomerByPhone(bookingData.phone);

    if (customerDoc) {
      const customerId = customerDoc.id;
      const packageSnap = await adminDb
        .collection(Collections.CUSTOMER_PACKAGES)
        .where('customerId', '==', customerId)
        .get();
      const packageDoc = packageSnap.docs.find((d: any) => d.data().status === 'active');

      if (packageDoc) {
        const packageData = packageDoc.data();
        const serviceTotal = bookingServiceTotal(bookingData);
        const currentBalance = packageData.availableBalance || 0;

        if (serviceTotal > 0) {
          if (serviceTotal > currentBalance) {
            throw new BookingError('Insufficient package balance', 400, {
              requiredAmount: serviceTotal,
              availableBalance: currentBalance,
              shortfall: serviceTotal - currentBalance,
            });
          }

          const newBalance = currentBalance - serviceTotal;
          await packageDoc.ref.update({
            availableBalance: newBalance,
            usedAmount: (packageData.usedAmount || 0) + serviceTotal,
            updatedAt: FieldValue.serverTimestamp(),
          });
          await packageDoc.ref.collection('transactions').add({
            type: 'debit',
            amount: serviceTotal,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: `Services: ${(bookingData.services || []).map((s: any) => s.name).join(', ')}`,
            bookingId: id,
            notes: `Booking confirmed - ID: ${id.slice(-6).toUpperCase()}`,
            createdAt: FieldValue.serverTimestamp(),
          });
          await bookingRef.update({
            packageDeducted: true,
            packageId: packageDoc.id,
            packageAmount: serviceTotal,
          });
          await logActivity('package_deducted', {
            entityType: 'booking',
            entityId: id,
            packageId: packageDoc.id,
            amount: serviceTotal,
            customerId,
          });
        }
      }
    }
  }

  // ── Refund when cancelling a confirmed booking ───────────────────
  if (status === 'cancelled' && bookingData.packageDeducted && bookingData.packageId) {
    const refundAmount = bookingData.packageAmount || 0;
    const packageDoc = await adminDb.collection(Collections.CUSTOMER_PACKAGES).doc(bookingData.packageId).get();

    if (packageDoc.exists && refundAmount > 0) {
      const packageData: any = packageDoc.data();
      const currentBalance = packageData.availableBalance || 0;
      const newBalance = currentBalance + refundAmount;

      await packageDoc.ref.update({
        availableBalance: newBalance,
        usedAmount: Math.max(0, (packageData.usedAmount || 0) - refundAmount),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await packageDoc.ref.collection('transactions').add({
        type: 'refund',
        amount: refundAmount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: 'Refund for cancelled booking',
        bookingId: id,
        notes: `Booking cancelled - ID: ${id.slice(-6).toUpperCase()}`,
        createdAt: FieldValue.serverTimestamp(),
      });
      await bookingRef.update({ packageDeducted: false, packageRefunded: true });
      await logActivity('package_refunded', {
        entityType: 'booking',
        entityId: id,
        packageId: bookingData.packageId,
        amount: refundAmount,
      });
    }
  }

  // ── Save the booking itself ──────────────────────────────────────
  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (status) {
    updateData.status = status;
    if (status === 'confirmed' && previousStatus !== 'confirmed') updateData.confirmedAt = FieldValue.serverTimestamp();
    if (status === 'completed' && previousStatus !== 'completed') updateData.completedAt = FieldValue.serverTimestamp();
    if (status === 'cancelled' && previousStatus !== 'cancelled') updateData.cancelledAt = FieldValue.serverTimestamp();
  }
  if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate || null;
  if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime || null;
  if (notes !== undefined) updateData.notes = notes;

  await bookingRef.update(updateData);

  // A completed visit updates the customer's last visit date
  if (status === 'completed' && previousStatus !== 'completed' && bookingData.phone) {
    try {
      const customerDoc = await findCustomerByPhone(bookingData.phone);
      if (customerDoc) {
        await customerDoc.ref.update({
          lastVisit: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } catch {
      // non-critical
    }
  }

  await logActivity('booking_update', {
    entityType: 'booking',
    entityId: id,
    status: status || previousStatus,
    previousStatus,
  });

  const updated = await bookingRef.get();
  return serializeBooking(id, updated.data());
}
