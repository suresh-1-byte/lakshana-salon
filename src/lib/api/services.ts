import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types/database.types'

const supabase = createClient()

export async function getAllServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'active')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as Service[]
}

export async function getServiceById(id: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Service
}

export async function getServicesByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as Service[]
}

export async function createService(service: Partial<Service>) {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single()

  if (error) throw error
  return data as Service
}

export async function updateService(id: string, updates: Partial<Service>) {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Service
}

export async function deleteService(id: string) {
  const { error } = await supabase
    .from('services')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) throw error
}

export const SERVICE_CATEGORIES = [
  'Threading',
  'Hair',
  'Makeup',
  'Facial',
  'Waxing',
  'Nails',
]
