// ═══════════════════════════════════════════════════════
//  Customer DOB Statistics API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active customers
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, full_name, mobile_number, email, date_of_birth')
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;

    const total = customers?.length || 0;
    const withDOB = customers?.filter(c => c.date_of_birth).length || 0;
    const withoutDOB = total - withDOB;
    const percentage = total > 0 ? (withDOB / total) * 100 : 0;

    const customersWithoutDOB = customers
      ?.filter(c => !c.date_of_birth)
      .map(c => ({
        id: c.id,
        name: c.full_name,
        phone: c.mobile_number,
        email: c.email,
      })) || [];

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
