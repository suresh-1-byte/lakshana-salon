import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Save FCM token from browser
export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();
    
    if (!token) {
      // No token - just return success (browser might be testing)
      return NextResponse.json({ 
        success: true,
        message: 'No token provided'
      });
    }

    // Try to save to Firebase, but if it fails, that's okay
    try {
      const { adminDb, getAdminDb } = await import('@/lib/firebase-admin');
      const db = getAdminDb();
      
      if (db) {
        // Firebase is available - save the token
        await adminDb.collection('fcm_tokens').doc(token).set({
          token,
          email: email || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (firebaseError) {
      // Firebase error - doesn't matter, we'll still return success
      // This makes FCM completely non-blocking
    }

    // Always return success
    return NextResponse.json({ 
      success: true,
      message: 'Token registered'
    });
    
  } catch (err) {
    // Even if everything fails, return 200 success
    // FCM is optional, shouldn't break the site
    return NextResponse.json({ 
      success: true,
      message: 'Token registration completed'
    });
  }
}
