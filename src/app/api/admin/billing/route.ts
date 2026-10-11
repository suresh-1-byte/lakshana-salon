import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity, upsertCustomer } from '@/lib/firebase-admin';
import { invoiceEmail } from '@/lib/email-templates';
import { applyBillToCustomer, billCounts } from '@/lib/server/customer-stats';
import { cleanString, escapeHtml, isValidEmail, isValidPhone, nonNegativeNumber } from '@/lib/server/validation';

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
      paymentMethod = 'cash',
      membershipWalletId, useMembershipWallet = false,
      membershipDiscountPercentage = 0,
      membershipType = '', membershipId = '',
    } = body;

    // ── Validate input ──────────────────────────────────────
    const customerName = cleanString(body.customerName, 80);
    const customerPhone = cleanString(body.customerPhone, 20);
    const customerEmail = isValidEmail(body.customerEmail) ? cleanString(body.customerEmail, 254) : '';
    const notes = cleanString(body.notes, 1000);
    const discount = nonNegativeNumber(body.discount);
    const tax = nonNegativeNumber(body.tax);
    const membershipDiscountAmount = nonNegativeNumber(body.membershipDiscountAmount);

    if (customerName.length < 2 || !isValidPhone(customerPhone)) {
      return NextResponse.json({ error: 'Customer name and a valid 10-digit phone number are required' }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      return NextResponse.json({ error: 'Add between 1 and 50 items to the bill' }, { status: 400 });
    }

    const items: any[] = [];
    for (const raw of body.items) {
      const name = cleanString(raw?.name, 120);
      const quantity = Number(raw?.quantity);
      const unitPrice = nonNegativeNumber(raw?.unitPrice, NaN);
      const itemDiscount = nonNegativeNumber(raw?.discount);
      if (!name || !Number.isInteger(quantity) || quantity < 1 || quantity > 100 || !Number.isFinite(unitPrice)) {
        return NextResponse.json({ error: `Invalid bill item: ${name || 'unnamed item'}` }, { status: 400 });
      }
      const lineTotal = unitPrice * quantity - itemDiscount;
      if (lineTotal < 0) {
        return NextResponse.json({ error: `Discount is larger than the price for ${name}` }, { status: 400 });
      }
      items.push({
        ...raw,
        name,
        type: ['service', 'product', 'addon'].includes(raw?.type) ? raw.type : 'service',
        quantity,
        unitPrice,
        discount: itemDiscount,
        total: lineTotal,
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);

    // Total discount includes membership discount + additional discount
    const totalDiscount = membershipDiscountAmount + discount;
    const total = subtotal - totalDiscount + tax;
    if (total < 0) {
      return NextResponse.json({ error: 'Discounts cannot exceed the bill amount' }, { status: 400 });
    }
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

    // A paid bill is a visit: update the customer's visits, spending & loyalty tier
    await applyBillToCustomer(customerId, total, 1);

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
                customerName: escapeHtml(customerName),
                invoiceNumber,
                items: items.map((i: any) => ({ ...i, name: escapeHtml(i.name) })),
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

    // Take the bill back out of the customer's visits & spending
    if (billCounts(billData)) {
      try {
        await applyBillToCustomer(billData.customerId, Number(billData.total) || 0, -1);
      } catch (statsError) {
        console.error('Customer stats update failed after bill delete:', statsError);
      }
    }

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
