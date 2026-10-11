// ═══════════════════════════════════════════════════════
//  Service Categories API (admin) — Firebase via /api/admin/service-categories
// ═══════════════════════════════════════════════════════

import type { Service, ServiceCategory } from '@/types/database.types'
import { adminFetch, jsonBody } from './admin-fetch'

export type CategoryWithCount = ServiceCategory & { service_count?: number }

export async function getAllCategories(activeOnly = true) {
  return adminFetch<CategoryWithCount[]>(
    `/api/admin/service-categories${activeOnly ? '?active=true' : ''}`
  )
}

export async function getCategoryById(id: string) {
  const categories = await getAllCategories(false)
  const category = categories.find(c => c.id === id)
  if (!category) throw new Error('Category not found')
  return category
}

export async function createCategory(category: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>) {
  return adminFetch<ServiceCategory>('/api/admin/service-categories', {
    method: 'POST',
    body: jsonBody(category),
  })
}

export async function updateCategory(id: string, updates: Partial<ServiceCategory>) {
  return adminFetch<ServiceCategory>(`/api/admin/service-categories/${id}`, {
    method: 'PATCH',
    body: jsonBody(updates),
  })
}

export async function deleteCategory(id: string) {
  await adminFetch(`/api/admin/service-categories/${id}`, { method: 'DELETE' })
}

export async function getServicesByCategory(categoryId: string) {
  return adminFetch<Service[]>(
    `/api/admin/services?active=true&categoryId=${encodeURIComponent(categoryId)}`
  )
}

export async function getCategoriesWithServices() {
  return adminFetch<Array<ServiceCategory & { services: Service[] }>>(
    '/api/admin/service-categories?active=true&withServices=true'
  )
}

export async function reorderCategories(categoryIds: string[]) {
  await Promise.all(
    categoryIds.map((id, index) => updateCategory(id, { display_order: index + 1 }))
  )
}
