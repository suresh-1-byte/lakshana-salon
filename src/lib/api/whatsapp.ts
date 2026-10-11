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

/** True when WhatsApp Cloud API credentials are configured. */
export function isWhatsAppConfigured(): boolean {
  return !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

/** WhatsApp wants the full international number; 10-digit Indian numbers get 91. */
function toWhatsAppNumber(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

/**
 * Send WhatsApp message to customer (logged in `whatsapp_messages`).
 *
 * WhatsApp only allows free-form text inside a 24-hour window after the
 * customer last messaged the salon. Messages the salon starts (birthday
 * wishes, reminders) must use a template approved in WhatsApp Manager:
 * pass `whatsappTemplate` for those.
 */
export async function sendWhatsAppMessage(params: {
  customerId: string;
  customerName: string;
  customerPhone: string;
  messageType: WhatsAppMessageType;
  content: string;
  mediaUrl?: string;
  templateName?: string;
  whatsappTemplate?: { name: string; language?: string; bodyParams?: string[] };
  meta?: Record<string, unknown>;
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
      ...(params.meta || {}),
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(Collections.WHATSAPP_MESSAGES).add(messageData);

    const whatsappSent = await sendToWhatsAppCloudAPI({
      phone: params.customerPhone,
      message: params.content,
      messageType: params.whatsappTemplate ? 'template' : params.messageType,
      mediaUrl: params.mediaUrl,
      template: params.whatsappTemplate,
    });

    if (whatsappSent.success) {
      await docRef.update({
        deliveryStatus: 'sent',
        sentAt: FieldValue.serverTimestamp(),
      });
    } else {
      await docRef.update({
        deliveryStatus: 'failed',
        errorMessage: whatsappSent.error || 'Unknown error',
      });
    }

    return { success: whatsappSent.success, messageId: docRef.id, error: whatsappSent.error };
  } catch (error) {
    console.error('Error sending WhatsApp message:', (error as Error)?.message);
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
  template?: { name: string; language?: string; bodyParams?: string[] };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return { success: false, error: 'WhatsApp not configured (set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN)' };
    }

    const to = toWhatsAppNumber(params.phone);
    if (to.length < 11) {
      return { success: false, error: 'Invalid phone number' };
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const body: any = {
      messaging_product: 'whatsapp',
      to,
    };

    if (params.messageType === 'template') {
      const template = params.template || { name: 'birthday_wish' };
      body.type = 'template';
      body.template = {
        name: template.name,
        language: { code: template.language || 'en' },
        ...(template.bodyParams?.length
          ? {
              components: [
                {
                  type: 'body',
                  parameters: template.bodyParams.map(text => ({ type: 'text', text })),
                },
              ],
            }
          : {}),
      };
    } else if (params.messageType === 'image' && params.mediaUrl) {
      body.type = 'image';
      body.image = { link: params.mediaUrl };
    } else if (params.messageType === 'document' && params.mediaUrl) {
      body.type = 'document';
      body.document = { link: params.mediaUrl };
    } else {
      body.type = 'text';
      body.text = { body: params.message };
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
      const error = await response.json().catch(() => ({}));
      const message = error?.error?.message || `WhatsApp API request failed (${response.status})`;
      console.error('WhatsApp API Error:', message);
      return { success: false, error: message };
    }

    return { success: true };
  } catch (error) {
    console.error('WhatsApp Cloud API error:', (error as Error)?.message);
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
      .get();

    // Sort in memory (where + orderBy would need a composite index)
    const docs = snapshot.docs
      .sort((a, b) => (b.data().createdAt?.toMillis?.() || 0) - (a.data().createdAt?.toMillis?.() || 0))
      .slice(0, 50);

    return docs.map(doc => {
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
