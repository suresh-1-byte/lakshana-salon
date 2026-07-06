// ═══════════════════════════════════════════════════════
//  WhatsApp Send Message API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/api/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await sendWhatsAppMessage(body);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}
