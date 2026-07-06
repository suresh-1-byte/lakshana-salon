// ═══════════════════════════════════════════════════════
//  Birthdays API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  getBirthdayStatistics,
  getPendingBirthdayNotifications,
  sendBirthdayOffer,
} from '@/lib/api/birthday-automation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'statistics') {
      const stats = await getBirthdayStatistics();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    if (action === 'pending-notifications') {
      const notifications = await getPendingBirthdayNotifications();
      return NextResponse.json({
        success: true,
        notifications,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching birthday data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch birthday data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerId } = body;

    if (action === 'send-offer' && customerId) {
      const result = await sendBirthdayOffer(customerId);
      return NextResponse.json({
        success: result.success,
        message: result.message,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error sending birthday offer:', error);
    return NextResponse.json(
      { error: 'Failed to send birthday offer' },
      { status: 500 }
    );
  }
}
