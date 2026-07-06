// ═══════════════════════════════════════════════════════
//  Weekly Report API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyReport, exportWeeklyReportToExcel } from '@/lib/api/reports';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/reports/weekly?startDate=2025-01-06
 * Generate weekly report
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const format = searchParams.get('format') || 'json'; // json | excel

    const report = await generateWeeklyReport(startDate);

    // Return Excel format
    if (format === 'excel') {
      const buffer = await exportWeeklyReportToExcel(report);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="weekly-report-${report.startDate}-to-${report.endDate}.xlsx"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Weekly report API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate weekly report' },
      { status: 500 }
    );
  }
}
