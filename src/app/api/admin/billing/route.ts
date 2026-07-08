import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity, upsertCustomer } from '@/lib/firebase-admin';
import { invoiceEmail } from '@/lib/email-templates';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


function generateInvoiceNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LP${yy}${mm}${rand}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const snap = await adminDb
      .collection(Collections.BILLING)
      .orderBy('createdAt', 'desc')
      .get();

    let bills = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));

    if (search) {
      const q = search.toLowerCase();
      bills = bills.filter((b: any) =>
        (b as any).customerName?.toLowerCase().includes(q) ||
        (b as any).customerPhone?.includes(q) ||
        (b as any).invoiceNumber?.toLowerCase().includes(q)
      );
    }

    const total = bills.length;
    const paginated = bills.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { total, page, limit, hasMore: page * limit < total },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName, customerPhone, customerEmail,
      items, discount = 0, tax = 0, paymentMethod = 'cash',
      notes = '', membershipWalletId, useMembershipWallet = false,
      membershipDiscountAmount = 0, membershipDiscountPercentage = 0,
      membershipType = '', membershipId = '',
    } = body;

    if (!customerName || !customerPhone || !items?.length) {
      return NextResponse.json({ error: 'Customer details and items required' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
      item.total = itemTotal;
      return sum + itemTotal;
    }, 0);

    // Total discount includes membership discount + additional discount
    const totalDiscount = membershipDiscountAmount + discount;
    const total = subtotal - totalDiscount + tax;
    const invoiceNumber = generateInvoiceNumber();

    // Handle membership wallet payment
    let membershipDeducted = false;
    let membershipAmount = 0;
    let finalPaymentMethod = paymentMethod;

    if (useMembershipWallet && membershipWalletId) {
      // Deduct directly from membership wallet using admin SDK
      try {
        const membershipRef = adminDb.collection(Collections.MEMBERSHIP_WALLETS).doc(membershipWalletId);
        const membershipDoc = await membershipRef.get();

        if (!membershipDoc.exists) {
          return NextResponse.json({ 
            success: false,
            error: 'Membership wallet not found' 
          }, { status: 404 });
        }

        const membershipData = membershipDoc.data()!;

        // Validate balance
        if (membershipData.availableBalance < total) {
          const shortfall = total - membershipData.availableBalance;
          return NextResponse.json({
            success: false,
            error: 'Insufficient Membership Balance',
            message: `Required: ₹${total.toLocaleString('en-IN')}\nAvailable: ₹${membershipData.availableBalance.toLocaleString('en-IN')}\nShortfall: ₹${shortfall.toLocaleString('en-IN')}`,
            required: total,
            available: membershipData.availableBalance,
            shortfall: shortfall,
          }, { status: 400 });
        }

        // Deduct balance
        const balanceBefore = membershipData.availableBalance;
        const balanceAfter = balanceBefore - total;

        await membershipRef.update({
          availableBalance: balanceAfter,
          usedAmount: membershipData.usedAmount + total,
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Create transaction record
        await membershipRef.collection('transactions').add({
          type: 'debit',
          amount: total,
          balanceBefore,
          balanceAfter,
          description: `Service payment: ${items.map((i: any) => i.name).join(', ')}`,
          invoiceNumber,
          serviceName: items.map((i: any) => i.name).join(', '),
          notes: notes || `Bill payment via membership wallet`,
          createdAt: FieldValue.serverTimestamp(),
        });

        membershipDeducted = true;
        membershipAmount = total;
        finalPaymentMethod = 'membership';
      } catch (walletError) {
        console.error('Membership wallet deduction error:', walletError);
        return NextResponse.json({ 
          success: false,
          error: 'Failed to deduct from membership wallet',
          details: walletError instanceof Error ? walletError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Upsert customer profile
    const customerId = await upsertCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      services: items.filter((i: any) => i.type === 'service').map((i: any) => i.name),
    });

    // Auto-compute loyalty status
    const custDoc = await adminDb.collection(Collections.CUSTOMERS).doc(customerId).get();
    const totalSpent = (custDoc.data()?.totalSpent || 0);
    let loyaltyStatus = 'Bronze';
    if (totalSpent >= 50000)     loyaltyStatus = 'Platinum';
    else if (totalSpent >= 20000) loyaltyStatus = 'Gold';
    else if (totalSpent >= 5000)  loyaltyStatus = 'Silver';

    await adminDb.collection(Collections.CUSTOMERS).doc(customerId).update({ loyaltyStatus });

    // Create bill
    const billData: any = {
      invoiceNumber,
      customerId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      items,
      subtotal,
      discount: totalDiscount, // Include both membership and additional discount
      tax,
      total,
      paymentMethod: finalPaymentMethod,
      status: 'paid',
      notes,
      createdAt: FieldValue.serverTimestamp(),
    };

    // Add membership metadata if applicable
    if (membershipId || membershipWalletId) {
      billData.membershipId = membershipId;
      billData.membershipWalletId = membershipWalletId;
      billData.membershipType = membershipType;
      billData.membershipDiscountPercentage = membershipDiscountPercentage;
      billData.membershipDiscountAmount = membershipDiscountAmount;
    }

    // Add membership payment details if used
    if (membershipDeducted) {
      billData.membershipAmount = membershipAmount;
      billData.paidViaMembership = true;
    }

    const docRef = await adminDb.collection(Collections.BILLING).add(billData);

    await logActivity('billing_create', {
      message: `Bill created: ${invoiceNumber} for ${customerName}${membershipDeducted ? ' (Membership Wallet Payment)' : ''}`,
      invoiceNumber, 
      total, 
      customerId,
      entityType: 'billing',
      entityId: docRef.id
    });

    // Send invoice email if customer email exists and setting is on
    if (customerEmail) {
      try {
        const settingsDoc = await adminDb.collection(Collections.SETTINGS).doc('salon').get();
        const settings = settingsDoc.data() || {};
        if (settings.notificationSettings?.sendInvoiceEmail !== false) {
          const resendApiKey = settings.resendApiKey || process.env.RESEND_API_KEY;
          if (resendApiKey) {
            const { Resend } = await import('resend');
            const resend = new Resend(resendApiKey);
            const salonName = settings.salonName || 'Lakshana Premier Beauty Salon';
            await resend.emails.send({
              from: `${salonName} <billing@lakshanabeautysalon.in>`,
              to: [customerEmail],
              subject: `Invoice #${invoiceNumber} — ${salonName}`,
              html: invoiceEmail({
                customerName,
                invoiceNumber,
                items,
                subtotal,
                discount,
                tax,
                total,
                paymentMethod: finalPaymentMethod,
                salonName,
                salonPhone: settings.phone,
                salonEmail: settings.email,
                salonAddress: `${settings.address || ''}, ${settings.city || ''}`,
              }),
            });
          }
        }
      } catch (emailErr) {
        console.error('Invoice email error:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      invoiceNumber,
      total,
      customerId,
      membershipDeducted,
      message: membershipDeducted 
        ? `✅ Bill created and ₹${total.toLocaleString('en-IN')} deducted from membership wallet!`
        : '✅ Bill created successfully!',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Bill ID required' }, { status: 400 });
    }

    // Get bill details before deleting
    const billDoc = await adminDb.collection(Collections.BILLING).doc(id).get();
    
    if (!billDoc.exists) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const billData = billDoc.data()!;

    // If payment was made via membership wallet, refund the amount
    if (billData.paidViaMembership && billData.membershipWalletId) {
      try {
        const membershipRef = adminDb.collection(Collections.MEMBERSHIP_WALLETS).doc(billData.membershipWalletId);
        const membershipDoc = await membershipRef.get();

        if (membershipDoc.exists) {
          const membershipData = membershipDoc.data()!;
          const refundAmount = billData.membershipAmount || billData.total;

          // Refund balance
          const balanceBefore = membershipData.availableBalance;
          const balanceAfter = balanceBefore + refundAmount;

          await membershipRef.update({
            availableBalance: balanceAfter,
            usedAmount: Math.max(0, membershipData.usedAmount - refundAmount),
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Create refund transaction record
          await membershipRef.collection('transactions').add({
            type: 'credit',
            amount: refundAmount,
            balanceBefore,
            balanceAfter,
            description: `Refund for deleted bill: ${billData.invoiceNumber}`,
            invoiceNumber: billData.invoiceNumber,
            notes: 'Bill deleted - amount refunded to wallet',
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      } catch (refundError) {
        console.error('Refund error:', refundError);
        // Continue with deletion even if refund fails
      }
    }

    // Delete the bill
    await adminDb.collection(Collections.BILLING).doc(id).delete();

    await logActivity('billing_delete', {
      message: `Bill deleted: ${billData.invoiceNumber} for ${billData.customerName}`,
      invoiceNumber: billData.invoiceNumber,
      total: billData.total,
      entityType: 'billing',
      entityId: id,
    });

    return NextResponse.json({
      success: true,
      message: billData.paidViaMembership 
        ? '✅ Bill deleted and amount refunded to membership wallet'
        : '✅ Bill deleted successfully',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
