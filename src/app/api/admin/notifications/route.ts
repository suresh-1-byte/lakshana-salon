// ═══════════════════════════════════════════════════════
//  Notifications API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { notifyNewBooking } from '@/lib/api/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await notifyNewBooking(body);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
