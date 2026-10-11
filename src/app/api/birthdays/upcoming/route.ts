import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingBirthdays } from '@/lib/api/birthdays';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/birthdays/upcoming?days=7  (admin only — see middleware)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const birthdays = await getUpcomingBirthdays(days);

    return NextResponse.json(
      { success: true, count: birthdays.length, birthdays },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Upcoming birthdays API error:', (error as Error)?.message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upcoming birthdays' },
      { status: 500 }
    );
  }
}
