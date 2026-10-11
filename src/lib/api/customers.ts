// ═══════════════════════════════════════════════════════
//  Customers API (admin) — Firebase via /api/admin/customers
//  Returns the snake_case `Customer` shape the admin forms use.
// ═══════════════════════════════════════════════════════

import type { Customer } from '@/types/database.types'
import { adminFetch, jsonBody } from './admin-fetch'

type ApiCustomer = {
  id: string
  name: string
  phone: string
  whatsappNumber?: string
  email?: string
  dateOfBirth?: string
  anniversary?: string
  gender?: string
  address?: string
  city?: string
  notes?: string
  preferredStylist?: string
  totalVisits?: number
  totalSpent?: number
  lastVisit?: string | null
  status?: string
  createdAt?: string | null
  updatedAt?: string | null
}

/** API customer → admin form shape. Keeps the camelCase fields too. */
function toCustomer(c: ApiCustomer): Customer & { name: string; phone: string } {
  return {
    ...(c as Omit<ApiCustomer, 'email' | 'anniversary' | 'gender' | 'address' | 'city' | 'notes' | 'status'>),
    customer_id: c.id.slice(-6).toUpperCase(),
    full_name: c.name,
    mobile_number: c.phone,
    whatsapp_number: c.whatsappNumber || null,
    email: c.email || null,
    date_of_birth: c.dateOfBirth || null,
    anniversary: c.anniversary || null,
    gender: (c.gender as Customer['gender']) || null,
    address: c.address || null,
    city: c.city || null,
    notes: c.notes || null,
    member_since: c.createdAt || '',
    preferred_stylist: c.preferredStylist || null,
    preferred_services: null,
    customer_photo: null,
    total_visits: c.totalVisits || 0,
    total_spent: c.totalSpent || 0,
    last_visit: c.lastVisit || null,
    status: (c.status as Customer['status']) || 'active',
    created_at: c.createdAt || '',
    updated_at: c.updatedAt || '',
  }
}

export async function getAllCustomers() {
  const data = await adminFetch<ApiCustomer[]>('/api/admin/customers')
  return data.map(toCustomer)
}

export const getCustomers = getAllCustomers

export async function getCustomerById(id: string) {
  const data = await adminFetch<{ profile: ApiCustomer }>(`/api/admin/customers/${id}`)
  return toCustomer((data as any).profile ?? data)
}

/** Find a customer by mobile number (any formatting). Returns null if none. */
export async function getCustomerByMobile(mobile: string) {
  const data = await adminFetch<ApiCustomer[]>(
    `/api/admin/customers?phone=${encodeURIComponent(mobile)}`
  )
  return data.length ? toCustomer(data[0]) : null
}

export async function createCustomer(customer: Partial<Customer> & Record<string, unknown>) {
  const data = await adminFetch<ApiCustomer>('/api/admin/customers', {
    method: 'POST',
    body: jsonBody(customer),
  })
  return toCustomer(data)
}

export async function updateCustomer(id: string, updates: Partial<Customer> & Record<string, unknown>) {
  const data = await adminFetch<ApiCustomer>(`/api/admin/customers/${id}`, {
    method: 'PATCH',
    body: jsonBody(updates),
  })
  return toCustomer(data)
}

export async function deleteCustomer(id: string) {
  await adminFetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
}

export async function restoreCustomer(id: string) {
  await adminFetch(`/api/admin/customers/${id}`, {
    method: 'PATCH',
    body: jsonBody({ action: 'restore' }),
  })
}

export async function searchCustomers(query: string) {
  const data = await adminFetch<ApiCustomer[]>(
    `/api/admin/customers?search=${encodeURIComponent(query)}`
  )
  return data.map(toCustomer)
}

export async function getCustomerStats(customerId: string) {
  const customer = await getCustomerById(customerId)
  return {
    totalVisits: customer.total_visits,
    totalSpent: customer.total_spent,
    lastVisit: customer.last_visit,
  }
}

export async function getTodaysBirthdays() {
  const today = new Date()
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const customers = await getAllCustomers()
  return customers.filter(c => c.date_of_birth?.slice(5, 10) === mmdd)
}
