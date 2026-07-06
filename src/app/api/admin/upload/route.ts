import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, logActivity } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * POST /api/admin/upload
 * Accepts a base64-encoded image or a URL and stores it in Firestore gallery.
 * For production, wire this up to Firebase Storage or Cloudinary.
 * Currently accepts { url, caption, category, isFeatured } and proxies to gallery API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, caption, category, isFeatured = false } = body;

    if (!url) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    const { FieldValue } = await import('@/lib/firebase-admin').then(m => m);

    const ref = await adminDb.collection(Collections.GALLERY).add({
      url,
      caption: caption || '',
      category: category || 'Other',
      isFeatured,
      tags: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('gallery_add', `Image uploaded: ${category}`);

    return NextResponse.json({ success: true, id: ref.id, url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
