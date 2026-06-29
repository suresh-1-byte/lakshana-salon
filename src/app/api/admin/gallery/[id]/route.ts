import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { caption, category, isFeatured, tags } = body;
    const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (caption !== undefined)    updateData.caption = caption;
    if (category)                 updateData.category = category;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (tags)                     updateData.tags = tags;
    await adminDb.collection(Collections.GALLERY).doc(id).update(updateData);
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
    await adminDb.collection(Collections.GALLERY).doc(id).delete();
    await logActivity('gallery_delete', `Image deleted: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
