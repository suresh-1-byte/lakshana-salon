import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Fetch all customer packages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    let query = adminDb.collection(Collections.CUSTOMER_PACKAGES).orderBy('createdAt', 'desc');

    if (customerId) {
      query = query.where('customerId', '==', customerId) as any;
    }

    if (status) {
      query = query.where('status', '==', status) as any;
    }

    const snap = await query.get();
    
    const packages = await Promise.all(
      snap.docs.map(async (doc: any) => {
        const data = doc.data();
        
        // Fetch customer details
        let customerData: any = {};
        if (data.customerId) {
          try {
            const customerDoc = await adminDb.collection(Collections.CUSTOMERS).doc(data.customerId).get();
            if (customerDoc.exists) {
              customerData = {
                name: customerDoc.data()?.name || '',
                phone: customerDoc.data()?.phone || '',
                email: customerDoc.data()?.email || '',
              };
            }
          } catch (err) {
            console.error('Error fetching customer:', err);
          }
        }

        // Fetch transaction history
        const transactionsSnap = await adminDb
          .collection(Collections.CUSTOMER_PACKAGES)
          .doc(doc.id)
          .collection('transactions')
          .orderBy('createdAt', 'desc')
          .get();

        const transactions = transactionsSnap.docs.map((txn: any) => ({
          id: txn.id,
          ...txn.data(),
          createdAt: txn.data().createdAt?.toDate?.()?.toISOString() ?? null,
        }));

        return {
          id: doc.id,
          ...data,
          customer: customerData,
          transactions,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error) {
    console.error('Fetch packages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new customer package
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, customerName, customerPhone, totalAmount, notes } = body;

    if (!customerId || !totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Customer ID and valid total amount are required' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customerDoc = await adminDb.collection(Collections.CUSTOMERS).doc(customerId).get();
    if (!customerDoc.exists) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if customer already has an active package
    const existingPackage = await adminDb
      .collection(Collections.CUSTOMER_PACKAGES)
      .where('customerId', '==', customerId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!existingPackage.empty) {
      return NextResponse.json(
        { error: 'Customer already has an active package' },
        { status: 409 }
      );
    }

    // Create package
    const packageRef = await adminDb.collection(Collections.CUSTOMER_PACKAGES).add({
      customerId,
      customerName: customerName || customerDoc.data()?.name || '',
      customerPhone: customerPhone || customerDoc.data()?.phone || '',
      totalAmount: Number(totalAmount),
      availableBalance: Number(totalAmount),
      usedAmount: 0,
      status: 'active',
      notes: notes || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create initial transaction record
    await packageRef.collection('transactions').add({
      type: 'credit',
      amount: Number(totalAmount),
      balanceBefore: 0,
      balanceAfter: Number(totalAmount),
      description: 'Package created',
      notes: notes || 'Initial package creation',
      createdAt: FieldValue.serverTimestamp(),
    });

    await logActivity('package_created', {
      entityType: 'customer_package',
      entityId: packageRef.id,
      customerId,
      customerName: customerName || customerDoc.data()?.name,
      totalAmount,
    });

    return NextResponse.json({
      success: true,
      packageId: packageRef.id,
    });
  } catch (error) {
    console.error('Create package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a customer package
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('id');

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Get package details
    const packageDoc = await adminDb.collection(Collections.CUSTOMER_PACKAGES).doc(packageId).get();

    if (!packageDoc.exists) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const packageData = packageDoc.data();

    // If package has been used, create a refund transaction
    if (packageData?.usedAmount && packageData.usedAmount > 0) {
      // Log refund transaction before deletion
      await packageDoc.ref.collection('transactions').add({
        type: 'refund',
        amount: packageData.availableBalance,
        balanceBefore: packageData.availableBalance,
        balanceAfter: 0,
        description: 'Package deleted - balance refunded',
        notes: `Package deleted. Used amount: ₹${packageData.usedAmount}, Refunded: ₹${packageData.availableBalance}`,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Delete all transactions
    const transactionsSnap = await packageDoc.ref.collection('transactions').get();
    const batch = adminDb.batch();
    transactionsSnap.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete the package
    await packageDoc.ref.delete();

    // Log activity
    await logActivity('package_deleted', {
      entityType: 'customer_package',
      entityId: packageId,
      customerId: packageData?.customerId,
      customerName: packageData?.customerName,
      totalAmount: packageData?.totalAmount,
      availableBalance: packageData?.availableBalance,
      usedAmount: packageData?.usedAmount,
    });

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
      refundAmount: packageData?.availableBalance || 0,
    });
  } catch (error) {
    console.error('Delete package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
