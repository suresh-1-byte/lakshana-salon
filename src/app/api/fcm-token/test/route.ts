import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getApp, getApps } from 'firebase-admin/app';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Diagnostic endpoint to check Firebase connection and FCM tokens
export async function GET() {
  try {
    // Check if Firebase Admin app is initialized
    const apps = getApps();
    const appInitialized = apps.length > 0;
    
    const db = getAdminDb();
    
    if (!db) {
      return NextResponse.json({
        error: 'Firebase Admin not initialized',
        details: 'Check if Firebase credentials are properly set in environment variables',
        appInitialized,
        env: {
          hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
          hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
          hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        }
      }, { status: 500 });
    }

    // Firebase Admin is initialized, now try to query
    let tokenCount = 0;
    let queryError = null;
    
    try {
      const tokensSnap = await db.collection('fcm_tokens').get();
      tokenCount = tokensSnap.size;
    } catch (queryErr) {
      queryError = queryErr instanceof Error ? queryErr.message : String(queryErr);
    }

    return NextResponse.json({
      success: !queryError,
      firebaseConnected: true,
      appInitialized,
      tokenCount,
      queryError,
      message: queryError 
        ? `Firebase connected but query failed: ${queryError}`
        : tokenCount === 0 
          ? 'No FCM tokens found in database' 
          : `Found ${tokenCount} FCM token(s)`,
    });
  } catch (err) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 });
  }
}
