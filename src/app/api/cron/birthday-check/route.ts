// ═══════════════════════════════════════════════════════
//  Birthday Check Cron Job API
// ═══════════════════════════════════════════════════════
// This endpoint should be called daily at 9:00 AM
// Configure via Vercel Cron, GitHub Actions, or external cron service

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Call the Supabase function to create birthday notifications
    const { data, error } = await supabase.rpc('create_birthday_notifications');

    if (error) {
      console.error('[Birthday Cron] Error:', error);
      throw error;
    }

    const notificationsCreated = data || 0;
    console.log(`[Birthday Cron] Created ${notificationsCreated} birthday notifications`);

    // Get statistics
    const { data: stats } = await supabase
      .from('birthday_notifications')
      .select('status', { count: 'exact', head: true })
      .eq('status', 'pending');

    const pendingCount = stats || 0;

    return NextResponse.json({
      success: true,
      notificationsCreated,
      pendingTotal: pendingCount,
      timestamp: new Date().toISOString(),
      message: `Birthday check completed. Created ${notificationsCreated} new notifications.`,
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
