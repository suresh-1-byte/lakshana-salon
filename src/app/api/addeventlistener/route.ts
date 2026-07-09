// ═══════════════════════════════════════════════════════
//  FCM Event Listener API Route
//  Handles Firebase Cloud Messaging service worker events
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/addeventlistener
 * Handle FCM service worker event registration
 * This endpoint is called by the Firebase service worker
 */
export async function POST(request: NextRequest) {
  try {
    // Firebase Cloud Messaging event listener registration
    // Just acknowledge the request - the service worker handles the events
    return NextResponse.json({
      success: true,
      message: 'Event listener registered',
    });
  } catch (error: any) {
    console.error('Error in addEventListener:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to register event listener',
        details: error?.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/addeventlistener
 * Check event listener status
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    status: 'FCM event listener endpoint active',
  });
}
