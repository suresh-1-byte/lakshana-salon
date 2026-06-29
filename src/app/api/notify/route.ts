// Admin sends a manual push notification to all users
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMsg } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { title, body, url } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: 'title and body required' }, { status: 400 });
    }

    const tokensSnap = await adminDb.collection('fcm_tokens').get();
    const tokens = tokensSnap.docs.map((d) => d.data().token as string).filter(Boolean);

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

    return NextResponse.json({
      success: true,
      sent: result.successCount,
      failed: result.failureCount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
