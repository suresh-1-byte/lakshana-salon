// ═══════════════════════════════════════════════════════
//  Service Add-ons API
// ═══════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client'
import type { ServiceAddon, ServiceAddonMapping } from '@/types/database.types'

const supabase = createClient()

/**
 * Get all service add-ons
 */
export async function getAllAddons(activeOnly = true) {
  let query = supabase
    .from('service_addons')
    .select('*')
    .order('display_order', { ascending: true })

  if (activeOnly) {
    query = query.eq('status', 'active')
  }

  const { data, error } = await query

  if (error) throw error
  return data as ServiceAddon[]
}

/**
 * Get addon by ID
 */
export async function getAddonById(id: string) {
  const { data, error } = await supabase
    .from('service_addons')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ServiceAddon
}

/**
 * Create new addon
 */
export async function createAddon(addon: Omit<ServiceAddon, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('service_addons')
    .insert(addon)
    .select()
    .single()

  if (error) throw error
  return data as ServiceAddon
}

/**
 * Update addon
 */
export async function updateAddon(id: string, updates: Partial<ServiceAddon>) {
  const { data, error } = await supabase
    .from('service_addons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ServiceAddon
}

/**
 * Delete addon (soft delete)
 */
export async function deleteAddon(id: string) {
  const { error } = await supabase
    .from('service_addons')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) throw error
}

/**
 * Get addons for a specific service
 */
export async function getAddonsForService(serviceId: string) {
  const { data, error } = await supabase
    .from('service_addon_mappings')
    .select(`
      id,
      is_default,
      addon:service_addons(*)
    `)
    .eq('service_id', serviceId)

  if (error) throw error

  // Flatten the structure and filter active addons
  return data
    .map((mapping: any) => ({
      ...mapping.addon,
      is_default: mapping.is_default,
      mapping_id: mapping.id,
    }))
    .filter((addon: any) => addon.status === 'active')
}

/**
 * Assign addon to service
 */
export async function assignAddonToService(serviceId: string, addonId: string, isDefault = false) {
  const { data, error } = await supabase
    .from('service_addon_mappings')
    .insert({
      service_id: serviceId,
      addon_id: addonId,
      is_default: isDefault,
    })
    .select()
    .single()

  if (error) {
    // If conflict, update instead
    if (error.code === '23505') {
      const { data: updateData, error: updateError } = await supabase
        .from('service_addon_mappings')
        .update({ is_default: isDefault })
        .eq('service_id', serviceId)
        .eq('addon_id', addonId)
        .select()
        .single()

      if (updateError) throw updateError
      return updateData
    }
    throw error
  }

  return data
}

/**
 * Remove addon from service
 */
export async function removeAddonFromService(serviceId: string, addonId: string) {
  const { error } = await supabase
    .from('service_addon_mappings')
    .delete()
    .eq('service_id', serviceId)
    .eq('addon_id', addonId)

  if (error) throw error
}

/**
 * Get all services that have a specific addon
 */
export async function getServicesWithAddon(addonId: string) {
  const { data, error } = await supabase
    .from('service_addon_mappings')
    .select(`
      service:services(*)
    `)
    .eq('addon_id', addonId)

  if (error) throw error

  return data.map((mapping: any) => mapping.service)
}

/**
 * Bulk assign addons to service
 */
export async function bulkAssignAddonsToService(
  serviceId: string,
  addonIds: string[],
  defaultAddonIds: string[] = []
) {
  // First, remove all existing mappings
  await supabase
    .from('service_addon_mappings')
    .delete()
    .eq('service_id', serviceId)

  // Then, insert new mappings
  const mappings = addonIds.map(addonId => ({
    service_id: serviceId,
    addon_id: addonId,
    is_default: defaultAddonIds.includes(addonId),
  }))

  if (mappings.length === 0) return []

  const { data, error } = await supabase
    .from('service_addon_mappings')
    .insert(mappings)
    .select()

  if (error) throw error
  return data
}


// Alias for backward compatibility
export const getServiceAddons = getAllAddons;
