// ═══════════════════════════════════════════════════════
//  Services API (admin) — backed by Firebase via /api/admin/services
// ═══════════════════════════════════════════════════════

import type { Service } from '@/types/database.types'
import { adminFetch, jsonBody } from './admin-fetch'

export async function getAllServices(activeOnly = false) {
  return adminFetch<Service[]>(`/api/admin/services${activeOnly ? '?active=true' : ''}`)
}

export async function getServiceById(id: string) {
  return adminFetch<Service>(`/api/admin/services/${id}`)
}

export async function getServicesByCategory(categoryId: string) {
  return adminFetch<Service[]>(
    `/api/admin/services?active=true&categoryId=${encodeURIComponent(categoryId)}`
  )
}

export async function createService(service: Partial<Service> & Record<string, unknown>) {
  return adminFetch<Service>('/api/admin/services', {
    method: 'POST',
    body: jsonBody(service),
  })
}

export async function updateService(id: string, updates: Partial<Service> & Record<string, unknown>) {
  return adminFetch<Service>(`/api/admin/services/${id}`, {
    method: 'PATCH',
    body: jsonBody(updates),
  })
}

export async function deleteService(id: string) {
  await adminFetch(`/api/admin/services/${id}`, { method: 'DELETE' })
}

export const SERVICE_CATEGORIES = [
  'Threading',
  'Hair',
  'Makeup',
  'Facial',
  'Waxing',
  'Nails',
]
