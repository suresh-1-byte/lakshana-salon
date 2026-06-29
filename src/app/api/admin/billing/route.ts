import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity, upsertCustomer } from '@/lib/firebase-admin';
import { invoiceEmail } from '@/lib/email-templates';

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

    let bills = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));

    if (search) {
      const q = search.toLowerCase();
      bills = bills.filter(b =>
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
      notes = '',
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

    const total = subtotal - discount + tax;
    const invoiceNumber = generateInvoiceNumber();

    // Upsert customer profile
    const customerId = await upsertCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      visitAmount: total,
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
    const ref = await adminDb.collection(Collections.BILLING).add({
      invoiceNumber,
      customerId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      items,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      status: 'paid',
      notes,
      createdAt: FieldValue.serverTimestamp(),
    });

    await logActivity('billing_create', `Bill created: ${invoiceNumber} for ${customerName}`, {
      invoiceNumber, total, customerId
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
                paymentMethod,
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
      id: ref.id,
      invoiceNumber,
      total,
      customerId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
