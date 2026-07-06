// ═══════════════════════════════════════════════════════
//  Customer API - Restore
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { restoreCustomer } from '@/lib/api/customer-profile';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await restoreCustomer(id);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error restoring customer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
