// ═══════════════════════════════════════════════════════
//  Birthday cron job (daily)
//  - Sends a birthday wish to customers whose birthday is today
//  - Sends a reminder 7 days before a birthday
//  Each customer gets each message at most once per birthday.
//
//  Scheduled by Vercel Cron (vercel.json), which sends
//  `Authorization: Bearer <CRON_SECRET>`. The admin can also trigger it
//  from the Birthday Reminders page (admin session). Access is enforced
//  in src/middleware.ts and again here.
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { sendTodaysBirthdayWishes, sendUpcomingBirthdayReminders } from '@/lib/api/birthdays';
import { requireCronOrAdmin } from '@/lib/server/request-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

async function run(request: NextRequest) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  try {
    const [wishes, reminders] = await Promise.all([
      sendTodaysBirthdayWishes(),
      sendUpcomingBirthdayReminders(7),
    ]);

    // Counts and error reasons only — no customer names or numbers in logs
    console.log('[birthday-cron]', JSON.stringify({ wishes, reminders }));

    return NextResponse.json({
      success: wishes.success && reminders.success,
      // Kept for the admin page, which shows `sent`
      sent: wishes.sent + reminders.sent,
      wishes,
      reminders,
    });
  } catch (error) {
    console.error('[birthday-cron] failed:', (error as Error)?.message);
    return NextResponse.json({ success: false, error: 'Birthday job failed' }, { status: 500 });
  }
}

export const GET = run;
export const POST = run;
