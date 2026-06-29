import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    const fields = ['code', 'description', 'discountType', 'discountValue', 'minOrderAmount', 'maxUses', 'expiresAt', 'isActive'];
    fields.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });
    if (body.code) updateData.code = body.code.toUpperCase();
    await adminDb.collection(Collections.COUPONS).doc(id).update(updateData);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await adminDb.collection(Collections.COUPONS).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
