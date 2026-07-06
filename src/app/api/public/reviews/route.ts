import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * POST /api/public/reviews
 * Public endpoint for customers to submit reviews via QR code
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, rating, comment, service, source } = body;

    // Validation
    if (!customerName?.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!comment?.trim()) {
      return NextResponse.json({ error: 'Review comment is required' }, { status: 400 });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Create review document
    const reviewData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone?.trim() || '',
      rating,
      comment: comment.trim(),
      service: service?.trim() || '',
      source: source || 'qr_scan',
      status: 'pending', // Always pending for public submissions
      isFeatured: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(Collections.REVIEWS).add(reviewData);

    return NextResponse.json({
      success: true,
      reviewId: docRef.id,
      message: 'Review submitted successfully',
    }, { status: 201 });

  } catch (err) {
    console.error('Public review submission error:', err);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
