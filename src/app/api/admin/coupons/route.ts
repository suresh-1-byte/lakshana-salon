import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await adminDb.collection(Collections.COUPONS).orderBy('createdAt', 'desc').get();
    const coupons = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));
    return NextResponse.json({ success: true, data: coupons });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: 'Code, type and value required' }, { status: 400 });
    }

    // Check unique code
    const existing = await adminDb.collection(Collections.COUPONS).where('code', '==', code.toUpperCase()).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }

    const ref = await adminDb.collection(Collections.COUPONS).add({
      code: code.toUpperCase(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      usedCount: 0,
      expiresAt: expiresAt || null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    await logActivity('coupon_create', `Coupon created: ${code}`);
    return NextResponse.json({ success: true, id: ref.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
