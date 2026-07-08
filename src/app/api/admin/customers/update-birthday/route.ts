import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// PUT: Update customer birthday
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, dateOfBirth } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'Date of birth is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customerRef = adminDb.collection(Collections.CUSTOMERS).doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Update customer with DOB
    await customerRef.update({
      dateOfBirth,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Birthday updated successfully',
      customer: {
        id: customerId,
        name: customerDoc.data()?.name,
        dateOfBirth,
      },
    });
  } catch (error) {
    console.error('Update birthday error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Bulk update birthdays for multiple customers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates } = body; // Array of { customerId, dateOfBirth }

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each update
    for (const update of updates) {
      try {
        const { customerId, dateOfBirth } = update;

        if (!customerId || !dateOfBirth) {
          results.failed++;
          results.errors.push({
            customerId,
            error: 'Missing customerId or dateOfBirth',
          });
          continue;
        }

        if (!dateRegex.test(dateOfBirth)) {
          results.failed++;
          results.errors.push({
            customerId,
            error: 'Invalid date format',
          });
          continue;
        }

        const customerRef = adminDb.collection(Collections.CUSTOMERS).doc(customerId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
          results.failed++;
          results.errors.push({
            customerId,
            error: 'Customer not found',
          });
          continue;
        }

        await customerRef.update({
          dateOfBirth,
          updatedAt: FieldValue.serverTimestamp(),
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          customerId: update.customerId,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.success} customers successfully`,
      results,
    });
  } catch (error) {
    console.error('Bulk update birthday error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
