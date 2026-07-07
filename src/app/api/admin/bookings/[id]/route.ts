import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, scheduledDate, scheduledTime, notes } = body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get booking details
    const bookingDoc = await adminDb.collection('bookings').doc(id).get();
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingDoc.data();
    const previousStatus = bookingData?.status;

    // Handle package deduction when confirming booking
    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      // Check if customer has active package
      if (bookingData?.phone) {
        // Find customer
        const customerSnap = await adminDb
          .collection(Collections.CUSTOMERS)
          .where('phone', '==', bookingData.phone)
          .limit(1)
          .get();

        if (!customerSnap.empty) {
          const customerId = customerSnap.docs[0].id;

          // Find active package
          const packageSnap = await adminDb
            .collection(Collections.CUSTOMER_PACKAGES)
            .where('customerId', '==', customerId)
            .where('status', '==', 'active')
            .limit(1)
            .get();

          if (!packageSnap.empty) {
            const packageDoc = packageSnap.docs[0];
            const packageData = packageDoc.data();
            const packageId = packageDoc.id;

            // Check if this booking was already deducted
            if (!bookingData.packageDeducted) {
              // Calculate service total from booking services
              let serviceTotal = 0;
              if (bookingData.services && Array.isArray(bookingData.services)) {
                for (const service of bookingData.services) {
                  // Extract price from member field (e.g., "₹2,000" -> 2000)
                  if (service.member) {
                    const priceMatch = service.member.toString().match(/[\d,]+/);
                    if (priceMatch) {
                      const price = parseInt(priceMatch[0].replace(/,/g, ''));
                      serviceTotal += price;
                    }
                  }
                }
              }

              // Check sufficient balance
              const currentBalance = packageData.availableBalance || 0;
              if (serviceTotal > currentBalance) {
                return NextResponse.json({
                  error: 'Insufficient package balance',
                  requiredAmount: serviceTotal,
                  availableBalance: currentBalance,
                  shortfall: serviceTotal - currentBalance,
                }, { status: 400 });
              }

              // Deduct from package balance
              const newBalance = currentBalance - serviceTotal;
              const newUsedAmount = (packageData.usedAmount || 0) + serviceTotal;

              await packageDoc.ref.update({
                availableBalance: newBalance,
                usedAmount: newUsedAmount,
                updatedAt: FieldValue.serverTimestamp(),
              });

              // Create transaction record
              await packageDoc.ref.collection('transactions').add({
                type: 'debit',
                amount: serviceTotal,
                balanceBefore: currentBalance,
                balanceAfter: newBalance,
                description: `Services: ${bookingData.services.map((s: any) => s.name).join(', ')}`,
                bookingId: id,
                notes: `Booking confirmed - ID: ${id.slice(-6).toUpperCase()}`,
                createdAt: FieldValue.serverTimestamp(),
              });

              // Mark booking as package deducted
              await bookingDoc.ref.update({
                packageDeducted: true,
                packageId: packageId,
                packageAmount: serviceTotal,
              });

              await logActivity('package_deducted', {
                entityType: 'booking',
                entityId: id,
                packageId,
                amount: serviceTotal,
                customerId,
              });
            }
          }
        }
      }
    }

    // Handle refund when cancelling a confirmed booking with package deduction
    if (status === 'cancelled' && previousStatus === 'confirmed' && bookingData?.packageDeducted) {
      const packageId = bookingData.packageId;
      const refundAmount = bookingData.packageAmount || 0;

      if (packageId && refundAmount > 0) {
        const packageDoc = await adminDb.collection(Collections.CUSTOMER_PACKAGES).doc(packageId).get();
        
        if (packageDoc.exists) {
          const packageData = packageDoc.data();
          const currentBalance = packageData?.availableBalance || 0;
          const newBalance = currentBalance + refundAmount;
          const newUsedAmount = (packageData?.usedAmount || 0) - refundAmount;

          await packageDoc.ref.update({
            availableBalance: newBalance,
            usedAmount: Math.max(0, newUsedAmount),
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Create refund transaction
          await packageDoc.ref.collection('transactions').add({
            type: 'refund',
            amount: refundAmount,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: `Refund for cancelled booking`,
            bookingId: id,
            notes: `Booking cancelled - ID: ${id.slice(-6).toUpperCase()}`,
            createdAt: FieldValue.serverTimestamp(),
          });

          // Mark booking as refunded
          await bookingDoc.ref.update({
            packageDeducted: false,
            packageRefunded: true,
          });

          await logActivity('package_refunded', {
            entityType: 'booking',
            entityId: id,
            packageId,
            amount: refundAmount,
          });
        }
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (status)        updateData.status = status;
    if (scheduledDate) updateData.scheduledDate = scheduledDate;
    if (scheduledTime) updateData.scheduledTime = scheduledTime;
    if (notes !== undefined) updateData.notes = notes;

    await adminDb.collection('bookings').doc(id).update(updateData);
    await logActivity('booking_update', `Booking ${status || 'updated'}: ${id}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await adminDb.collection('bookings').doc(id).delete();
    await logActivity('booking_delete', `Booking deleted: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
