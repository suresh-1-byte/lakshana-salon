// ═══════════════════════════════════════════════════════
//  Birthday Check Cron Job API - Firebase Implementation
// ═══════════════════════════════════════════════════════
// This endpoint should be called daily at 9:00 AM
// Configure via Vercel Cron, GitHub Actions, or external cron service

import { NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Birthday Cron] Starting daily birthday check...');

    // Get today's date
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    // Get all active customers with birthdays
    const customersSnapshot = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('status', '==', 'active')
      .get();

    let notificationsCreated = 0;

    // Check each customer's birthday
    for (const doc of customersSnapshot.docs) {
      const customer = doc.data();
      if (customer.dateOfBirth) {
        const dob = new Date(customer.dateOfBirth);
        const dobMonth = dob.getMonth() + 1;
        const dobDate = dob.getDate();

        // If birthday is today
        if (dobMonth === todayMonth && dobDate === todayDate) {
          // Create notification (you can implement notification system)
          console.log(`[Birthday Cron] Birthday today: ${customer.name}`);
          notificationsCreated++;
        }
      }
    }

    console.log(`[Birthday Cron] Found ${notificationsCreated} birthdays today`);

    return NextResponse.json({
      success: true,
      notificationsCreated,
      timestamp: new Date().toISOString(),
      message: `Birthday check completed. Found ${notificationsCreated} birthdays today.`,
    });
  } catch (error) {
    console.error('[Birthday Cron] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(req: Request) {
  return GET(req);
}
