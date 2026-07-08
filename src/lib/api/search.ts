// ═══════════════════════════════════════════════════════
//  Global Search API - Firebase Implementation
// ═══════════════════════════════════════════════════════

import { adminDb, Collections } from '@/lib/firebase-admin';

export interface SearchResult {
  type: 'customer' | 'booking' | 'payment' | 'appointment' | 'membership';
  id: string;
  title: string;
  subtitle: string;
  metadata?: string;
  url: string;
}

/**
 * Global search across all entities
 */
export async function globalSearch(query: string, limit = 20): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    // Search customers by name, phone, email
    const customersSnapshot = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('status', '==', 'active')
      .get();

    customersSnapshot.forEach(doc => {
      const customer = doc.data();
      if (
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          type: 'customer',
          id: doc.id,
          title: customer.name,
          subtitle: customer.phone,
          metadata: customer.email,
          url: `/admin/customers/${doc.id}`,
        });
      }
    });

    // Search bookings
    const bookingsSnapshot = await adminDb
      .collection(Collections.BOOKINGS)
      .get();

    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      if (
        doc.id.toLowerCase().includes(searchTerm) ||
        booking.customerName?.toLowerCase().includes(searchTerm) ||
        booking.customerPhone?.includes(searchTerm)
      ) {
        results.push({
          type: 'booking',
          id: doc.id,
          title: `Booking: ${booking.customerName}`,
          subtitle: `${booking.date} - ${booking.status}`,
          metadata: booking.customerPhone,
          url: `/admin/bookings/${doc.id}`,
        });
      }
    });

    // Search payments/billing by invoice number
    const paymentsSnapshot = await adminDb
      .collection(Collections.BILLING)
      .get();

    paymentsSnapshot.forEach(doc => {
      const payment = doc.data();
      if (
        payment.invoiceNumber?.toLowerCase().includes(searchTerm) ||
        payment.customerName?.toLowerCase().includes(searchTerm) ||
        payment.customerPhone?.includes(searchTerm)
      ) {
        results.push({
          type: 'payment',
          id: doc.id,
          title: `Invoice #${payment.invoiceNumber}`,
          subtitle: payment.customerName,
          metadata: `₹${payment.totalAmount?.toLocaleString()}`,
          url: `/admin/billing/${doc.id}`,
        });
      }
    });

    // Search memberships
    const membershipsSnapshot = await adminDb
      .collection(Collections.MEMBERSHIP_WALLETS)
      .get();

    membershipsSnapshot.forEach(doc => {
      const membership = doc.data();
      const customerName = membership.customerName || '';
      const customerPhone = membership.customerPhone || '';
      
      if (
        customerName.toLowerCase().includes(searchTerm) ||
        membership.membershipId?.includes(searchTerm) ||
        customerPhone.includes(searchTerm)
      ) {
        results.push({
          type: 'membership',
          id: doc.id,
          title: `${membership.packageName}: ${customerName}`,
          subtitle: `Status: ${membership.status}`,
          metadata: `Balance: ₹${membership.availableBalance?.toLocaleString()}`,
          url: `/admin/membership`,
        });
      }
    });

    // Sort by relevance (exact matches first) and limit
    return results
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === searchTerm;
        const bExact = b.title.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      })
      .slice(0, limit);

  } catch (error) {
    console.error('Error performing global search:', error);
    return [];
  }
}

/**
 * Quick search for autocomplete
 */
export async function quickSearch(query: string, type?: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  
  const results = await globalSearch(query, 10);
  
  if (type) {
    return results.filter(r => r.type === type);
  }
  
  return results;
}
