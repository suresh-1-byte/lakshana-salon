// ═══════════════════════════════════════════════════════
//  Upcoming Birthdays API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingBirthdays } from '@/lib/api/birthdays';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/birthdays/upcoming?days=7
 * Get upcoming birthdays in the next N days
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const customers = await getUpcomingBirthdays(days);

    // Transform data to match frontend expectations
    const birthdays = customers.map(customer => {
      const dob = new Date(customer.dateOfBirth);
      const today = new Date();
      const thisYear = today.getFullYear();
      const birthdayThisYear = new Date(thisYear, dob.getMonth(), dob.getDate());

      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(thisYear + 1);
      }

      const daysUntilBirthday = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        dateOfBirth: customer.dateOfBirth,
        whatsappNumber: customer.whatsappNumber,
        daysUntilBirthday,
        birthdayDate: birthdayThisYear.toISOString().split('T')[0],
      };
    });

    return NextResponse.json({
      success: true,
      count: birthdays.length,
      birthdays: birthdays,
    });
  } catch (error) {
    console.error('Upcoming birthdays API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upcoming birthdays' },
      { status: 500 }
    );
  }
}
