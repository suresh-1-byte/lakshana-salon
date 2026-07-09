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
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Check if Firebase is initialized
    const db = getAdminDb();
    if (!db) {
      // Firebase not configured - return success to avoid blocking user experience
      return NextResponse.json({ 
        success: true,
        message: 'Push notifications not configured on server',
        skipped: true
      });
    }

    // Use token as doc ID to avoid duplicates
    await adminDb.collection('fcm_tokens').doc(token).set({
      token,
      email: email || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Token saved successfully'
    });
  } catch (err) {
    // Return success to avoid blocking user experience
    return NextResponse.json({ 
      success: true,
      message: 'Token registration skipped',
      error: err instanceof Error ? err.message : String(err)
    });
  }
}
