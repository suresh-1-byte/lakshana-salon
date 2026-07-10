// ═══════════════════════════════════════════════════════
//  Birthday Management API - Admin Dashboard
// ═══════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getUpcomingBirthdays, getTodaysBirthdays } from '@/lib/api/birthdays';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/birthday-management
 * Returns upcoming birthdays with calculated days until birthday
 */
export async function GET() {
  try {
    // Get birthdays in next 7 days
    const customers = await getUpcomingBirthdays(7);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Transform data with daysUntil calculation
    const birthdays = customers.map(customer => {
      const dob = new Date(customer.dateOfBirth!);
      const thisYear = today.getFullYear();
      const birthdayThisYear = new Date(thisYear, dob.getMonth(), dob.getDate());

      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(thisYear + 1);
      }

      const daysUntil = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        whatsappNumber: customer.whatsappNumber,
        dateOfBirth: customer.dateOfBirth,
        daysUntil,
        birthdayDate: birthdayThisYear.toISOString().split('T')[0],
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: birthdays,
        count: birthdays.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Birthday management API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch birthdays',
        data: [],
      },
      { status: 500 }
    );
  }
}
