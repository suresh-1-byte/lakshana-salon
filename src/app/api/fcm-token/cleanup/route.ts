// Clean up invalid FCM tokens from database
import { NextResponse } from 'next/server';
import { adminDb, adminMsg } from '@/lib/firebase-admin';

export async function POST() {
  try {
    const tokensSnap = await adminDb.collection('fcm_tokens').get();
    
    if (tokensSnap.empty) {
      return NextResponse.json({ success: true, message: 'No tokens to check', deleted: 0 });
    }

    const allTokens = tokensSnap.docs.map((d: any) => ({ 
      id: d.id, 
      token: d.data().token as string,
      email: d.data().email,
      createdAt: d.data().createdAt 
    }));

    console.log(`[Cleanup] Checking ${allTokens.length} tokens...`);

    // Test each token with a dry-run message
    const invalidTokens: string[] = [];
    
    for (const tokenDoc of allTokens) {
      try {
        // Try to send a test message (dry run)
        await adminMsg.send({
          token: tokenDoc.token,
          notification: {
            title: 'Test',
            body: 'Test',
          },
          data: { test: 'true' },
        }, true); // dry run = true, doesn't actually send
        
        console.log(`[Cleanup] ✅ Token valid: ${tokenDoc.token.substring(0, 20)}...`);
      } catch (err: any) {
        console.log(`[Cleanup] ❌ Token invalid: ${tokenDoc.token.substring(0, 20)}... - ${err.message}`);
        invalidTokens.push(tokenDoc.id);
      }
    }

    // Delete invalid tokens
    if (invalidTokens.length > 0) {
      const batch = adminDb.batch();
      for (const id of invalidTokens) {
        batch.delete(adminDb.collection('fcm_tokens').doc(id));
      }
      await batch.commit();
      console.log(`[Cleanup] Deleted ${invalidTokens.length} invalid tokens`);
    }

    return NextResponse.json({
      success: true,
      total: allTokens.length,
      valid: allTokens.length - invalidTokens.length,
      deleted: invalidTokens.length,
    });
  } catch (err) {
    console.error('[Cleanup] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
