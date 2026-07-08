import { NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * TEST DATA GENERATOR
 * GET /api/test-data?action=addBirthdays
 * This will add sample birthdays to existing customers
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'addBirthdays') {
      // Get all customers without DOB
      const customersRef = adminDb.collection(Collections.CUSTOMERS);
      const snapshot = await customersRef.limit(10).get();

      const updates: Promise<any>[] = [];
      const today = new Date();
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        
        // If customer doesn't have DOB, add one
        if (!data.dateOfBirth) {
          // Create birthdays spread over the next 7 days
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + (index % 8)); // 0-7 days from now
          
          // Set to a past year (e.g., 1990)
          const birthYear = 1990 + (index % 10);
          const dob = `${birthYear}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
          
          updates.push(
            doc.ref.update({
              dateOfBirth: dob,
              updatedAt: FieldValue.serverTimestamp(),
            })
          );
        }
      });

      await Promise.all(updates);

      return NextResponse.json({
        success: true,
        message: `Added/updated birthdays for ${updates.length} customers`,
        customersUpdated: updates.length,
      });
    }

    if (action === 'checkData') {
      // Check current data status
      const customersRef = adminDb.collection(Collections.CUSTOMERS);
      const allSnapshot = await customersRef.limit(20).get();
      
      const withDOB: any[] = [];
      const withoutDOB: any[] = [];
      
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.dateOfBirth) {
          withDOB.push({ id: doc.id, name: data.name, dob: data.dateOfBirth });
        } else {
          withoutDOB.push({ id: doc.id, name: data.name });
        }
      });

      return NextResponse.json({
        success: true,
        totalCustomers: allSnapshot.size,
        customersWithDOB: withDOB.length,
        customersWithoutDOB: withoutDOB.length,
        sampleWithDOB: withDOB.slice(0, 5),
        sampleWithoutDOB: withoutDOB.slice(0, 5),
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use ?action=addBirthdays or ?action=checkData',
    });
  } catch (error) {
    console.error('Test data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate test data' },
      { status: 500 }
    );
  }
}

