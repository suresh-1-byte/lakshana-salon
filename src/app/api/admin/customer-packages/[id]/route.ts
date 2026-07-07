import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Fetch single package with full details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id;
    const packageDoc = await adminDb.collection(Collections.CUSTOMER_PACKAGES).doc(packageId).get();

    if (!packageDoc.exists) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const data = packageDoc.data();

    // Fetch customer details
    let customer: any = {};
    if (data?.customerId) {
      const customerDoc = await adminDb.collection(Collections.CUSTOMERS).doc(data.customerId).get();
      if (customerDoc.exists) {
        customer = {
          id: customerDoc.id,
          ...customerDoc.data(),
        };
      }
    }

    // Fetch transactions
    const transactionsSnap = await adminDb
      .collection(Collections.CUSTOMER_PACKAGES)
      .doc(packageId)
      .collection('transactions')
      .orderBy('createdAt', 'desc')
      .get();

    const transactions = transactionsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));

    return NextResponse.json({
      success: true,
      package: {
        id: packageDoc.id,
        ...data,
        customer,
        transactions,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('Fetch package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update package (e.g., add balance, change status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id;
    const body = await req.json();
    const { action, amount, notes, status } = body;

    const packageRef = adminDb.collection(Collections.CUSTOMER_PACKAGES).doc(packageId);
    const packageDoc = await packageRef.get();

    if (!packageDoc.exists) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const currentData = packageDoc.data();

    // Handle different actions
    if (action === 'add_balance' && amount && amount > 0) {
      // Add balance to existing package
      const newBalance = (currentData?.availableBalance || 0) + Number(amount);
      const newTotal = (currentData?.totalAmount || 0) + Number(amount);

      await packageRef.update({
        totalAmount: newTotal,
        availableBalance: newBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Record transaction
      await packageRef.collection('transactions').add({
        type: 'credit',
        amount: Number(amount),
        balanceBefore: currentData?.availableBalance || 0,
        balanceAfter: newBalance,
        description: 'Balance added',
        notes: notes || 'Admin added balance',
        createdAt: FieldValue.serverTimestamp(),
      });

      await logActivity('package_balance_added', {
        entityType: 'customer_package',
        entityId: packageId,
        amount,
      });

      return NextResponse.json({ success: true, newBalance });
    }

    if (action === 'change_status' && status) {
      await packageRef.update({
        status,
        updatedAt: FieldValue.serverTimestamp(),
      });

      await logActivity('package_status_changed', {
        entityType: 'customer_package',
        entityId: packageId,
        newStatus: status,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Deactivate package
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id;
    const packageRef = adminDb.collection(Collections.CUSTOMER_PACKAGES).doc(packageId);
    const packageDoc = await packageRef.get();

    if (!packageDoc.exists) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Mark as inactive instead of deleting
    await packageRef.update({
      status: 'inactive',
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('package_deactivated', {
      entityType: 'customer_package',
      entityId: packageId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
