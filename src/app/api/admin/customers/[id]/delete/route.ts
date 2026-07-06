// ═══════════════════════════════════════════════════════
//  Customer API - Delete (Soft)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { deleteCustomer } from '@/lib/api/customer-profile';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await deleteCustomer(id);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
