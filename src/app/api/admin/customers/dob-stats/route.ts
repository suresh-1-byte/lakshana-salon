// ═══════════════════════════════════════════════════════
//  Customer DOB Statistics API Route - Firebase Implementation
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get all active customers
    const customersSnapshot = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('status', '==', 'active')
      .get();

    const customers: any[] = [];
    customersSnapshot.forEach(doc => {
      customers.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    const total = customers.length;
    const withDOB = customers.filter(c => c.dateOfBirth).length;
    const withoutDOB = total - withDOB;
    const percentage = total > 0 ? (withDOB / total) * 100 : 0;

    const customersWithoutDOB = customers
      .filter(c => !c.dateOfBirth)
      .map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
      }));

    return NextResponse.json({
      success: true,
      stats: {
        total,
        withDOB,
        withoutDOB,
        percentage,
        customersWithoutDOB,
      },
    });
  } catch (error) {
    console.error('Error fetching DOB stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch DOB statistics' },
      { status: 500 }
    );
  }
}
