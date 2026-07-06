// ═══════════════════════════════════════════════════════
//  Packages API - Supabase Implementation
// ═══════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';
import type { Package, CustomerPackage } from '@/types/database.types';

const supabase = createClient();

/**
 * Get all packages
 */
export async function getPackages(activeOnly = false): Promise<Package[]> {
  try {
    let query = supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Package[];
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

/**
 * Get package by ID
 */
export async function getPackage(packageId: string): Promise<Package | null> {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Package;
  } catch (error) {
    console.error('Error fetching package:', error);
    return null;
  }
}

/**
 * Create package
 */
export async function createPackage(data: Omit<Package, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data: result, error } = await supabase
      .from('packages')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as Package;
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
}

/**
 * Update package
 */
export async function updatePackage(packageId: string, updates: Partial<Package>) {
  try {
    const { data, error } = await supabase
      .from('packages')
      .update(updates)
      .eq('id', packageId)
      .select()
      .single();

    if (error) throw error;
    return data as Package;
  } catch (error) {
    console.error('Error updating package:', error);
    throw error;
  }
}

/**
 * Delete package (soft delete)
 */
export async function deletePackage(packageId: string) {
  try {
    const { error } = await supabase
      .from('packages')
      .update({ status: 'inactive' })
      .eq('id', packageId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting package:', error);
    throw error;
  }
}

/**
 * Assign package to customer
 */
export async function assignPackageToCustomer(data: {
  customerId: string;
  packageId: string;
  purchaseDate: string;
  expiryDate: string;
  totalSessions: number;
  amountPaid: number;
}) {
  try {
    const customerPackageData = {
      customer_id: data.customerId,
      package_id: data.packageId,
      purchase_date: data.purchaseDate,
      expiry_date: data.expiryDate,
      total_sessions: data.totalSessions,
      remaining_sessions: data.totalSessions,
      amount_paid: data.amountPaid,
      status: 'active',
    };

    const { data: result, error } = await supabase
      .from('customer_packages')
      .insert(customerPackageData)
      .select()
      .single();

    if (error) throw error;
    return result as CustomerPackage;
  } catch (error) {
    console.error('Error assigning package:', error);
    throw error;
  }
}

/**
 * Use package session
 */
export async function usePackageSession(customerPackageId: string, service: string, notes?: string) {
  try {
    // Get current package
    const { data: pkg, error: fetchError } = await supabase
      .from('customer_packages')
      .select('*')
      .eq('id', customerPackageId)
      .single();

    if (fetchError) throw fetchError;

    if (!pkg || pkg.remaining_sessions <= 0) {
      throw new Error('No sessions remaining');
    }

    // Update remaining sessions
    const newRemaining = pkg.remaining_sessions - 1;
    const { data, error } = await supabase
      .from('customer_packages')
      .update({
        remaining_sessions: newRemaining,
        status: newRemaining === 0 ? 'completed' : pkg.status,
      })
      .eq('id', customerPackageId)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerPackage;
  } catch (error) {
    console.error('Error using package session:', error);
    throw error;
  }
}

/**
 * Get customer packages
 */
export async function getCustomerPackages(customerId: string): Promise<CustomerPackage[]> {
  try {
    const { data, error } = await supabase
      .from('customer_packages')
      .select(`
        *,
        package:packages(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CustomerPackage[];
  } catch (error) {
    console.error('Error fetching customer packages:', error);
    return [];
  }
}

/**
 * Get all active packages for a customer
 */
export async function getActiveCustomerPackages(customerId: string): Promise<CustomerPackage[]> {
  try {
    const { data, error } = await supabase
      .from('customer_packages')
      .select(`
        *,
        package:packages(*)
      `)
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .gt('remaining_sessions', 0)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return (data || []) as CustomerPackage[];
  } catch (error) {
    console.error('Error fetching active customer packages:', error);
    return [];
  }
}
