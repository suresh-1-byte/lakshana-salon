// ═══════════════════════════════════════════════════════
//  Global Search API
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { globalSearch } from '@/lib/api/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query.trim()) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await globalSearch(query, limit);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
