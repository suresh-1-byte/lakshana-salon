// ═══════════════════════════════════════════════════════
//  Daily Report API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyReport } from '@/lib/api/reports';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const report = await generateDailyReport(date);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily report' },
      { status: 500 }
    );
  }
}
