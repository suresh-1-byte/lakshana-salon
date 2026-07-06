// Admin sends a manual push notification to all users
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMsg } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    const { title, body, url } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: 'title and body required' }, { status: 400 });
    }

    const tokensSnap = await adminDb.collection('fcm_tokens').get();
    const tokenDocs = tokensSnap.docs.map((d: any) => ({ id: d.id, token: d.data().token as string }));
    const tokens = tokenDocs.map(t => t.token).filter(Boolean);

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const result = await adminMsg.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: { url: url || '/' },
      webpush: {
        fcmOptions: { link: url || '/' },
      },
    });

    // Remove invalid tokens (those that failed permanently)
    const invalidTokenIds: string[] = [];
    result.responses.forEach((response: any, idx) => {
      if (!response.success) {
        const errorCode = (response.error as any)?.code;
        // Remove tokens with permanent errors
        if (errorCode === 'messaging/invalid-registration-token' || 
            errorCode === 'messaging/registration-token-not-registered') {
          invalidTokenIds.push(tokenDocs[idx].id);
          console.log(`[Notify] Removing invalid token: ${tokenDocs[idx].token.substring(0, 20)}...`);
        }
      }
    });

    // Delete invalid tokens from database
    if (invalidTokenIds.length > 0) {
      const batch = adminDb.batch();
      for (const id of invalidTokenIds) {
        batch.delete(adminDb.collection('fcm_tokens').doc(id));
      }
      await batch.commit();
      console.log(`[Notify] Cleaned up ${invalidTokenIds.length} invalid tokens`);
    }

    return NextResponse.json({
      success: true,
      sent: result.successCount,
      failed: result.failureCount,
      cleaned: invalidTokenIds.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
