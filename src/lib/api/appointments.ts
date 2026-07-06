// ═══════════════════════════════════════════════════════
//  Appointments API - Supabase Implementation
// ═══════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';
import type { Appointment } from '@/types/database.types';

const supabase = createClient();

/**
 * Create appointment
 */
export async function createAppointment(data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Generate booking ID
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    const bookingId = `BK${String((count || 0) + 1).padStart(6, '0')}`;

    const appointmentData = {
      ...data,
      booking_id: bookingId,
    };

    const { data: result, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) throw error;

    return result as Appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

/**
 * Update appointment
 */
export async function updateAppointment(appointmentId: string, updates: Partial<Appointment>) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    return data as Appointment;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
}

/**
 * Get appointment by ID
 */
export async function getAppointment(appointmentId: string): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as Appointment;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return null;
  }
}

/**
 * Get all appointments with filters
 */
export async function getAppointments(filters?: {
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Appointment[]> {
  try {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (filters?.status) {
      query = query.eq('booking_status', filters.status);
    }

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters?.startDate) {
      query = query.gte('appointment_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('appointment_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

/**
 * Get today's appointments
 */
export async function getTodaysAppointments(): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0];
  return await getAppointments({ startDate: today, endDate: today });
}

/**
 * Delete appointment
 */
export async function deleteAppointment(appointmentId: string) {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}

/**
 * Mark appointment reminder as sent
 */
export async function markReminderSent(appointmentId: string) {
  return await updateAppointment(appointmentId, { 
    // reminderSent: true  // Add this field to schema if needed
  });
}


/**
 * Get upcoming appointments (next 7 days)
 */
export async function getUpcomingAppointments(days: number = 7): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const endDate = futureDate.toISOString().split('T')[0];
  
  return await getAppointments({ 
    startDate: today, 
    endDate: endDate,
    status: 'confirmed'
  });
}
