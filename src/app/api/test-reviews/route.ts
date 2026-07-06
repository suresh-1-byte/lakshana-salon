import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Try to fetch reviews without any ordering (to avoid index requirement)
    const snap = await adminDb.collection('reviews').limit(10).get();
    
    const reviews = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ 
      success: true, 
      count: reviews.length,
      reviews: reviews 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      code: err.code 
    }, { status: 500 });
  }
}
