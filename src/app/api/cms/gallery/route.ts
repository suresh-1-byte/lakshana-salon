import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

/**
 * GET /api/cms/gallery?category=Hair
 * Public endpoint — returns approved/featured gallery images for website display.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const snap = await adminDb
      .collection(Collections.GALLERY)
      .orderBy('createdAt', 'desc')
      .limit(60)
      .get();

    let images = snap.docs.map(d => ({
      id:         d.id,
      url:        d.data().url,
      caption:    d.data().caption || '',
      category:   d.data().category,
      isFeatured: d.data().isFeatured || false,
    }));

    if (category && category !== 'All') {
      images = images.filter(img => img.category === category);
    }

    return NextResponse.json({ success: true, images }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err) {
    console.error('CMS gallery error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
