import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, isFeatured } = body;
    const updateData: Record<string, unknown> = {};
    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
      if (status === 'approved') updateData.approvedAt = FieldValue.serverTimestamp();
    }
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    await adminDb.collection(Collections.REVIEWS).doc(id).update(updateData);
    await logActivity('review_update', `Review ${status || 'updated'}: ${id}`);
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
    await adminDb.collection(Collections.REVIEWS).doc(id).delete();
    await logActivity('review_delete', `Review deleted: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
