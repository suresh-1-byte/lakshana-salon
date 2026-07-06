// ═══════════════════════════════════════════════════════
//  WhatsApp Messaging API - Firebase Implementation
// ═══════════════════════════════════════════════════════

import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';
import type { WhatsAppMessage, WhatsAppMessageType, MessageDeliveryStatus } from '@/types/admin';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'birthday' | 'appointment' | 'booking' | 'reminder' | 'thank_you' | 'custom';
  variables?: string[];
}

/**
 * Send WhatsApp message to customer
 */
export async function sendWhatsAppMessage(params: {
  customerId: string;
  customerName: string;
  customerPhone: string;
  messageType: WhatsAppMessageType;
  content: string;
  mediaUrl?: string;
  templateName?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const messageData = {
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      messageType: params.messageType,
      content: params.content,
      mediaUrl: params.mediaUrl || null,
      templateName: params.templateName || null,
      deliveryStatus: 'pending' as MessageDeliveryStatus,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(Collections.WHATSAPP_MESSAGES).add(messageData);

    // Here you would integrate with actual WhatsApp API
    // For now, we'll call the WhatsApp Cloud API
    const whatsappSent = await sendToWhatsAppCloudAPI({
      phone: params.customerPhone,
      message: params.content,
      messageType: params.messageType,
      mediaUrl: params.mediaUrl,
    });

    if (whatsappSent.success) {
      await docRef.update({
        deliveryStatus: 'sent',
        sentAt: FieldValue.serverTimestamp(),
      });
    } else {
      await docRef.update({
        deliveryStatus: 'failed',
        errorMessage: whatsappSent.error,
      });
    }

    return { success: whatsappSent.success, messageId: docRef.id };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

/**
 * Send message via WhatsApp Cloud API
 */
async function sendToWhatsAppCloudAPI(params: {
  phone: string;
  message: string;
  messageType: WhatsAppMessageType;
  mediaUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      console.warn('WhatsApp credentials not configured');
      return { success: false, error: 'WhatsApp not configured' };
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = params.phone.replace(/[^0-9]/g, '');

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    let body: any = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
    };

    if (params.messageType === 'text') {
      body.type = 'text';
      body.text = { body: params.message };
    } else if (params.messageType === 'image' && params.mediaUrl) {
      body.type = 'image';
      body.image = { link: params.mediaUrl };
    } else if (params.messageType === 'document' && params.mediaUrl) {
      body.type = 'document';
      body.document = { link: params.mediaUrl };
    } else if (params.messageType === 'template') {
      body.type = 'template';
      body.template = {
        name: 'birthday_wish', // Template name from WhatsApp Manager
        language: { code: 'en' },
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API Error:', error);
      return { success: false, error: error.error?.message || 'API request failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('WhatsApp Cloud API error:', error);
    return { success: false, error: 'Failed to send via WhatsApp' };
  }
}

/**
 * Get customer message history
 */
export async function getCustomerMessageHistory(customerId: string): Promise<WhatsAppMessage[]> {
  try {
    const snapshot = await adminDb
      .collection(Collections.WHATSAPP_MESSAGES)
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        messageType: data.messageType,
        content: data.content,
        mediaUrl: data.mediaUrl,
        templateName: data.templateName,
        deliveryStatus: data.deliveryStatus,
        sentAt: data.sentAt?.toDate?.().toISOString() || data.sentAt,
        deliveredAt: data.deliveredAt?.toDate?.().toISOString() || data.deliveredAt,
        readAt: data.readAt?.toDate?.().toISOString() || data.readAt,
        errorMessage: data.errorMessage,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      } as WhatsAppMessage;
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    return [];
  }
}

/**
 * Update message delivery status (for webhook)
 */
export async function updateMessageStatus(
  messageId: string,
  status: MessageDeliveryStatus,
  timestamp?: string
) {
  try {
    const updateData: any = {
      deliveryStatus: status,
    };

    if (status === 'sent') {
      updateData.sentAt = timestamp || FieldValue.serverTimestamp();
    } else if (status === 'delivered') {
      updateData.deliveredAt = timestamp || FieldValue.serverTimestamp();
    } else if (status === 'read') {
      updateData.readAt = timestamp || FieldValue.serverTimestamp();
    } else if (status === 'failed') {
      updateData.errorMessage = 'Delivery failed';
    }

    await adminDb.collection(Collections.WHATSAPP_MESSAGES).doc(messageId).update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating message status:', error);
    return { success: false };
  }
}

/**
 * Get message templates
 */
export async function getMessageTemplates(): Promise<MessageTemplate[]> {
  try {
    const snapshot = await adminDb.collection(Collections.MESSAGE_TEMPLATES).get();

    if (snapshot.empty) {
      // Return default templates if none exist
      return getDefaultTemplates();
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        content: data.content,
        category: data.category,
        variables: data.variables || [],
      } as MessageTemplate;
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return getDefaultTemplates();
  }
}

/**
 * Default message templates
 */
function getDefaultTemplates(): MessageTemplate[] {
  return [
    {
      id: 'birthday',
      name: 'Birthday Wishes',
      content: '🎉 Happy Birthday {{customerName}}! 🎂\n\nWishing you a beautiful day filled with joy! 🌸\n\nEnjoy a special 20% discount on your next visit as our birthday gift to you! 💝\n\n- Lakshana Beauty Salon',
      category: 'birthday',
      variables: ['customerName'],
    },
    {
      id: 'appointment_reminder',
      name: 'Appointment Reminder',
      content: 'Hi {{customerName}},\n\nThis is a reminder about your appointment tomorrow at {{time}} for {{service}}.\n\nLooking forward to seeing you!\n\n- Lakshana Beauty Salon',
      category: 'appointment',
      variables: ['customerName', 'time', 'service'],
    },
    {
      id: 'booking_confirmation',
      name: 'Booking Confirmation',
      content: 'Hi {{customerName}},\n\nYour booking has been confirmed! ✅\n\nService: {{service}}\nDate: {{date}}\nTime: {{time}}\n\nThank you for choosing Lakshana Beauty Salon!',
      category: 'booking',
      variables: ['customerName', 'service', 'date', 'time'],
    },
    {
      id: 'thank_you',
      name: 'Thank You Message',
      content: 'Thank you for visiting Lakshana Beauty Salon, {{customerName}}! ✨\n\nWe hope you enjoyed your {{service}}.\n\nWe look forward to serving you again soon! 💝',
      category: 'thank_you',
      variables: ['customerName', 'service'],
    },
  ];
}

/**
 * Send birthday wishes to customers
 */
export async function sendBirthdayWishes(customerIds: string[]): Promise<{
  success: number;
  failed: number;
  errors: Array<{ customerId: string; error: string }>;
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ customerId: string; error: string }>,
  };

  const templates = await getMessageTemplates();
  const birthdayTemplate = templates.find(t => t.category === 'birthday');

  if (!birthdayTemplate) {
    console.error('Birthday template not found');
    return results;
  }

  for (const customerId of customerIds) {
    try {
      // Get customer details
      const customerDoc = await adminDb.collection(Collections.CUSTOMERS).doc(customerId).get();
      
      if (!customerDoc.exists) {
        results.failed++;
        results.errors.push({ customerId, error: 'Customer not found' });
        continue;
      }

      const customer = customerDoc.data()!;
      const message = birthdayTemplate.content.replace('{{customerName}}', customer.name);

      const result = await sendWhatsAppMessage({
        customerId,
        customerName: customer.name,
        customerPhone: customer.whatsappNumber || customer.phone,
        messageType: 'text',
        content: message,
        templateName: 'birthday',
      });

      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ customerId, error: result.error || 'Unknown error' });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ customerId, error: String(error) });
    }
  }

  return results;
}
