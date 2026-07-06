// List all FCM tokens with details
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const tokensSnap = await adminDb.collection('fcm_tokens').get();
    
    const tokens = tokensSnap.docs.map((d: any) => ({
      id: d.id,
      token: d.data().token,
      email: d.data().email || null,
      createdAt: d.data().createdAt || null,
      updatedAt: d.data().updatedAt || null,
    }));

    return NextResponse.json({
      success: true,
      count: tokens.length,
      tokens,
    });
  } catch (err) {
    console.error('[List Tokens] Error:', err);
    return NextResponse.json({ 
      error: 'Server error',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
