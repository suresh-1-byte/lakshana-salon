// ═══════════════════════════════════════════════════════
//  WhatsApp API - Send Message
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/api/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { customerId, customerName, customerPhone, messageType, content, mediaUrl, templateName } = body;

    if (!customerId || !customerName || !customerPhone || !messageType || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({
      customerId,
      customerName,
      customerPhone,
      messageType,
      content,
      mediaUrl,
      templateName,
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
