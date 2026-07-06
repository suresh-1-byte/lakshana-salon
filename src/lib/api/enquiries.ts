import { createClient } from '@/lib/supabase/client'
import type { Enquiry } from '@/types/database.types'

const supabase = createClient()

export async function getAllEnquiries() {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Enquiry[]
}

export async function getEnquiryById(id: string) {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Enquiry
}

export async function createEnquiry(enquiry: Partial<Enquiry>) {
  const { data, error } = await supabase
    .from('enquiries')
    .insert(enquiry)
    .select()
    .single()

  if (error) throw error
  return data as Enquiry
}

export async function updateEnquiry(id: string, updates: Partial<Enquiry>) {
  const { data, error } = await supabase
    .from('enquiries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Enquiry
}

export async function deleteEnquiry(id: string) {
  const { error } = await supabase
    .from('enquiries')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function convertEnquiryToBooking(enquiryId: string) {
  const enquiry = await getEnquiryById(enquiryId)
  
  // Update enquiry status
  await updateEnquiry(enquiryId, { status: 'converted' })
  
  return enquiry
}
