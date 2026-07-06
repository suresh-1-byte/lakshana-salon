// ═══════════════════════════════════════════════════════
//  Today's Birthdays API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  getTodaysBirthdays,
  sendTodaysBirthdayWishes,
} from '@/lib/api/birthdays';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/birthdays/today
 * Get customers with birthday today
 */
export async function GET(request: NextRequest) {
  try {
    const customers = await getTodaysBirthdays();

    return NextResponse.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error('Today birthdays API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch birthdays' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/birthdays/today
 * Send birthday wishes to today's customers
 */
export async function POST(request: NextRequest) {
  try {
    const result = await sendTodaysBirthdayWishes();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Send birthday wishes API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send birthday wishes' },
      { status: 500 }
    );
  }
}
