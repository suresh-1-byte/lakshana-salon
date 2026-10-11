// ═══════════════════════════════════════════════════════
//  Test birthday reminder (admin)
//  Sends a push notification to the admin's own registered devices
//  summarising upcoming birthdays. Nothing is sent to customers.
// ═══════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { adminMsg } from '@/lib/firebase-admin';
import { getUpcomingBirthdays } from '@/lib/api/birthdays';
import { getAdminPushTokens } from '@/lib/server/push';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    const birthdays = await getUpcomingBirthdays(7);
    const upcoming = birthdays.map(
      b => `${b.name || 'Customer'} (${b.daysUntilBirthday === 0 ? 'today' : `in ${b.daysUntilBirthday} day${b.daysUntilBirthday > 1 ? 's' : ''}`})`
    );

    const tokens = await getAdminPushTokens();

    if (tokens.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No admin devices are registered for push notifications. Allow notifications on the website while logged in to the admin panel first.',
        upcoming,
      }, { status: 400 });
    }

    const body = upcoming.length
      ? `${upcoming.length} birthday${upcoming.length > 1 ? 's' : ''} this week: ${upcoming.slice(0, 3).join(', ')}${upcoming.length > 3 ? '…' : ''}`
      : 'No customer birthdays in the next 7 days.';

    const result = await adminMsg.sendEachForMulticast({
      tokens,
      notification: { title: '🎂 Test birthday reminder', body },
      data: { url: '/admin/birthday-reminders' },
      webpush: { fcmOptions: { link: '/admin/birthday-reminders' } },
    });

    if (result.successCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Push notification could not be delivered to any registered device.',
      }, { status: 502 });
    }

    return NextResponse.json({ success: true, sent: result.successCount, upcoming });
  } catch (err) {
    console.error('Test birthday reminder error:', (err as Error)?.message);
    return NextResponse.json({ success: false, error: 'Failed to send test reminder' }, { status: 500 });
  }
}
