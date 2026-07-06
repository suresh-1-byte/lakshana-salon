import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/database.types'

const supabase = createClient()

export async function getAllNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data as Notification[]
}

export async function getUnreadNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Notification[]
}

export async function createNotification(notification: Partial<Notification>) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

export async function markAsRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) throw error
}

export async function markAllAsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) throw error
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Notification creators
export async function notifyNewBooking(bookingId: string, customerName: string) {
  return createNotification({
    notification_type: 'new_booking',
    title: 'New Booking',
    message: `New booking from ${customerName}`,
    reference_id: bookingId,
    reference_type: 'appointment',
  })
}

export async function notifyNewCustomer(customerId: string, customerName: string) {
  return createNotification({
    notification_type: 'new_customer',
    title: 'New Customer',
    message: `${customerName} joined as a new customer`,
    reference_id: customerId,
    reference_type: 'customer',
  })
}

export async function notifyBirthday(customerId: string, customerName: string) {
  return createNotification({
    notification_type: 'birthday',
    title: 'Birthday Today',
    message: `${customerName} has a birthday today!`,
    reference_id: customerId,
    reference_type: 'customer',
  })
}

export async function notifyPendingPayment(appointmentId: string, customerName: string, amount: number) {
  return createNotification({
    notification_type: 'pending_payment',
    title: 'Pending Payment',
    message: `${customerName} has a pending payment of ₹${amount}`,
    reference_id: appointmentId,
    reference_type: 'appointment',
  })
}

export async function notifyNewEnquiry(enquiryId: string, name: string) {
  return createNotification({
    notification_type: 'new_enquiry',
    title: 'New Enquiry',
    message: `New enquiry from ${name}`,
    reference_id: enquiryId,
    reference_type: 'enquiry',
  })
}
