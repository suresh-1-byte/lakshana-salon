// ═══════════════════════════════════════════════════════
//  Birthday Automation API - Supabase Implementation
// ═══════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from './whatsapp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface BirthdayNotification {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  birthdayDate: string;
  daysRemaining: number;
  notificationSent: boolean;
  messageSent: boolean;
  messageContent?: string;
  offerPercentage: number;
  offerValidUntil: string;
  status: 'pending' | 'sent' | 'failed' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface BirthdayTemplate {
  id: string;
  templateName: string;
  messageText: string;
  offerPercentage: number;
  offerValidityDays: number;
  serviceNames: string[];
  couponCodePrefix: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BirthdayCustomer {
  id: string;
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  dateOfBirth: string;
  age: number;
  daysUntilBirthday: number;
  birthdayThisYear: string;
}

/**
 * Get upcoming birthdays (next 7 days)
 */
export async function getUpcomingBirthdays(daysAhead: number = 7): Promise<BirthdayCustomer[]> {
  try {
    const { data, error } = await supabase.rpc('get_upcoming_birthdays', {
      days_ahead: daysAhead
    });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.customer_id,
      name: item.full_name,
      phone: item.mobile_number,
      whatsappNumber: item.whatsapp_number,
      email: item.email,
      dateOfBirth: item.date_of_birth,
      age: item.age,
      daysUntilBirthday: item.days_until_birthday,
      birthdayThisYear: item.birthday_this_year,
    }));
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', error);
    return [];
  }
}

/**
 * Get today's birthdays
 */
export async function getTodaysBirthdaysFromDB(): Promise<BirthdayCustomer[]> {
  try {
    const { data, error } = await supabase.rpc('get_todays_birthdays');

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.customer_id,
      name: item.full_name,
      phone: item.mobile_number,
      whatsappNumber: item.whatsapp_number,
      email: item.email,
      dateOfBirth: item.date_of_birth,
      age: item.age,
      daysUntilBirthday: 0,
      birthdayThisYear: new Date().toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching today\'s birthdays:', error);
    return [];
  }
}

/**
 * Create birthday notifications (run daily via cron)
 */
export async function createBirthdayNotifications() {
  try {
    const { data, error } = await supabase.rpc('create_birthday_notifications');

    if (error) throw error;

    return { success: true, count: data || 0 };
  } catch (error) {
    console.error('Error creating birthday notifications:', error);
    return { success: false, count: 0, error: String(error) };
  }
}

/**
 * Get all birthday notifications
 */
export async function getBirthdayNotifications(status?: string): Promise<BirthdayNotification[]> {
  try {
    let query = supabase
      .from('birthday_notifications')
      .select(`
        *,
        customers (
          full_name,
          mobile_number,
          whatsapp_number
        )
      `)
      .order('days_remaining', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      customerId: item.customer_id,
      customerName: item.customers?.full_name,
      customerPhone: item.customers?.mobile_number,
      birthdayDate: item.birthday_date,
      daysRemaining: item.days_remaining,
      notificationSent: item.notification_sent,
      messageSent: item.message_sent,
      messageContent: item.message_content,
      offerPercentage: item.offer_percentage,
      offerValidUntil: item.offer_valid_until,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching birthday notifications:', error);
    return [];
  }
}

/**
 * Get pending birthday notifications (for dashboard widget)
 */
export async function getPendingBirthdayNotifications(): Promise<BirthdayNotification[]> {
  return getBirthdayNotifications('pending');
}

/**
 * Get birthday templates
 */
export async function getBirthdayTemplates(): Promise<BirthdayTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('birthday_templates')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      templateName: item.template_name,
      messageText: item.message_text,
      offerPercentage: item.offer_percentage,
      offerValidityDays: item.offer_validity_days,
      serviceNames: item.service_names || [],
      couponCodePrefix: item.coupon_code_prefix,
      isActive: item.is_active,
      isDefault: item.is_default,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching birthday templates:', error);
    return [];
  }
}

/**
 * Get default birthday template
 */
export async function getDefaultBirthdayTemplate(): Promise<BirthdayTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('birthday_templates')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      templateName: data.template_name,
      messageText: data.message_text,
      offerPercentage: data.offer_percentage,
      offerValidityDays: data.offer_validity_days,
      serviceNames: data.service_names || [],
      couponCodePrefix: data.coupon_code_prefix,
      isActive: data.is_active,
      isDefault: data.is_default,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching default template:', error);
    return null;
  }
}

/**
 * Generate birthday message from template
 */
export function generateBirthdayMessage(
  template: BirthdayTemplate,
  customer: BirthdayCustomer,
  notification: BirthdayNotification
): string {
  const couponCode = `${template.couponCodePrefix}${customer.age}${new Date().getFullYear()}`;
  const services = template.serviceNames.join(', ');
  const validUntil = new Date(notification.offerValidUntil).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const birthdayFormatted = new Date(customer.birthdayThisYear).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long'
  });

  let message = template.messageText;
  message = message.replace(/{{name}}/g, customer.name);
  message = message.replace(/{{birthday_date}}/g, birthdayFormatted);
  message = message.replace(/{{offer_percentage}}/g, String(notification.offerPercentage));
  message = message.replace(/{{services}}/g, services);
  message = message.replace(/{{coupon_code}}/g, couponCode);
  message = message.replace(/{{valid_until}}/g, validUntil);
  message = message.replace(/{{validity_days}}/g, String(template.offerValidityDays));
  message = message.replace(/{{age}}/g, String(customer.age));

  return message;
}

/**
 * Send birthday offer message to customer
 */
export async function sendBirthdayOffer(notificationId: string) {
  try {
    // Get notification details
    const { data: notification, error: notifError } = await supabase
      .from('birthday_notifications')
      .select(`
        *,
        customers (
          id,
          full_name,
          mobile_number,
          whatsapp_number,
          date_of_birth
        )
      `)
      .eq('id', notificationId)
      .single();

    if (notifError || !notification) {
      throw new Error('Notification not found');
    }

    // Get default template
    const template = await getDefaultBirthdayTemplate();
    if (!template) {
      throw new Error('No active template found');
    }

    // Get customer birthday info
    const upcomingBirthdays = await getUpcomingBirthdays(30);
    const customerBirthday = upcomingBirthdays.find(b => b.id === notification.customer_id);
    
    if (!customerBirthday) {
      throw new Error('Customer birthday info not found');
    }

    // Generate message
    const message = generateBirthdayMessage(
      template,
      customerBirthday,
      {
        id: notification.id,
        customerId: notification.customer_id,
        birthdayDate: notification.birthday_date,
        daysRemaining: notification.days_remaining,
        notificationSent: notification.notification_sent,
        messageSent: notification.message_sent,
        offerPercentage: notification.offer_percentage,
        offerValidUntil: notification.offer_valid_until,
        status: notification.status,
        createdAt: notification.created_at,
        updatedAt: notification.updated_at,
      }
    );

    // Send WhatsApp message
    const phone = notification.customers.whatsapp_number || notification.customers.mobile_number;
    const result = await sendWhatsAppMessage({
      customerId: notification.customer_id,
      customerName: notification.customers.full_name,
      customerPhone: phone,
      messageType: 'template',
      content: message,
      templateName: 'birthday_offer',
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send message');
    }

    // Update notification status
    await supabase
      .from('birthday_notifications')
      .update({
        message_sent: true,
        message_sent_at: new Date().toISOString(),
        message_content: message,
        whatsapp_message_id: result.messageId,
        status: 'sent',
      })
      .eq('id', notificationId);

    // Link WhatsApp message to notification
    if (result.messageId) {
      await supabase
        .from('whatsapp_messages')
        .update({
          birthday_notification_id: notificationId,
        })
        .eq('id', result.messageId);
    }

    return { success: true, messageId: result.messageId, message };
  } catch (error) {
    console.error('Error sending birthday offer:', error);
    
    // Update notification as failed
    await supabase
      .from('birthday_notifications')
      .update({
        status: 'failed',
      })
      .eq('id', notificationId);

    return { success: false, error: String(error) };
  }
}

/**
 * Create or update birthday template
 */
export async function saveBirthdayTemplate(template: Partial<BirthdayTemplate>) {
  try {
    const templateData = {
      template_name: template.templateName,
      message_text: template.messageText,
      offer_percentage: template.offerPercentage,
      offer_validity_days: template.offerValidityDays,
      service_names: template.serviceNames,
      coupon_code_prefix: template.couponCodePrefix,
      is_active: template.isActive,
      is_default: template.isDefault,
    };

    if (template.id) {
      // Update existing
      const { error } = await supabase
        .from('birthday_templates')
        .update(templateData)
        .eq('id', template.id);

      if (error) throw error;
    } else {
      // Create new
      const { error } = await supabase
        .from('birthday_templates')
        .insert([templateData]);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving template:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete birthday template
 */
export async function deleteBirthdayTemplate(templateId: string) {
  try {
    const { error } = await supabase
      .from('birthday_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Mark notification as sent (notification only, not message)
 */
export async function markNotificationAsSent(notificationId: string) {
  try {
    const { error } = await supabase
      .from('birthday_notifications')
      .update({
        notification_sent: true,
        notification_sent_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get birthday statistics for dashboard
 */
export async function getBirthdayStatistics() {
  try {
    const today = await getTodaysBirthdaysFromDB();
    const upcoming = await getUpcomingBirthdays(7);
    const notifications = await getBirthdayNotifications();
    
    const messagesSent = notifications.filter(n => n.messageSent).length;
    const pendingWishes = notifications.filter(n => !n.messageSent && n.status === 'pending').length;

    return {
      todayCount: today.length,
      upcomingCount: upcoming.length,
      messagesSentThisWeek: messagesSent,
      pendingWishes,
    };
  } catch (error) {
    console.error('Error fetching birthday statistics:', error);
    return {
      todayCount: 0,
      upcomingCount: 0,
      messagesSentThisWeek: 0,
      pendingWishes: 0,
    };
  }
}
