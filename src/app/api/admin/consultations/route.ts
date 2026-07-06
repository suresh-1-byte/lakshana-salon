// ═══════════════════════════════════════════════════════
//  Consultations API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  getConsultations,
  getConsultation,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from '@/lib/api/consultations';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/admin/consultations
 * Get all consultations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId') || undefined;
    const status = searchParams.get('status') as any;

    const filters: any = {};
    if (customerId) filters.customerId = customerId;
    if (status) filters.status = status;

    const consultations = await getConsultations(filters);

    return NextResponse.json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/consultations
 * Create a new consultation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await createConsultation(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      consultationId: result.consultationId,
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/consultations?id=xxx
 * Update a consultation
 */
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Consultation ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const result = await updateConsultation(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error updating consultation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/consultations?id=xxx
 * Delete a consultation
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Consultation ID required' },
        { status: 400 }
      );
    }

    const result = await deleteConsultation(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
