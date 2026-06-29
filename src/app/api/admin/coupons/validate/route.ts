import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';

/**
 * POST /api/admin/coupons/validate
 * Validates a coupon code and returns discount details.
 * Body: { code, orderAmount }
 */
export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount = 0 } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 });
    }

    const snap = await adminDb
      .collection(Collections.COUPONS)
      .where('code', '==', code.toUpperCase())
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid or inactive coupon code' });
    }

    const coupon = snap.docs[0].data();
    const couponId = snap.docs[0].id;

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' });
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount ₹${coupon.minOrderAmount} required`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    // Increment usage count
    await adminDb.collection(Collections.COUPONS).doc(couponId).update({
      usedCount: FieldValue.increment(1),
    });

    return NextResponse.json({
      valid: true,
      couponId,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    });
  } catch (err) {
    console.error('Coupon validate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
