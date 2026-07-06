// ═══════════════════════════════════════════════════════
//  Daily Report API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyReport, exportDailyReportToExcel } from '@/lib/api/reports';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/reports/daily?date=2025-01-07
 * Generate daily report
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const format = searchParams.get('format') || 'json'; // json | excel

    const report = await generateDailyReport(date);

    // Return Excel format
    if (format === 'excel') {
      const buffer = await exportDailyReportToExcel(report);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="daily-report-${report.date}.xlsx"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Daily report API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate daily report' },
      { status: 500 }
    );
  }
}
