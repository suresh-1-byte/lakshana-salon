// ═══════════════════════════════════════════════════════
//  Service Add-ons API (admin) — Firebase via /api/admin/service-addons
//  The add-ons offered with a service are stored on the service
//  document itself (`addonIds`).
// ═══════════════════════════════════════════════════════

import type { Service, ServiceAddon } from '@/types/database.types'
import { adminFetch, jsonBody } from './admin-fetch'

type ServiceWithAddons = Service & { addon_ids?: string[] }

export async function getAllAddons(activeOnly = true) {
  return adminFetch<ServiceAddon[]>(`/api/admin/service-addons${activeOnly ? '?active=true' : ''}`)
}

export async function getAddonById(id: string) {
  const addons = await getAllAddons(false)
  const addon = addons.find(a => a.id === id)
  if (!addon) throw new Error('Add-on not found')
  return addon
}

export async function createAddon(addon: Omit<ServiceAddon, 'id' | 'created_at' | 'updated_at'>) {
  return adminFetch<ServiceAddon>('/api/admin/service-addons', {
    method: 'POST',
    body: jsonBody(addon),
  })
}

export async function updateAddon(id: string, updates: Partial<ServiceAddon>) {
  return adminFetch<ServiceAddon>(`/api/admin/service-addons/${id}`, {
    method: 'PATCH',
    body: jsonBody(updates),
  })
}

export async function deleteAddon(id: string) {
  await adminFetch(`/api/admin/service-addons/${id}`, { method: 'DELETE' })
}

export async function getAddonsForService(serviceId: string) {
  const [service, addons] = await Promise.all([
    adminFetch<ServiceWithAddons>(`/api/admin/services/${serviceId}`),
    getAllAddons(false),
  ])
  const ids = service.addon_ids || []
  return addons.filter(a => ids.includes(a.id))
}

export async function bulkAssignAddonsToService(
  serviceId: string,
  addonIds: string[],
  _defaultAddonIds: string[] = []
) {
  await adminFetch(`/api/admin/services/${serviceId}`, {
    method: 'PATCH',
    body: jsonBody({ addon_ids: addonIds }),
  })
}

export async function assignAddonToService(serviceId: string, addonId: string) {
  const current = await getAddonsForService(serviceId)
  const ids = Array.from(new Set([...current.map(a => a.id), addonId]))
  await bulkAssignAddonsToService(serviceId, ids)
}

export async function removeAddonFromService(serviceId: string, addonId: string) {
  const current = await getAddonsForService(serviceId)
  await bulkAssignAddonsToService(serviceId, current.map(a => a.id).filter(id => id !== addonId))
}

export async function getServicesWithAddon(addonId: string) {
  const services = await adminFetch<ServiceWithAddons[]>('/api/admin/services')
  return services.filter(s => (s.addon_ids || []).includes(addonId))
}

export const getServiceAddons = getAllAddons
