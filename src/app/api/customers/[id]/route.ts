// ═══════════════════════════════════════════════════════
//  Customer Profile API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomerProfile,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
} from '@/lib/api/customer-profile';

/**
 * GET /api/customers/[id]
 * Get customer profile with complete history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const profile = await getCustomerProfile(id);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Customer profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/[id]
 * Update customer details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const result = await updateCustomer(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    console.error('Customer update API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id]
 * Soft delete customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { restore } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const result = restore
      ? await restoreCustomer(id)
      : await deleteCustomer(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: restore
        ? 'Customer restored successfully'
        : 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Customer delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
