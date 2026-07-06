import { createClient } from '@/lib/supabase/client'
import type { Payment } from '@/types/database.types'

const supabase = createClient()

export async function getAllPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      customers:customer_id(full_name, mobile_number),
      appointments:appointment_id(booking_id)
    `)
    .order('payment_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getPaymentById(id: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      customers:customer_id(full_name, mobile_number, email),
      appointments:appointment_id(booking_id, service_id)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPayment(payment: Partial<Payment>) {
  // Generate invoice number
  const paymentCount = await supabase
    .from('payments')
    .select('id', { count: 'exact', head: true })

  const invoiceNumber = `INV${String((paymentCount.count || 0) + 1).padStart(6, '0')}`

  const { data, error } = await supabase
    .from('payments')
    .insert({
      ...payment,
      invoice_number: invoiceNumber,
      payment_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // Update appointment payment status if applicable
  if (payment.appointment_id) {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('total_amount, advance_amount')
      .eq('id', payment.appointment_id)
      .single()

    if (appointment) {
      const totalPaid = Number(appointment.advance_amount) + Number(payment.amount || 0)
      const paymentStatus =
        totalPaid >= Number(appointment.total_amount)
          ? 'paid'
          : totalPaid > 0
          ? 'partial'
          : 'pending'

      await supabase
        .from('appointments')
        .update({
          payment_status: paymentStatus,
          balance_amount: Number(appointment.total_amount) - totalPaid,
        })
        .eq('id', payment.appointment_id)
    }
  }

  // Update customer total spent
  if (payment.customer_id) {
    const { data: customer } = await supabase
      .from('customers')
      .select('total_spent')
      .eq('id', payment.customer_id)
      .single()

    if (customer) {
      await supabase
        .from('customers')
        .update({
          total_spent: Number(customer.total_spent) + Number(payment.amount || 0),
        })
        .eq('id', payment.customer_id)
    }
  }

  return data as Payment
}

export async function getPaymentsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      appointments:appointment_id(booking_id)
    `)
    .eq('customer_id', customerId)
    .order('payment_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getTodaysPayments() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      customers:customer_id(full_name, mobile_number)
    `)
    .gte('payment_date', `${today}T00:00:00`)
    .lte('payment_date', `${today}T23:59:59`)
    .order('payment_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getPaymentStats(startDate?: string, endDate?: string) {
  let query = supabase.from('payments').select('amount, payment_status')

  if (startDate) {
    query = query.gte('payment_date', startDate)
  }
  if (endDate) {
    query = query.lte('payment_date', endDate)
  }

  const { data, error } = await query

  if (error) throw error

  const totalRevenue = data?.reduce((sum, p) => {
    return p.payment_status === 'paid' ? sum + Number(p.amount) : sum
  }, 0) || 0

  const totalTransactions = data?.filter(p => p.payment_status === 'paid').length || 0

  return {
    totalRevenue,
    totalTransactions,
  }
}
