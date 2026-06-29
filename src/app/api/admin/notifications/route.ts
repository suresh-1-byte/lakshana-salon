import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMsg, Collections, FieldValue, logActivity } from '@/lib/firebase-admin';
import { Resend } from 'resend';

export async function GET() {
  try {
    const snap = await adminDb
      .collection(Collections.NOTIFICATIONS)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
      sentAt: d.data().sentAt?.toDate?.()?.toISOString() ?? d.data().sentAt,
    }));

    return NextResponse.json({ success: true, data: notifications });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: msgBody, types = ['push'], targetUrl = '/', email, scheduledAt } = body;

    if (!title || !msgBody) {
      return NextResponse.json({ error: 'Title and body required' }, { status: 400 });
    }

    // Create notification record first
    const ref = await adminDb.collection(Collections.NOTIFICATIONS).add({
      title,
      body: msgBody,
      type: types,
      status: scheduledAt ? 'scheduled' : 'draft',
      targetUrl,
      scheduledAt: scheduledAt || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    // If not scheduled, send immediately
    if (!scheduledAt) {
      const results: Record<string, unknown> = {};

      // Push notification
      if (types.includes('push')) {
        const tokensSnap = await adminDb.collection('fcm_tokens').get();
        const tokens = tokensSnap.docs.map(d => d.data().token as string).filter(Boolean);

        let successCount = 0;
        let failureCount = 0;

        if (tokens.length > 0) {
          const result = await adminMsg.sendEachForMulticast({
            tokens,
            notification: { title, body: msgBody },
            data: { url: targetUrl },
            webpush: { fcmOptions: { link: targetUrl } },
          });
          successCount = result.successCount;
          failureCount = result.failureCount;
        }

        results.push = { sent: successCount, failed: failureCount, total: tokens.length };
      }

      // Email notification
      if (types.includes('email')) {
        try {
          const settingsDoc = await adminDb.collection(Collections.SETTINGS).doc('salon').get();
          const apiKey = settingsDoc.data()?.resendApiKey || process.env.RESEND_API_KEY;

          if (apiKey) {
            const resend = new Resend(apiKey);
            const salonName = settingsDoc.data()?.salonName || 'Lakshana Beauty Salon';

            // Get all subscribed emails from fcm_tokens collection
            const tokensSnap = await adminDb.collection('fcm_tokens').get();
            const subscribedEmails = tokensSnap.docs
              .map(d => d.data().email as string)
              .filter(Boolean); // Remove null/undefined values

            // If email parameter is provided, add it to the list
            let emailList = [...subscribedEmails];
            if (email) {
              const additionalEmails = Array.isArray(email) ? email : [email];
              emailList = [...new Set([...emailList, ...additionalEmails])]; // Remove duplicates
            }

            if (emailList.length > 0) {
              await resend.emails.send({
                from: `${salonName} <notifications@lakshanabeautysalon.in>`,
                to: emailList,
                subject: title,
                html: `
                  <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDF8F5; padding: 40px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #D4447A; font-size: 28px; margin: 0;">${salonName}</h1>
                      <div style="height: 2px; background: linear-gradient(90deg, transparent, #D4447A, transparent); margin: 15px 0;"></div>
                    </div>
                    <h2 style="color: #2D1B25; font-size: 22px;">${title}</h2>
                    <p style="color: #7B4F62; line-height: 1.8; font-size: 16px;">${msgBody}</p>
                    <div style="margin-top: 30px; padding: 20px; background: rgba(212,68,122,0.06); border-left: 3px solid #D4447A; border-radius: 4px;">
                      <p style="margin: 0; color: #D4447A; font-size: 14px;">Lakshana Premier Beauty Salon, Nolambur, Chennai</p>
                    </div>
                  </div>
                `,
              });
              results.email = { success: true, sent: emailList.length };
            } else {
              results.email = { success: false, error: 'No subscribed emails found' };
            }
          }
        } catch (emailErr) {
          results.email = { error: String(emailErr) };
        }
      }

      // Telegram notification
      if (types.includes('telegram')) {
        try {
          const settingsDoc = await adminDb.collection(Collections.SETTINGS).doc('salon').get();
          const botToken = settingsDoc.data()?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
          const chatId = settingsDoc.data()?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

          if (botToken && chatId) {
            const telegramRes = await fetch(
              `https://api.telegram.org/bot${botToken}/sendMessage`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `*${title}*\n\n${msgBody}`,
                  parse_mode: 'Markdown',
                }),
              }
            );
            results.telegram = telegramRes.ok ? { success: true } : { error: 'Telegram send failed' };
          }
        } catch (tgErr) {
          results.telegram = { error: String(tgErr) };
        }
      }

      // Update notification status
      await ref.update({
        status: 'sent',
        sentAt: FieldValue.serverTimestamp(),
        ...results,
      });

      await logActivity('notification_sent', `Notification sent: ${title}`, { types });

      return NextResponse.json({ success: true, id: ref.id, results });
    }

    return NextResponse.json({ success: true, id: ref.id, status: 'scheduled' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
