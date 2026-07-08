import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, Timestamp } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/membership-wallets
 * Get all membership wallets with filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customerId') || '';

    let query = adminDb.collection(Collections.MEMBERSHIP_WALLETS) as any;

    // Filter by customer ID if provided
    if (customerId) {
      query = query.where('customerId', '==', customerId);
    }

    // Filter by status if provided
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        memberships: [],
      });
    }

    let memberships = await Promise.all(
      snapshot.docs.map(async (doc: any) => {
        const data = doc.data();
        
        // Get customer details
        let customerData = null;
        if (data.customerId) {
          const customerDoc = await adminDb
            .collection(Collections.CUSTOMERS)
            .doc(data.customerId)
            .get();
          
          if (customerDoc.exists) {
            customerData = {
              name: customerDoc.data()?.name || '',
              phone: customerDoc.data()?.phone || '',
              email: customerDoc.data()?.email || '',
            };
          }
        }

        // Get transactions
        const transactionsSnap = await adminDb
          .collection(Collections.MEMBERSHIP_WALLETS)
          .doc(doc.id)
          .collection('transactions')
          .orderBy('createdAt', 'desc')
          .get();

        const transactions = transactionsSnap.docs.map((txn: any) => ({
          id: txn.id,
          ...txn.data(),
          createdAt: txn.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }));

        return {
          id: doc.id,
          ...data,
          customer: customerData,
          transactions,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          expiryDate: data.expiryDate?.toDate?.()?.toISOString() || null,
        };
      })
    );

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      memberships = memberships.filter((m: any) =>
        m.customer?.name?.toLowerCase().includes(searchLower) ||
        m.customer?.phone?.includes(search) ||
        m.membershipId?.toLowerCase().includes(searchLower) ||
        m.packageName?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      memberships,
    });
  } catch (error) {
    console.error('Error fetching membership wallets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch membership wallets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/membership-wallets
 * Create a new membership wallet
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      customerName,
      customerPhone,
      packageName,
      totalAmount,
      validityMonths = 12,
      notes = '',
    } = body;

    // Validation with detailed error messages
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required. Please select a customer.' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid membership amount greater than ₹0.' },
        { status: 400 }
      );
    }

    if (totalAmount > 1000000) {
      return NextResponse.json(
        { success: false, error: 'Membership amount cannot exceed ₹10,00,000. Please contact administrator for higher amounts.' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customerDoc = await adminDb
      .collection(Collections.CUSTOMERS)
      .doc(customerId)
      .get();

    if (!customerDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Customer not found in database. Please refresh and try again.' },
        { status: 404 }
      );
    }

    // Generate membership ID
    const timestamp = Date.now();
    const membershipId = `MEM${timestamp.toString().slice(-8)}`;

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

    // Create membership wallet
    const membershipData = {
      membershipId,
      customerId,
      customerName,
      customerPhone,
      packageName: packageName || 'Prepaid Membership Package',
      totalAmount,
      availableBalance: totalAmount,
      usedAmount: 0,
      status: 'active',
      startDate: FieldValue.serverTimestamp(),
      expiryDate: Timestamp.fromDate(expiryDate),
      notes,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection(Collections.MEMBERSHIP_WALLETS)
      .add(membershipData);

    // Create initial transaction
    await docRef.collection('transactions').add({
      type: 'credit',
      amount: totalAmount,
      balanceBefore: 0,
      balanceAfter: totalAmount,
      description: 'Membership package purchased',
      notes: notes || 'Initial membership credit',
      invoiceNumber: null,
      bookingId: null,
      serviceName: null,
      staffName: null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Membership created successfully!',
      membershipId: docRef.id,
      membership: {
        id: docRef.id,
        ...membershipData,
      },
    });
  } catch (error) {
    console.error('Error creating membership wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while creating membership. Please try again or contact support.' },
      { status: 500 }
    );
  }
}

