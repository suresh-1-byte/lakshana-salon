// ═══════════════════════════════════════════════════════
//  Birthday engine — finding birthdays & sending WhatsApp
//  wishes / reminders (server only)
// ═══════════════════════════════════════════════════════

import { randomBytes } from 'crypto';
import { adminDb, Collections, FieldValue } from '../firebase-admin';
import { validatePastDate } from '../server/validation';
import { getMessageTemplates, isWhatsAppConfigured, sendWhatsAppMessage } from './whatsapp';

const SALON_TIME_ZONE = 'Asia/Kolkata';

export interface BirthdayCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsappNumber?: string;
  dateOfBirth: string;
  daysUntilBirthday: number;
  /** Next birthday as YYYY-MM-DD (salon time) */
  birthdayDate: string;
  /** Age they turn on that birthday */
  age: number;
}

type MessageKind = 'wish' | 'reminder';

// ── Dates (in salon time, not server UTC) ───────────────────────────

function salonToday(): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

const dayNumber = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) / 86400000;

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Next occurrence of a birthday on/after today. 29 Feb → 28 Feb in non-leap years. */
export function nextBirthday(dob: string, today = salonToday()) {
  const [by, bm, bd] = dob.split('-').map(Number);
  const occurrence = (y: number) => (bm === 2 && bd === 29 && !isLeap(y) ? { y, m: 2, d: 28 } : { y, m: bm, d: bd });
  let next = occurrence(today.y);
  if (dayNumber(next.y, next.m, next.d) < dayNumber(today.y, today.m, today.d)) next = occurrence(today.y + 1);
  return {
    date: iso(next.y, next.m, next.d),
    year: next.y,
    days: dayNumber(next.y, next.m, next.d) - dayNumber(today.y, today.m, today.d),
    age: next.y - by,
  };
}

/** All active customers with a valid date of birth, with their next birthday. */
async function customersWithBirthdays(): Promise<BirthdayCustomer[]> {
  const snapshot = await adminDb.collection(Collections.CUSTOMERS).get();
  const today = salonToday();
  const result: BirthdayCustomer[] = [];

  for (const doc of snapshot.docs) {
    const c = doc.data();
    if (c.isDeleted === true || c.status === 'deleted' || !c.dateOfBirth) continue;
    const valid = validatePastDate(String(c.dateOfBirth).slice(0, 10));
    if (!valid.ok) continue; // e.g. year 0009 — skipped until corrected in the admin panel
    const next = nextBirthday(valid.value, today);
    result.push({
      id: doc.id,
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      whatsappNumber: c.whatsappNumber || '',
      dateOfBirth: valid.value,
      daysUntilBirthday: next.days,
      birthdayDate: next.date,
      age: next.age,
    });
  }
  return result.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
}

/** Customers whose birthday is today (salon time). */
export async function getTodaysBirthdays(): Promise<BirthdayCustomer[]> {
  try {
    return (await customersWithBirthdays()).filter(c => c.daysUntilBirthday === 0);
  } catch (error) {
    console.error('Error fetching birthdays:', (error as Error)?.message);
    return [];
  }
}

/** Customers with a birthday within the next `days` days (including today). */
export async function getUpcomingBirthdays(days: number = 7): Promise<BirthdayCustomer[]> {
  const window = Math.min(Math.max(Math.floor(days) || 7, 0), 366);
  try {
    return (await customersWithBirthdays()).filter(c => c.daysUntilBirthday <= window);
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', (error as Error)?.message);
    return [];
  }
}

/** Customers with a birthday this calendar month (salon time). */
export async function getMonthBirthdays(): Promise<BirthdayCustomer[]> {
  const month = salonToday().m;
  try {
    return (await customersWithBirthdays()).filter(c => Number(c.dateOfBirth.slice(5, 7)) === month);
  } catch (error) {
    console.error('Error fetching month birthdays:', (error as Error)?.message);
    return [];
  }
}

// ── Messages ────────────────────────────────────────────────────────

/**
 * True if a birthday message of this kind was already sent to the customer
 * for this birthday. Single-field query + in-memory filter, so no composite
 * Firestore index is needed.
 */
export async function wasBirthdayMessageSent(customerId: string, kind: MessageKind, birthdayYear: number) {
  const snap = await adminDb.collection(Collections.WHATSAPP_MESSAGES).where('customerId', '==', customerId).get();
  return snap.docs.some((d: any) => {
    const m = d.data();
    return m.birthdayKind === kind && m.birthdayYear === birthdayYear && m.deliveryStatus === 'sent';
  });
}

/** Kept for existing callers: was today's birthday wish already sent? */
export async function wasBirthdayWishSentToday(customerId: string): Promise<boolean> {
  try {
    return await wasBirthdayMessageSent(customerId, 'wish', salonToday().y);
  } catch {
    return false;
  }
}

interface BirthdayTemplate {
  messageText: string;
  offerPercentage: number;
  offerValidityDays: number;
  serviceNames: string[];
  couponCodePrefix: string;
}

const DEFAULT_TEMPLATES: Record<MessageKind, BirthdayTemplate> = {
  wish: {
    messageText:
      '🎉 Happy Birthday {{name}}! 🎂\n\nWishing you a beautiful day filled with joy! 🌸\n\nEnjoy {{offer_percentage}}% off your next visit — valid until {{valid_until}}.\n\n- {{salon_name}}',
    offerPercentage: 20,
    offerValidityDays: 14,
    serviceNames: [],
    couponCodePrefix: 'BDAY',
  },
  reminder: {
    messageText:
      '🎂 Hello {{name}}! Your birthday is coming up on {{birthday_date}}.\n\nTo celebrate, enjoy {{offer_percentage}}% off any service, valid until {{valid_until}}. Reply or call us to book!\n\n- {{salon_name}}',
    offerPercentage: 20,
    offerValidityDays: 14,
    serviceNames: [],
    couponCodePrefix: 'BDAY',
  },
};

/**
 * Message template: the default active template from the Birthday Templates
 * page, else a "birthday" message template, else the built-in text.
 */
async function loadTemplate(kind: MessageKind): Promise<BirthdayTemplate> {
  const fallback = DEFAULT_TEMPLATES[kind];
  try {
    const snap = await adminDb.collection('birthday_templates').get();
    const active = snap.docs.map((d: any) => d.data()).filter((t: any) => t.isActive !== false && t.messageText);
    const chosen = active.find((t: any) => t.isDefault) || active[0];
    if (chosen) {
      return {
        messageText: chosen.messageText,
        offerPercentage: Number(chosen.offerPercentage) || fallback.offerPercentage,
        offerValidityDays: Number(chosen.offerValidityDays) || fallback.offerValidityDays,
        serviceNames: Array.isArray(chosen.serviceNames) ? chosen.serviceNames : [],
        couponCodePrefix: chosen.couponCodePrefix || fallback.couponCodePrefix,
      };
    }
    if (kind === 'wish') {
      const legacy = (await getMessageTemplates()).find(t => t.category === 'birthday');
      if (legacy?.content) {
        return { ...fallback, messageText: legacy.content.replace(/\{\{customerName\}\}/g, '{{name}}') };
      }
    }
  } catch (error) {
    console.error('Could not load birthday template:', (error as Error)?.message);
  }
  return fallback;
}

/** Create a single-use percentage coupon for this customer. */
async function createBirthdayCoupon(prefix: string, percent: number, validUntil: string, customerId: string) {
  const code = `${prefix.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8) || 'BDAY'}${randomBytes(3).toString('hex').toUpperCase()}`;
  const ref = await adminDb.collection(Collections.COUPONS).add({
    code,
    description: 'Birthday offer',
    discountType: 'percentage',
    discountValue: percent,
    minOrderAmount: null,
    maxUses: 1,
    usedCount: 0,
    expiresAt: `${validUntil}T23:59:59+05:30`,
    isActive: true,
    customerId,
    source: 'birthday',
    createdAt: FieldValue.serverTimestamp(),
  });
  return { code, ref };
}

function formatLongDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', timeZone: 'UTC' });
}

/**
 * Send one birthday message (wish on the day, or reminder before it).
 * Skips customers already messaged for this birthday.
 */
export async function sendBirthdayMessage(customer: BirthdayCustomer, kind: MessageKind) {
  const birthdayYear = Number(customer.birthdayDate.slice(0, 4));
  if (await wasBirthdayMessageSent(customer.id, kind, birthdayYear)) {
    return { customerId: customer.id, success: true, skipped: 'already sent' };
  }

  const [template, settingsDoc] = await Promise.all([
    loadTemplate(kind),
    adminDb.collection(Collections.SETTINGS).doc('salon').get().catch(() => null),
  ]);
  const salonName = settingsDoc?.data()?.salonName || 'Lakshana Beauty Salon';

  const today = salonToday();
  const until = new Date(Date.UTC(today.y, today.m - 1, today.d + template.offerValidityDays));
  const validUntil = iso(until.getUTCFullYear(), until.getUTCMonth() + 1, until.getUTCDate());

  let coupon: { code: string; ref: any } | null = null;
  if (template.messageText.includes('{{coupon_code}}')) {
    coupon = await createBirthdayCoupon(template.couponCodePrefix, template.offerPercentage, validUntil, customer.id);
  }

  const vars: Record<string, string> = {
    name: customer.name,
    birthday_date: formatLongDate(customer.birthdayDate),
    offer_percentage: String(template.offerPercentage),
    services: template.serviceNames.join(', ') || 'all services',
    coupon_code: coupon?.code || '',
    valid_until: formatLongDate(validUntil),
    validity_days: String(template.offerValidityDays),
    age: String(customer.age),
    salon_name: salonName,
  };
  const content = template.messageText.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));

  // Salon-initiated WhatsApp messages need a Meta-approved template.
  const approvedTemplate =
    kind === 'wish' ? process.env.WHATSAPP_BIRTHDAY_TEMPLATE : process.env.WHATSAPP_BIRTHDAY_REMINDER_TEMPLATE;

  const result = await sendWhatsAppMessage({
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.whatsappNumber || customer.phone,
    messageType: 'text',
    content,
    templateName: `birthday_${kind}`,
    whatsappTemplate: approvedTemplate
      ? {
          name: approvedTemplate,
          language: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en',
          bodyParams: [customer.name],
        }
      : undefined,
    meta: { birthdayKind: kind, birthdayYear, couponCode: coupon?.code || null },
  });

  // Don't leave an unused coupon behind if the message didn't go out
  if (!result.success && coupon) {
    await coupon.ref.delete().catch(() => undefined);
  }

  return { customerId: customer.id, success: result.success, error: result.error };
}

async function sendToAll(customers: BirthdayCustomer[], kind: MessageKind) {
  if (customers.length === 0) {
    return { success: true, configured: isWhatsAppConfigured(), total: 0, sent: 0, skipped: 0, failed: 0, errors: [] };
  }
  if (!isWhatsAppConfigured()) {
    return {
      success: false,
      configured: false,
      total: customers.length,
      sent: 0,
      skipped: 0,
      failed: customers.length,
      errors: ['WhatsApp is not configured (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN)'],
    };
  }

  const results = [];
  for (const customer of customers) {
    try {
      results.push(await sendBirthdayMessage(customer, kind));
    } catch (error) {
      results.push({ customerId: customer.id, success: false, error: (error as Error)?.message || 'error' });
    }
  }
  const skipped = results.filter((r: any) => r.skipped).length;
  const sent = results.filter((r: any) => r.success && !r.skipped).length;
  const failedResults = results.filter((r: any) => !r.success);
  return {
    success: failedResults.length === 0,
    configured: true,
    total: customers.length,
    sent,
    skipped,
    failed: failedResults.length,
    // Error reasons only — no customer names or numbers
    errors: Array.from(new Set(failedResults.map((r: any) => r.error || 'unknown error'))),
  };
}

/** Birthday wishes for everyone whose birthday is today. */
export async function sendTodaysBirthdayWishes() {
  return sendToAll(await getTodaysBirthdays(), 'wish');
}

/** Reminders for everyone whose birthday is exactly `daysAhead` days away. */
export async function sendUpcomingBirthdayReminders(daysAhead = 7) {
  const customers = (await customersWithBirthdays()).filter(c => c.daysUntilBirthday === daysAhead);
  return sendToAll(customers, 'reminder');
}

/** Send wishes to specific customers (admin "send now"). */
export async function sendBulkBirthdayWishes(customerIds: string[]) {
  const all = await customersWithBirthdays();
  const chosen = all.filter(c => customerIds.includes(c.id));
  const result = await sendToAll(chosen, 'wish');
  return { sent: result.sent };
}
