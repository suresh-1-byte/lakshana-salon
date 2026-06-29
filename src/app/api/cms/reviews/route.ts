import { NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

/**
 * GET /api/cms/reviews
 * Public endpoint — returns approved reviews for website testimonials section.
 */
export async function GET() {
  try {
    const snap = await adminDb
      .collection(Collections.REVIEWS)
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const reviews = snap.docs.map(d => ({
      id:           d.id,
      customerName: d.data().customerName,
      rating:       d.data().rating,
      comment:      d.data().comment,
      service:      d.data().service || '',
      isFeatured:   d.data().isFeatured || false,
      createdAt:    d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));

    return NextResponse.json({ success: true, reviews }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('CMS reviews error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
