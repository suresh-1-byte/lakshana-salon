// ═══════════════════════════════════════════════════════
//  Test Birthday Reminder API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/api/whatsapp';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Test message content
    const testMessage = `🎂 *Test Birthday Reminder* 🎂

This is a test message from your birthday automation system.

✅ WhatsApp integration is working correctly!
✅ Message formatting looks good!
✅ Ready to send birthday reminders!

*Lakshana Premier Beauty Salon*
📍 Nolambur, Chennai

System Status: Active ✨`;

    // Send to admin phone (you can configure this)
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '+919876543210';

    const result = await sendWhatsAppMessage({
      customerId: 'test',
      customerName: 'Admin Test',
      customerPhone: adminPhone,
      messageType: 'text',
      content: testMessage,
      templateName: 'test_reminder',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test reminder sent successfully',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to send test reminder',
          details: 'Check WhatsApp API credentials in .env.local'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test reminder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test reminder',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
