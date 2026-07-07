import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Calculate days until next birthday
function calculateDaysUntilBirthday(dateOfBirth: string): { daysUntil: number; nextBirthday: string } {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  
  // Get this year's birthday
  const thisYear = today.getFullYear();
  let nextBirthday = new Date(thisYear, dob.getMonth(), dob.getDate());
  
  // If birthday already passed this year, use next year
  if (nextBirthday < today) {
    nextBirthday = new Date(thisYear + 1, dob.getMonth(), dob.getDate());
  }
  
  // Calculate days difference
  const diffTime = nextBirthday.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    daysUntil,
    nextBirthday: nextBirthday.toISOString().split('T')[0],
  };
}

export async function GET(req: NextRequest) {
  try {
    // Fetch all active customers with date of birth
    const customersRef = adminDb.collection(Collections.CUSTOMERS);
    const snapshot = await customersRef
      .where('status', '==', 'active')
      .get();

    const today = new Date();
    const allCustomers: any[] = [];
    const upcomingBirthdays: any[] = [];
    let todayCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only process customers with DOB
      if (data.dateOfBirth) {
        allCustomers.push({ id: doc.id, ...data });
        
        const { daysUntil, nextBirthday } = calculateDaysUntilBirthday(data.dateOfBirth);
        
        // Check if birthday is in next 7 days
        if (daysUntil >= 0 && daysUntil <= 7) {
          upcomingBirthdays.push({
            id: doc.id,
            name: data.name,
            phone: data.phone,
            whatsappNumber: data.whatsappNumber || data.phone,
            email: data.email || null,
            dateOfBirth: data.dateOfBirth,
            daysUntilBirthday: daysUntil,
            birthdayDate: nextBirthday,
            isToday: daysUntil === 0,
          });
          
          if (daysUntil === 0) {
            todayCount++;
          }
        }
      }
    });

    // Sort by nearest birthday first
    upcomingBirthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

    return NextResponse.json({
      success: true,
      customers: upcomingBirthdays,
      stats: {
        totalCustomers: allCustomers.length,
        todayCount,
        upcomingCount: upcomingBirthdays.length,
      },
    });
  } catch (error) {
    console.error('Birthday management API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch birthday data' },
      { status: 500 }
    );
  }
}
