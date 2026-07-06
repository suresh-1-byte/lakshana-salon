import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = adminDb.collection(Collections.GALLERY).orderBy('createdAt', 'desc') as any;

    const snap = await query.get();
    let images = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));

    if (category && category !== 'All') {
      images = images.filter((img: any) => img.category === category);
    }

    return NextResponse.json({ success: true, data: images });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, caption, category, isFeatured = false, tags = [] } = body;

    if (!url || !category) {
      return NextResponse.json({ error: 'URL and category required' }, { status: 400 });
    }

    const ref = await adminDb.collection(Collections.GALLERY).add({
      url,
      caption: caption || '',
      category,
      isFeatured,
      tags,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity('gallery_add', `Image added to gallery: ${category}`);

    return NextResponse.json({ success: true, id: ref.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
