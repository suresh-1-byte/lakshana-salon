import { NextRequest, NextResponse } from 'next/server';
import { adminDb, getAdminDb } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Save FCM token from browser
export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();
    
    if (!token) {
      console.error('[FCM Token] No token provided in request');
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Check if Firebase is initialized
    const db = getAdminDb();
    if (!db) {
      console.error('[FCM Token] Firebase Admin not initialized');
      return NextResponse.json({ 
        error: 'Firebase not configured',
        details: 'Server-side Firebase credentials missing'
      }, { status: 500 });
    }

    console.log('[FCM Token] Saving token to Firestore:', token.substring(0, 20) + '...');

    // Use token as doc ID to avoid duplicates
    await adminDb.collection('fcm_tokens').doc(token).set({
      token,
      email: email || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('[FCM Token] Successfully saved token' + (email ? ' with email' : ''));
    return NextResponse.json({ 
      success: true,
      message: 'Token saved successfully'
    });
  } catch (err) {
    console.error('[FCM Token] Error saving token:', err);
    return NextResponse.json({ 
      error: 'Server error',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
