// ═══════════════════════════════════════════════════════
//  Upcoming Birthdays API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingBirthdays } from '@/lib/api/birthdays';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/birthdays/upcoming?days=7
 * Get upcoming birthdays in the next N days
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const customers = await getUpcomingBirthdays(days);

    return NextResponse.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error('Upcoming birthdays API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upcoming birthdays' },
      { status: 500 }
    );
  }
}
