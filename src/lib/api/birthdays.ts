// ═══════════════════════════════════════════════════════
//  Birthday Management API - Auto Wishes & Notifications
// ═══════════════════════════════════════════════════════

import { getAdminDb } from '../firebase-admin';
import { Collections } from '../firebase-collections';
import type { Customer } from '@/types/admin';
import { sendBirthdayWishes } from './whatsapp';

/**
 * Get today's birthdays
 */
export async function getTodaysBirthdays(): Promise<Customer[]> {
  const db = getAdminDb();
  if (!db) return [];

  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${month}-${day}`;

    // Get all customers with DOB
    const snapshot = await db
      .collection(Collections.CUSTOMERS)
      .where('dateOfBirth', '!=', '')
      .get();

    // Filter by today's date (MM-DD)
    const birthdayCustomers = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Customer))
      .filter(customer => {
        if (!customer.dateOfBirth) return false;
        const dob = new Date(customer.dateOfBirth);
        const dobStr = `${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`;
        return dobStr === todayStr;
      })
      .filter(customer => !customer.isDeleted);

    return birthdayCustomers;
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    return [];
  }
}

/**
 * Get upcoming birthdays (next 7 days)
 */
export async function getUpcomingBirthdays(days: number = 7): Promise<Customer[]> {
  const db = getAdminDb();
  if (!db) return [];

  try {
    const snapshot = await db
      .collection(Collections.CUSTOMERS)
      .where('dateOfBirth', '!=', '')
      .get();

    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    const today = new Date();
    const upcomingBirthdays: Customer[] = [];

    customers.forEach(customer => {
      if (!customer.dateOfBirth || customer.isDeleted) return;

      const dob = new Date(customer.dateOfBirth);
      const thisYear = today.getFullYear();
      const birthdayThisYear = new Date(thisYear, dob.getMonth(), dob.getDate());

      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(thisYear + 1);
      }

      const daysDiff = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 0 && daysDiff <= days) {
        upcomingBirthdays.push(customer);
      }
    });

    return upcomingBirthdays.sort((a, b) => {
      const dobA = new Date(a.dateOfBirth!);
      const dobB = new Date(b.dateOfBirth!);
      return dobA.getMonth() - dobB.getMonth() || dobA.getDate() - dobB.getDate();
    });
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', error);
    return [];
  }
}

/**
 * Send birthday wishes to today's birthday customers
 */
export async function sendTodaysBirthdayWishes() {
  const customers = await getTodaysBirthdays();

  if (customers.length === 0) {
    return { success: true, count: 0, results: [] };
  }

  const customersToSend = customers.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.whatsappNumber || c.phone,
  }));

  const results = await sendBirthdayWishes(customersToSend);

  return {
    success: true,
    count: customers.length,
    results,
  };
}

/**
 * Get month birthdays (current month)
 */
export async function getMonthBirthdays(): Promise<Customer[]> {
  const db = getAdminDb();
  if (!db) return [];

  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const monthStr = String(currentMonth).padStart(2, '0');

    // Get all customers with DOB
    const snapshot = await db
      .collection(Collections.CUSTOMERS)
      .where('dateOfBirth', '!=', '')
      .get();

    // Filter by current month
    const monthBirthdays = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Customer))
      .filter(customer => {
        if (!customer.dateOfBirth || customer.isDeleted) return false;
        const dob = new Date(customer.dateOfBirth);
        const dobMonth = String(dob.getMonth() + 1).padStart(2, '0');
        return dobMonth === monthStr;
      })
      .sort((a, b) => {
        const dobA = new Date(a.dateOfBirth!);
        const dobB = new Date(b.dateOfBirth!);
        return dobA.getDate() - dobB.getDate();
      });

    return monthBirthdays;
  } catch (error) {
    console.error('Error fetching month birthdays:', error);
    return [];
  }
}

/**
 * Send bulk birthday wishes
 */
export async function sendBulkBirthdayWishes(customerIds: string[]) {
  const db = getAdminDb();
  if (!db) return { sent: 0 };

  try {
    const results = [];

    for (const customerId of customerIds) {
      const customerDoc = await db.collection(Collections.CUSTOMERS).doc(customerId).get();
      if (!customerDoc.exists) continue;

      const customer = { id: customerDoc.id, ...customerDoc.data() } as Customer;
      
      try {
        await sendBirthdayWishes([{
          id: customer.id,
          name: customer.name,
          phone: customer.whatsappNumber || customer.phone,
        }]);
        results.push({ customerId, success: true });
      } catch (error) {
        console.error(`Failed to send birthday wish to ${customer.name}:`, error);
        results.push({ customerId, success: false });
      }
    }

    const sent = results.filter(r => r.success).length;
    return { sent };
  } catch (error) {
    console.error('Error sending bulk birthday wishes:', error);
    return { sent: 0 };
  }
}

/**
 * Check if birthday wish was sent today
 */
export async function wasBirthdayWishSentToday(customerId: string): Promise<boolean> {
  const db = getAdminDb();
  if (!db) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await db
      .collection(Collections.WHATSAPP_MESSAGES)
      .where('customerId', '==', customerId)
      .where('messageType', '==', 'text')
      .where('createdAt', '>=', today)
      .limit(1)
      .get();

    // Check if any message contains birthday keywords
    return snapshot.docs.some(doc => {
      const content = doc.data().content || '';
      return content.toLowerCase().includes('birthday') || content.includes('🎂');
    });
  } catch {
    return false;
  }
}
