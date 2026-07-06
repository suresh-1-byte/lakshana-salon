// ═══════════════════════════════════════════════════════
//  Birthday Templates API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  getBirthdayTemplates,
  saveBirthdayTemplate,
  deleteBirthdayTemplate,
} from '@/lib/api/birthday-automation';

// Force dynamic rendering - don't try to prerender this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const templates = await getBirthdayTemplates();

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Error fetching birthday templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch birthday templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // saveBirthdayTemplate handles both create and update
    const result = await saveBirthdayTemplate(body);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: body.id ? 'Template updated successfully' : 'Template created successfully',
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to save template' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving birthday template:', error);
    return NextResponse.json(
      { error: 'Failed to save birthday template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteBirthdayTemplate(id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to delete template' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting birthday template:', error);
    return NextResponse.json(
      { error: 'Failed to delete birthday template' },
      { status: 500 }
    );
  }
}
