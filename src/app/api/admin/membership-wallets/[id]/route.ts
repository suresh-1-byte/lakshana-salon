import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/membership-wallets/[id]
 * Get membership wallet details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const doc = await adminDb
      .collection(Collections.MEMBERSHIP_WALLETS)
      .doc(id)
      .get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Membership wallet not found' },
        { status: 404 }
      );
    }

    const data = doc.data()!;

    // Get customer details
    const customerDoc = await adminDb
      .collection(Collections.CUSTOMERS)
      .doc(data.customerId)
      .get();

    const customer = customerDoc.exists
      ? {
          name: customerDoc.data()?.name || '',
          phone: customerDoc.data()?.phone || '',
          email: customerDoc.data()?.email || '',
        }
      : null;

    // Get transactions
    const transactionsSnap = await adminDb
      .collection(Collections.MEMBERSHIP_WALLETS)
      .doc(id)
      .collection('transactions')
      .orderBy('createdAt', 'desc')
      .get();

    const transactions = transactionsSnap.docs.map((txn: any) => ({
      id: txn.id,
      ...txn.data(),
      createdAt: txn.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      membership: {
        id: doc.id,
        ...data,
        customer,
        transactions,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        expiryDate: data.expiryDate?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching membership wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch membership wallet' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/membership-wallets/[id]
 * Update membership wallet status or deduct balance
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, amount, invoiceNumber, bookingId, serviceName, staffName, notes } = body;

    const docRef = adminDb.collection(Collections.MEMBERSHIP_WALLETS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Membership wallet not found' },
        { status: 404 }
      );
    }

    const data = doc.data()!;

    if (action === 'deduct') {
      // Validate deduction
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid deduction amount greater than ₹0.' },
          { status: 400 }
        );
      }

      if (amount > data.availableBalance) {
        const shortfall = amount - data.availableBalance;
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient Membership Balance',
            message: `The customer does not have enough balance.\n\nRequired: ₹${amount.toLocaleString('en-IN')}\nAvailable: ₹${data.availableBalance.toLocaleString('en-IN')}\nShortfall: ₹${shortfall.toLocaleString('en-IN')}\n\nYou can process partial payment or ask customer to top up their membership.`,
            required: amount,
            available: data.availableBalance,
            shortfall: shortfall,
          },
          { status: 400 }
        );
      }

      // Deduct balance
      const balanceBefore = data.availableBalance;
      const balanceAfter = balanceBefore - amount;

      await docRef.update({
        availableBalance: balanceAfter,
        usedAmount: data.usedAmount + amount,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Create transaction record
      await docRef.collection('transactions').add({
        type: 'debit',
        amount,
        balanceBefore,
        balanceAfter,
        description: `Service payment${serviceName ? `: ${serviceName}` : ''}`,
        invoiceNumber: invoiceNumber || null,
        bookingId: bookingId || null,
        serviceName: serviceName || null,
        staffName: staffName || null,
        notes: notes || `Deducted ₹${amount.toLocaleString('en-IN')} for service payment`,
        createdAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: `✅ Successfully deducted ₹${amount.toLocaleString('en-IN')} from membership balance.`,
        previousBalance: balanceBefore,
        amountDeducted: amount,
        newBalance: balanceAfter,
      });
    }

    if (action === 'refund') {
      // Validate refund
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid refund amount' },
          { status: 400 }
        );
      }

      // Refund balance
      const balanceBefore = data.availableBalance;
      const balanceAfter = balanceBefore + amount;

      await docRef.update({
        availableBalance: balanceAfter,
        usedAmount: Math.max(0, data.usedAmount - amount),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Create transaction record
      await docRef.collection('transactions').add({
        type: 'refund',
        amount,
        balanceBefore,
        balanceAfter,
        description: `Refund${serviceName ? ` for ${serviceName}` : ''}`,
        invoiceNumber: invoiceNumber || null,
        bookingId: bookingId || null,
        serviceName: serviceName || null,
        staffName: staffName || null,
        notes: notes || 'Service cancelled - amount refunded',
        createdAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: 'Balance refunded successfully',
        previousBalance: balanceBefore,
        amountRefunded: amount,
        newBalance: balanceAfter,
      });
    }

    if (action === 'updateStatus') {
      const { status } = body;
      
      if (!['active', 'inactive', 'expired'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }

      await docRef.update({
        status,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: 'Status updated successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating membership wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update membership wallet' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/membership-wallets/[id]
 * Deactivate membership wallet
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const docRef = adminDb.collection(Collections.MEMBERSHIP_WALLETS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Membership wallet not found' },
        { status: 404 }
      );
    }

    await docRef.update({
      status: 'inactive',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Membership wallet deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating membership wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate membership wallet' },
      { status: 500 }
    );
  }
}

