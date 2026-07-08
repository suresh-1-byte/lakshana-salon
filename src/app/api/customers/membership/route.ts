import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/customers/membership?phone=xxx  or  ?customerId=xxx
 * Check if customer has active membership
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const customerId = searchParams.get('customerId');

    if (!phone && !customerId) {
      return NextResponse.json(
        { success: false, error: 'Phone number or customer ID required' },
        { status: 400 }
      );
    }

    let customerIdToUse = customerId;

    // If phone provided, find customer first
    if (phone && !customerId) {
      const customerSnap = await adminDb
        .collection(Collections.CUSTOMERS)
        .where('phone', '==', phone)
        .limit(1)
        .get();

      if (customerSnap.empty) {
        return NextResponse.json({
          success: true,
          hasActiveMembership: false,
          message: 'Customer not found',
        });
      }

      customerIdToUse = customerSnap.docs[0].id;
    }

    // Check for active membership
    const membershipSnap = await adminDb
      .collection(Collections.MEMBERSHIP_WALLETS)
      .where('customerId', '==', customerIdToUse)
      .where('status', '==', 'active')
      .get();

    if (membershipSnap.empty) {
      return NextResponse.json({
        success: true,
        hasActiveMembership: false,
        message: 'No active membership found',
      });
    }

    // Get membership with highest balance
    const memberships = membershipSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const activeMembership = memberships.reduce((prev, current) =>
      (current.availableBalance > prev.availableBalance) ? current : prev
    );

    return NextResponse.json({
      success: true,
      hasActiveMembership: true,
      membership: {
        id: activeMembership.id,
        membershipId: activeMembership.membershipId,
        packageName: activeMembership.packageName,
        totalAmount: activeMembership.totalAmount,
        availableBalance: activeMembership.availableBalance,
        usedAmount: activeMembership.usedAmount,
        expiryDate: activeMembership.expiryDate?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error checking membership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check membership' },
      { status: 500 }
    );
  }
}

