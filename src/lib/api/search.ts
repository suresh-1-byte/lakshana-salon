// ═══════════════════════════════════════════════════════
//  Global Search API - Supabase Implementation
// ═══════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .eq('status', 'active');

    if (customers) {
      customers.forEach(customer => {
        if (
          customer.full_name?.toLowerCase().includes(searchTerm) ||
          customer.mobile_number?.includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            type: 'customer',
            id: customer.id,
            title: customer.full_name,
            subtitle: customer.mobile_number,
            metadata: customer.email,
            url: `/admin/customers/${customer.id}`,
          });
        }
      });
    }

    // Search appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (
          full_name,
          mobile_number
        )
      `);

    if (appointments) {
      appointments.forEach(appointment => {
        const customerName = appointment.customers?.full_name || '';
        const customerPhone = appointment.customers?.mobile_number || '';
        
        if (
          appointment.id.toLowerCase().includes(searchTerm) ||
          appointment.booking_id?.toLowerCase().includes(searchTerm) ||
          customerName.toLowerCase().includes(searchTerm) ||
          customerPhone.includes(searchTerm)
        ) {
          results.push({
            type: 'appointment',
            id: appointment.id,
            title: `Appointment: ${customerName}`,
            subtitle: `${appointment.appointment_date} - ${appointment.booking_status}`,
            metadata: customerPhone,
            url: `/admin/appointments/${appointment.id}`,
          });
        }
      });
    }

    // Search payments by invoice number
    const { data: payments } = await supabase
      .from('payments')
      .select(`
        *,
        customers (
          full_name,
          mobile_number
        )
      `);

    if (payments) {
      payments.forEach(payment => {
        const customerName = payment.customers?.full_name || '';
        const customerPhone = payment.customers?.mobile_number || '';
        
        if (
          payment.invoice_number?.toLowerCase().includes(searchTerm) ||
          customerName.toLowerCase().includes(searchTerm) ||
          customerPhone.includes(searchTerm)
        ) {
          results.push({
            type: 'payment',
            id: payment.id,
            title: `Invoice #${payment.invoice_number}`,
            subtitle: customerName,
            metadata: `₹${payment.amount?.toLocaleString()}`,
            url: `/admin/billing/${payment.id}`,
          });
        }
      });
    }

    // Search memberships
    const { data: memberships } = await supabase
      .from('memberships')
      .select(`
        *,
        customers (
          full_name,
          mobile_number
        )
      `);

    if (memberships) {
      memberships.forEach(membership => {
        const customerName = membership.customers?.full_name || '';
        const customerPhone = membership.customers?.mobile_number || '';
        
        if (
          customerName.toLowerCase().includes(searchTerm) ||
          membership.member_card_number?.includes(searchTerm) ||
          customerPhone.includes(searchTerm)
        ) {
          results.push({
            type: 'membership',
            id: membership.id,
            title: `${membership.membership_type} Membership: ${customerName}`,
            subtitle: `Expires: ${new Date(membership.expiry_date).toLocaleDateString()}`,
            metadata: membership.status,
            url: `/admin/memberships/${membership.id}`,
          });
        }
      });
    }

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
