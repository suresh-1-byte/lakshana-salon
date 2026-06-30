// Delete all FCM tokens from database
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function DELETE() {
  try {
    const tokensSnap = await adminDb.collection('fcm_tokens').get();
    
    if (tokensSnap.empty) {
      return NextResponse.json({ 
        success: true, 
        message: 'No tokens to delete', 
        deleted: 0 
      });
    }

    const batch = adminDb.batch();
    tokensSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`[Delete All] Deleted ${tokensSnap.size} FCM tokens`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${tokensSnap.size} tokens`,
      deleted: tokensSnap.size,
    });
  } catch (err) {
    console.error('[Delete All] Error:', err);
    return NextResponse.json({ 
      error: 'Server error',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
