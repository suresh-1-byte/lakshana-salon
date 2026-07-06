import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types/database.types'

const supabase = createClient()

export async function getAllCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Customer[]
}

// Alias for backward compatibility
export const getCustomers = getAllCustomers;

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Customer
}

export async function getCustomerByMobile(mobile: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('mobile_number', mobile)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Customer | null
}

export async function createCustomer(customer: Partial<Customer>) {
  // Generate customer ID
  const customerCount = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })

  const customerId = `CUST${String((customerCount.count || 0) + 1).padStart(6, '0')}`

  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customer,
      customer_id: customerId,
      member_since: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as Customer
}

export async function updateCustomer(id: string, updates: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Customer
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .update({ status: 'deleted' })
    .eq('id', id)

  if (error) throw error
}

export async function searchCustomers(query: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`full_name.ilike.%${query}%,mobile_number.ilike.%${query}%,email.ilike.%${query}%`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Customer[]
}

export async function getCustomerStats(customerId: string) {
  // Get total visits
  const { count: totalVisits } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .eq('booking_status', 'completed')

  // Get total spent
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('customer_id', customerId)
    .eq('payment_status', 'paid')

  const totalSpent = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Get last visit
  const { data: lastAppointment } = await supabase
    .from('appointments')
    .select('appointment_date')
    .eq('customer_id', customerId)
    .eq('booking_status', 'completed')
    .order('appointment_date', { ascending: false })
    .limit(1)
    .single()

  // Get upcoming appointment
  const { data: upcomingAppointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', customerId)
    .eq('booking_status', 'confirmed')
    .gte('appointment_date', new Date().toISOString().split('T')[0])
    .order('appointment_date', { ascending: true })
    .limit(1)
    .single()

  return {
    totalVisits: totalVisits || 0,
    totalSpent,
    lastVisit: lastAppointment?.appointment_date || null,
    upcomingAppointment: upcomingAppointment || null,
  }
}

export async function getTodaysBirthdays() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .not('date_of_birth', 'is', null)
    .eq('status', 'active')

  if (error) throw error

  // Filter birthdays in JavaScript since Supabase doesn't support day/month extraction easily
  return (data as Customer[]).filter(customer => {
    if (!customer.date_of_birth) return false
    const dob = new Date(customer.date_of_birth)
    const dobMonth = String(dob.getMonth() + 1).padStart(2, '0')
    const dobDay = String(dob.getDate()).padStart(2, '0')
    return dobMonth === month && dobDay === day
  })
}
