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
 * Returns upcoming birthdays AND anniversaries with calculated days until event
 */
export async function GET() {
  try {
    // Get customers with birthdays OR anniversaries in next 7 days
    const customersSnapshot = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('isDeleted', '==', false)
      .get();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events: any[] = [];

    for (const doc of customersSnapshot.docs) {
      const customer = { id: doc.id, ...doc.data() } as any;
      
      // Check birthday
      if (customer.dateOfBirth) {
        const dob = new Date(customer.dateOfBirth);
        const thisYear = today.getFullYear();
        const birthdayThisYear = new Date(thisYear, dob.getMonth(), dob.getDate());

        if (birthdayThisYear < today) {
          birthdayThisYear.setFullYear(thisYear + 1);
        }

        const daysUntil = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= 7) {
          events.push({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            whatsappNumber: customer.whatsappNumber,
            email: customer.email,
            dateOfBirth: customer.dateOfBirth,
            anniversary: customer.anniversary,
            daysUntilBirthday: daysUntil,
            birthdayDate: birthdayThisYear.toISOString().split('T')[0],
            eventType: 'birthday',
            isToday: daysUntil === 0,
          });
        }
      }

      // Check anniversary
      if (customer.anniversary) {
        const anniv = new Date(customer.anniversary);
        const thisYear = today.getFullYear();
        const anniversaryThisYear = new Date(thisYear, anniv.getMonth(), anniv.getDate());

        if (anniversaryThisYear < today) {
          anniversaryThisYear.setFullYear(thisYear + 1);
        }

        const daysUntil = Math.ceil((anniversaryThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= 7) {
          // Check if we already have this customer in events (birthday)
          const existingIndex = events.findIndex(e => e.id === customer.id);
          
          if (existingIndex >= 0) {
            // Customer has both birthday and anniversary in next 7 days
            events[existingIndex].eventType = 'both';
            events[existingIndex].daysUntilAnniversary = daysUntil;
            events[existingIndex].anniversaryDate = anniversaryThisYear.toISOString().split('T')[0];
          } else {
            // Only anniversary
            events.push({
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              whatsappNumber: customer.whatsappNumber,
              email: customer.email,
              dateOfBirth: customer.dateOfBirth,
              anniversary: customer.anniversary,
              daysUntilAnniversary: daysUntil,
              anniversaryDate: anniversaryThisYear.toISOString().split('T')[0],
              eventType: 'anniversary',
              isToday: daysUntil === 0,
            });
          }
        }
      }
    }

    // Sort by days until event (soonest first)
    events.sort((a, b) => {
      const daysA = a.daysUntilBirthday ?? a.daysUntilAnniversary ?? 999;
      const daysB = b.daysUntilBirthday ?? b.daysUntilAnniversary ?? 999;
      return daysA - daysB;
    });

    const stats = {
      totalCustomers: events.length,
      todayCount: events.filter(e => e.isToday).length,
      upcomingCount: events.filter(e => !e.isToday).length,
    };

    return NextResponse.json(
      {
        success: true,
        customers: events,
        stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Birthday/Anniversary management API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch birthdays and anniversaries',
        customers: [],
        stats: { totalCustomers: 0, todayCount: 0, upcomingCount: 0 },
      },
      { status: 500 }
    );
  }
}
