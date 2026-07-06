// ═══════════════════════════════════════════════════════
//  Birthday API - Send Wishes
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { sendBulkBirthdayWishes } from '@/lib/api/birthdays';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { customerIds } = await request.json();

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer IDs required' },
        { status: 400 }
      );
    }

    const result = await sendBulkBirthdayWishes(customerIds);

    return NextResponse.json({
      success: true,
      sent: result.sent,
    });
  } catch (error) {
    console.error('Error sending birthday wishes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
