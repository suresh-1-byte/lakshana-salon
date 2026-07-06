// ═══════════════════════════════════════════════════════
//  Service Categories API
// ═══════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client'
import type { ServiceCategory } from '@/types/database.types'

const supabase = createClient()

/**
 * Get all service categories
 */
export async function getAllCategories(activeOnly = true) {
  let query = supabase
    .from('service_categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (activeOnly) {
    query = query.eq('status', 'active')
  }

  const { data, error } = await query

  if (error) throw error
  return data as ServiceCategory[]
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ServiceCategory
}

/**
 * Create new category
 */
export async function createCategory(category: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('service_categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data as ServiceCategory
}

/**
 * Update category
 */
export async function updateCategory(id: string, updates: Partial<ServiceCategory>) {
  const { data, error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ServiceCategory
}

/**
 * Delete category (soft delete by setting status to inactive)
 */
export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('service_categories')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) throw error
}

/**
 * Get services by category
 */
export async function getServicesByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Get all categories with their services
 */
export async function getCategoriesWithServices() {
  const { data: categories, error: catError } = await supabase
    .from('service_categories')
    .select(`
      *,
      services:services(*)
    `)
    .eq('status', 'active')
    .order('display_order', { ascending: true })

  if (catError) throw catError

  // Filter active services and sort by display_order
  const categoriesWithServices = categories.map((category: any) => ({
    ...category,
    services: (category.services || [])
      .filter((service: any) => service.status === 'active')
      .sort((a: any, b: any) => a.display_order - b.display_order)
  }))

  return categoriesWithServices
}

/**
 * Reorder categories
 */
export async function reorderCategories(categoryIds: string[]) {
  const updates = categoryIds.map((id, index) => ({
    id,
    display_order: index + 1
  }))

  for (const update of updates) {
    await supabase
      .from('service_categories')
      .update({ display_order: update.display_order })
      .eq('id', update.id)
  }

  return { success: true }
}
