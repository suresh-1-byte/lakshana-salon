import { NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/cms/reviews
 * Public endpoint — returns approved reviews for website testimonials section.
 */
export async function GET() {
  try {
    // Filter + sort in memory: where() + orderBy() on different fields
    // would need a composite Firestore index.
    const snap = await adminDb
      .collection(Collections.REVIEWS)
      .where('status', '==', 'approved')
      .get();

    const docs = snap.docs
      .sort((a: any, b: any) =>
        (b.data().createdAt?.toMillis?.() || 0) - (a.data().createdAt?.toMillis?.() || 0)
      )
      .slice(0, 20);

    const reviews = docs.map((d: any) => ({
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
