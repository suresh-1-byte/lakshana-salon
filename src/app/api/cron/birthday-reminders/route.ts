// ═══════════════════════════════════════════════════════
//  Birthday Reminder Cron Job
//  Runs daily to send reminders 1 week before birthdays
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';
import { sendWhatsAppMessage } from '@/lib/api/whatsapp';

/**
 * Get customers with birthdays in the next 7 days
 */
async function getUpcomingBirthdays(days: number = 7) {
  const customers: any[] = [];
  
  try {
    const snapshot = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('dateOfBirth', '!=', '')
      .get();

    const today = new Date();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.dateOfBirth || data.isDeleted) return;

      const dob = new Date(data.dateOfBirth);
      const thisYear = today.getFullYear();
      const birthdayThisYear = new Date(thisYear, dob.getMonth(), dob.getDate());

      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(thisYear + 1);
      }

      const daysDiff = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Check if birthday is exactly 7 days away
      if (daysDiff === days) {
        customers.push({
          id: doc.id,
          ...data,
          daysUntilBirthday: daysDiff,
          birthdayDate: birthdayThisYear.toISOString().split('T')[0],
        });
      }
    });

    return customers;
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', error);
    return [];
  }
}

/**
 * Send birthday reminder with special offer
 */
async function sendBirthdayReminder(customer: any) {
  const message = `🎂 *Special Birthday Reminder!* 🎂

Hello ${customer.name}! 👋

Your special day is coming up on *${new Date(customer.birthdayDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}* (in 7 days)! 🎉

To celebrate, we're offering you a *special 20% birthday discount* on any service! 🎁✨

*Your Birthday Offer:*
• 20% OFF on all services
• Valid for 2 weeks
• Book anytime before or after your birthday

To book your special birthday appointment, reply to this message or call us!

*Lakshana Premier Beauty Salon*
📍 Nolambur, Chennai
📞 +91 90000 00000

Let us make your birthday extra special! 💄💅`;

  try {
    // Send WhatsApp message
    const phone = customer.whatsappNumber || customer.phone;
    
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: phone,
        messageType: 'text',
        content: message,
        templateName: 'birthday_reminder',
      }),
    });

    // Log the reminder
    await adminDb.collection(Collections.WHATSAPP_MESSAGES).add({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: phone,
      messageType: 'birthday_reminder',
      content: message,
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Birthday reminder sent to ${customer.name}`);
    return { success: true, customer: customer.name };
  } catch (error) {
    console.error(`❌ Failed to send reminder to ${customer.name}:`, error);
    return { success: false, customer: customer.name, error: String(error) };
  }
}

/**
 * Main cron job handler
 * Call this daily (e.g., 9 AM) via Vercel Cron or external service
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔔 Running birthday reminder cron job...');

    // Get customers with birthdays in 7 days
    const customers = await getUpcomingBirthdays(7);

    if (customers.length === 0) {
      console.log('✅ No upcoming birthdays in the next 7 days');
      return NextResponse.json({
        success: true,
        message: 'No upcoming birthdays',
        sent: 0,
      });
    }

    console.log(`📋 Found ${customers.length} customers with upcoming birthdays`);

    // Send reminders
    const results = await Promise.all(
      customers.map(customer => sendBirthdayReminder(customer))
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`✅ Sent ${successCount} reminders, ${failCount} failed`);

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: customers.length,
      results,
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger for testing
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Manually triggering birthday reminders...');

    const customers = await getUpcomingBirthdays(7);

    if (customers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No upcoming birthdays',
        sent: 0,
      });
    }

    const results = await Promise.all(
      customers.map(customer => sendBirthdayReminder(customer))
    );

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: results.length - successCount,
      total: customers.length,
      results,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
