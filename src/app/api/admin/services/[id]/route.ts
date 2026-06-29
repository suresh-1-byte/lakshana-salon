import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    const fields = ['name', 'description', 'categoryId', 'categoryName', 'duration', 'memberPrice', 'nonMemberPrice', 'isFeatured', 'isActive'];
    fields.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });
    await adminDb.collection(Collections.SERVICES).doc(id).update(updateData);
    await logActivity('service_update', `Service updated: ${id}`);
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
    await adminDb.collection(Collections.SERVICES).doc(id).delete();
    await logActivity('service_delete', `Service deleted: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
