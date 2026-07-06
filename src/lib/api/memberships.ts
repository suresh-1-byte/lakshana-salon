// ═══════════════════════════════════════════════════════
//  Memberships API - Supabase Implementation
// ═══════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';
import type { Membership } from '@/types/database.types';

const supabase = createClient();

/**
 * Get all memberships
 */
export async function getAllMemberships(activeOnly = false): Promise<Membership[]> {
  try {
    let query = supabase
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Membership[];
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return [];
  }
}

/**
 * Get membership by ID
 */
export async function getMembershipById(id: string): Promise<Membership | null> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Membership;
  } catch (error) {
    console.error('Error fetching membership:', error);
    return null;
  }
}

/**
 * Get membership by customer ID
 */
export async function getMembershipByCustomerId(customerId: string): Promise<Membership | null> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Membership;
  } catch (error) {
    console.error('Error fetching customer membership:', error);
    return null;
  }
}

/**
 * Create membership
 */
export async function createMembership(data: Omit<Membership, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Generate member card number
    const { count } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true });

    const memberCardNumber = `MEM${String((count || 0) + 1).padStart(6, '0')}`;

    const membershipData = {
      ...data,
      member_card_number: memberCardNumber,
    };

    const { data: result, error } = await supabase
      .from('memberships')
      .insert(membershipData)
      .select()
      .single();

    if (error) throw error;
    return result as Membership;
  } catch (error) {
    console.error('Error creating membership:', error);
    throw error;
  }
}

/**
 * Update membership
 */
export async function updateMembership(id: string, updates: Partial<Membership>) {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Membership;
  } catch (error) {
    console.error('Error updating membership:', error);
    throw error;
  }
}

/**
 * Cancel membership
 */
export async function cancelMembership(id: string) {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Membership;
  } catch (error) {
    console.error('Error cancelling membership:', error);
    throw error;
  }
}

/**
 * Renew membership
 */
export async function renewMembership(id: string, expiryDate: string) {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .update({
        expiry_date: expiryDate,
        status: 'active',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Membership;
  } catch (error) {
    console.error('Error renewing membership:', error);
    throw error;
  }
}

/**
 * Check and update expired memberships
 */
export async function checkExpiredMemberships() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('memberships')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expiry_date', today)
      .select();

    if (error) throw error;
    return data as Membership[];
  } catch (error) {
    console.error('Error checking expired memberships:', error);
    return [];
  }
}

/**
 * Get expiring soon memberships (within 30 days)
 */
export async function getExpiringSoonMemberships(): Promise<Membership[]> {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('status', 'active')
      .lte('expiry_date', thirtyDaysLater)
      .gte('expiry_date', new Date().toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return (data || []) as Membership[];
  } catch (error) {
    console.error('Error fetching expiring memberships:', error);
    return [];
  }
}

/**
 * Get membership statistics
 */
export async function getMembershipStats() {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('membership_type, status');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(m => m.status === 'active').length,
      expired: data.filter(m => m.status === 'expired').length,
      cancelled: data.filter(m => m.status === 'cancelled').length,
      silver: data.filter(m => m.membership_type === 'Silver').length,
      gold: data.filter(m => m.membership_type === 'Gold').length,
      premium: data.filter(m => m.membership_type === 'Premium').length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching membership stats:', error);
    return {
      total: 0,
      active: 0,
      expired: 0,
      cancelled: 0,
      silver: 0,
      gold: 0,
      premium: 0,
    };
  }
}
