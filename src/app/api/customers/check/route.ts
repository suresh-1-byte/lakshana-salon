import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Check if customer exists by phone number
 * Returns minimal data needed for booking form (whether DOB exists)
 * Does NOT expose full customer data to public endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-()]/g, '');

    // Check if customer exists
    const customerSnap = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('phone', '==', normalizedPhone)
      .limit(1)
      .get();

    if (customerSnap.empty) {
      return NextResponse.json({
        exists: false,
        hasDateOfBirth: false,
        isFirstTime: true,
      });
    }

    const customerData = customerSnap.docs[0].data();
    
    // Check if customer has an active package
    const packageSnap = await adminDb
      .collection(Collections.CUSTOMER_PACKAGES)
      .where('customerId', '==', customerSnap.docs[0].id)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    const hasActivePackage = !packageSnap.empty;
    const packageBalance = hasActivePackage ? packageSnap.docs[0].data().availableBalance : 0;

    return NextResponse.json({
      exists: true,
      hasDateOfBirth: !!customerData.dateOfBirth,
      isFirstTime: false,
      customerId: customerSnap.docs[0].id,
      customerName: customerData.name || '',
      hasActivePackage,
      packageBalance,
    });
  } catch (error) {
    console.error('Customer check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
