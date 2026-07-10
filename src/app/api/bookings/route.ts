import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMsg, Collections, FieldValue, upsertCustomer } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// ── Themed email HTML ─────────────────────────────────────────────
function buildConfirmationEmail(data: {
  customerName: string;
  phone: string;
  services: Array<{ name: string; duration?: string; member?: string }>;
  bookingId: string;
  salonName: string;
  salonPhone: string;
  salonAddress: string;
}) {
  const { customerName, phone, services, bookingId, salonName, salonPhone, salonAddress } = data;
  const serviceRows = services.map(s => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid rgba(212,68,122,0.1);color:#2D1B25;font-size:13px;">${s.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid rgba(212,68,122,0.1);color:#7B4F62;font-size:13px;text-align:center;">${s.duration || '—'}</td>
      <td style="padding:10px 16px;border-bottom:1px solid rgba(212,68,122,0.1);color:#D4447A;font-size:13px;text-align:right;font-weight:600;">${s.member || '—'}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FDF8F5;font-family:Georgia,serif;">
  <div style="max-width:580px;margin:0 auto;background:#FDF8F5;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2D1B25 0%,#4A1F35 100%);padding:40px 40px 32px;text-align:center;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(212,68,122,0.2);border:2px solid rgba(212,68,122,0.4);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">💄</span>
      </div>
      <h1 style="margin:0;color:#E8A0B4;font-size:24px;font-weight:300;letter-spacing:0.08em;">${salonName}</h1>
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(212,68,122,0.6),transparent);margin:14px auto;width:200px;"></div>
      <p style="margin:0;color:rgba(232,160,180,0.6);font-size:10px;letter-spacing:0.4em;text-transform:uppercase;">Appointment Confirmation</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <p style="color:#D4447A;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 8px;">Booking Confirmed ✓</p>
      <h2 style="margin:0 0 16px;font-size:26px;font-weight:300;color:#2D1B25;">Hello, ${customerName}!</h2>
      <p style="color:#7B4F62;line-height:1.8;font-size:14px;margin:0 0 24px;">
        Your appointment request has been received. Our team will call you on
        <strong style="color:#2D1B25;">${phone}</strong> to confirm the date and time.
      </p>

      <!-- Services table -->
      <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(212,68,122,0.15);margin-bottom:24px;">
        <div style="background:linear-gradient(135deg,rgba(212,68,122,0.12),rgba(176,48,96,0.08));padding:12px 16px;">
          <p style="margin:0;color:#D4447A;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;font-weight:bold;">Services Requested</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:white;">
          <thead>
            <tr style="background:rgba(212,68,122,0.06);">
              <th style="padding:8px 16px;text-align:left;font-size:10px;color:#B89BAA;letter-spacing:0.2em;text-transform:uppercase;font-weight:normal;">Service</th>
              <th style="padding:8px 16px;text-align:center;font-size:10px;color:#B89BAA;letter-spacing:0.2em;text-transform:uppercase;font-weight:normal;">Duration</th>
              <th style="padding:8px 16px;text-align:right;font-size:10px;color:#B89BAA;letter-spacing:0.2em;text-transform:uppercase;font-weight:normal;">Price</th>
            </tr>
          </thead>
          <tbody>${serviceRows}</tbody>
        </table>
      </div>

      <!-- Reference -->
      <div style="background:rgba(212,68,122,0.05);border-left:3px solid #D4447A;border-radius:4px;padding:14px 16px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#B89BAA;">Booking Reference: <strong style="color:#2D1B25;font-family:monospace;">#${bookingId.slice(-6).toUpperCase()}</strong></p>
      </div>

      <!-- What's next -->
      <div style="background:white;border-radius:12px;padding:20px;border:1px solid rgba(212,68,122,0.12);margin-bottom:24px;">
        <p style="margin:0 0 12px;color:#D4447A;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;font-weight:bold;">What Happens Next</p>
        ${['Our team will call to confirm your slot', 'Arrive 5 minutes early for a relaxed experience', 'Let us know if you need to reschedule'].map((step, i) => `
          <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:8px;">
            <div style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#D4447A,#B03060);display:flex;align-items:center;justify-content:center;shrink:0;margin-top:1px;">
              <span style="color:white;font-size:10px;font-weight:bold;">${i + 1}</span>
            </div>
            <p style="margin:0;color:#7B4F62;font-size:13px;line-height:1.5;">${step}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#2D1B25;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 6px;color:#E8A0B4;font-size:13px;">${salonAddress}</p>
      <p style="margin:0 0 12px;color:rgba(232,160,180,0.6);font-size:12px;">${salonPhone}</p>
      <div style="height:1px;background:rgba(212,68,122,0.2);margin:12px 0;"></div>
      <p style="margin:0;color:rgba(232,160,180,0.4);font-size:11px;">
        © ${new Date().getFullYear()} ${salonName}. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ── Telegram message ──────────────────────────────────────────────
async function sendTelegram(botToken: string, chatId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
  } catch { /* non-fatal */ }
}

// ── POST /api/bookings ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, dateOfBirth, services } = body;

    if (!name || !phone || !email || !services?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save booking
    const docRef = await adminDb.collection('bookings').add({
      name, phone, email, services,
      dateOfBirth: dateOfBirth || null,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });

    // Upsert customer profile with DOB
    await upsertCustomer({ 
      name, 
      phone, 
      email, 
      dateOfBirth: dateOfBirth || null,
      services: services.map((s: any) => s.name) 
    });

    // Load salon settings (non-fatal if Firebase not configured)
    let settings: any = {};
    try {
      const snap = await adminDb.collection(Collections.SETTINGS).doc('salon').get();
      settings = snap.data() || {};
    } catch { /* use defaults */ }

    const salonName    = settings.salonName    || 'Lakshana Premier Beauty Salon';
    const salonPhone   = settings.phone        || '+91 90000 00000';
    const salonAddress = `${settings.address || ''}, ${settings.city || 'Nolambur'}, Chennai`;
    const notif        = settings.notificationSettings || {};

    // ── 1. Browser Push to admin ───────────────────────────────
    if (notif.pushOnBooking !== false) {
      try {
        const tokensSnap = await adminDb.collection('fcm_tokens').get();
        const tokens = tokensSnap.docs.map((d: any) => d.data().token as string).filter(Boolean);
        if (tokens.length > 0) {
          await adminMsg.sendEachForMulticast({
            tokens,
            notification: {
              title: '📅 New Booking Request!',
              body: `${name} booked ${services.length} service${services.length > 1 ? 's' : ''}`,
            },
            data: { bookingId: docRef.id, url: '/admin/bookings' },
            webpush: { fcmOptions: { link: '/admin/bookings' } },
          });
        }
      } catch { /* non-fatal */ }
    }

    // ── 2. Telegram alert to admin ─────────────────────────────
    if (notif.telegramOnBooking) {
      const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
      const chatId   = settings.telegramChatId   || process.env.TELEGRAM_CHAT_ID;
      if (botToken && chatId) {
        const serviceList = services.map((s: any) => `  • ${s.name}`).join('\n');
        await sendTelegram(botToken, chatId,
          `🌸 *New Appointment — ${salonName}*\n\n` +
          `👤 *Name:* ${name}\n` +
          `📱 *Phone:* ${phone}\n` +
          `📧 *Email:* ${email}\n\n` +
          `💄 *Services:*\n${serviceList}\n\n` +
          `🆔 Ref: \`${docRef.id.slice(-6).toUpperCase()}\`\n` +
          `🔗 [View in Admin](/admin/bookings)`
        );
      }
    }

    // ── 3. Confirmation email to customer ──────────────────────
    if (email) {
      try {
        const resendKey = settings.resendApiKey || process.env.RESEND_API_KEY;
        if (resendKey && !resendKey.includes('your_')) {
          const { Resend } = await import('resend');
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: `${salonName} <bookings@lakshanabeautysalon.in>`,
            to: [email],
            subject: `✅ Booking Confirmed — ${salonName}`,
            html: buildConfirmationEmail({
              customerName: name,
              phone,
              services,
              bookingId: docRef.id,
              salonName,
              salonPhone,
              salonAddress,
            }),
          });
        }
      } catch (emailErr) {
        console.error('Confirmation email error:', emailErr);
      }
    }

    // ── 4. Admin notification email ────────────────────────────
    if (notif.emailOnBooking !== false) {
      try {
        const resendKey = settings.resendApiKey || process.env.RESEND_API_KEY;
        // Use admin notification email from settings, fallback to env variable
        const adminEmail = settings.adminNotificationEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@lakshanabeautysalon.in';
        if (resendKey && !resendKey.includes('your_') && adminEmail) {
          const { Resend } = await import('resend');
          const resend = new Resend(resendKey);
          const serviceList = services.map((s: any) => `<li style="margin: 8px 0;">${s.name}</li>`).join('');
          await resend.emails.send({
            from: `${salonName} <bookings@lakshanabeautysalon.in>`,
            to: [adminEmail],
            subject: `🔔 New Booking: ${name} - ${services.length} Service(s)`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDF8F5; padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #D4447A; font-size: 28px; margin: 0;">${salonName}</h1>
                  <div style="height: 2px; background: linear-gradient(90deg, transparent, #D4447A, transparent); margin: 15px 0;"></div>
                </div>
                <h2 style="color: #2D1B25; font-size: 22px;">📅 New Booking Received</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 8px 0; color: #2D1B25;"><strong>Customer:</strong> ${name}</p>
                  <p style="margin: 8px 0; color: #2D1B25;"><strong>Phone:</strong> ${phone}</p>
                  <p style="margin: 8px 0; color: #2D1B25;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 8px 0; color: #2D1B25;"><strong>Booking ID:</strong> ${docRef.id.slice(-6).toUpperCase()}</p>
                </div>
                <div style="background: rgba(212,68,122,0.06); padding: 20px; border-radius: 8px; border-left: 3px solid #D4447A;">
                  <p style="margin: 0 0 10px 0; color: #2D1B25; font-weight: bold;">Services Requested:</p>
                  <ul style="margin: 0; padding-left: 20px; color: #7B4F62;">${serviceList}</ul>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://lakshanabeautysalon.in/admin/bookings" style="display: inline-block; background: linear-gradient(135deg, #D4447A, #B03060); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Admin Panel</a>
                </div>
              </div>
            `,
          });
        }
      } catch (adminEmailErr) {
        console.error('Admin notification email error:', adminEmailErr);
      }
    }

    return NextResponse.json({ success: true, bookingId: docRef.id });
  } catch (err) {
    console.error('Booking error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── GET /api/bookings ─────────────────────────────────────────────
export async function GET() {
  try {
    const snap = await adminDb
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const bookings = snap.docs.map((d: any) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        services: data.services || [],
        status: data.status || 'pending',
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ 
      bookings 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=20',
      },
    });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
