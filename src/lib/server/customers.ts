// ═══════════════════════════════════════════════════════
//  Customer helpers shared by the /api/admin/customers routes
// ═══════════════════════════════════════════════════════

import { toIso } from '@/lib/server/admin-catalog';
import { isValidEmail, isValidPhone, phoneKey, validatePastDate } from '@/lib/server/validation';

export function isDeletedCustomer(d: any): boolean {
  return d?.isDeleted === true || d?.status === 'deleted';
}

/** Firestore customer doc → JSON for the admin UI */
export function serializeCustomer(id: string, d: any) {
  return {
    id,
    name: d.name || '',
    phone: d.phone || '',
    whatsappNumber: d.whatsappNumber || '',
    email: d.email || '',
    dateOfBirth: d.dateOfBirth || '',
    anniversary: d.anniversary || '',
    gender: d.gender || '',
    address: d.address || '',
    city: d.city || '',
    notes: d.notes || '',
    preferredStylist: d.preferredStylist || '',
    totalVisits: d.totalVisits || 0,
    totalSpent: d.totalSpent || 0,
    loyaltyStatus: d.loyaltyStatus || 'Bronze',
    status: isDeletedCustomer(d) ? 'deleted' : d.status || 'active',
    lastVisit: toIso(d.lastVisit),
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
  };
}

const FIELD_MAP: Record<string, string> = {
  // camelCase (Firestore) ← accepted request keys
  name: 'name',
  full_name: 'name',
  phone: 'phone',
  mobile_number: 'phone',
  whatsappNumber: 'whatsappNumber',
  whatsapp_number: 'whatsappNumber',
  email: 'email',
  dateOfBirth: 'dateOfBirth',
  date_of_birth: 'dateOfBirth',
  anniversary: 'anniversary',
  gender: 'gender',
  address: 'address',
  city: 'city',
  notes: 'notes',
  preferredStylist: 'preferredStylist',
  preferred_stylist: 'preferredStylist',
};

/** Request body (snake_case or camelCase) → Firestore customer fields */
export function customerFieldsFromBody(body: any): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, field] of Object.entries(FIELD_MAP)) {
    if (body[key] !== undefined && body[key] !== null) {
      out[field] = (typeof body[key] === 'string' ? body[key].trim() : String(body[key])).slice(0, field === 'notes' || field === 'address' ? 1000 : 120);
    }
  }
  return out;
}

/** 10-digit key used to match phone numbers typed in different formats */
export const phoneDigits = phoneKey;

/**
 * Validate cleaned customer fields. Returns an error message, or null when
 * everything is acceptable. Empty optional fields are allowed.
 */
export function customerFieldsError(fields: Record<string, string>): string | null {
  if (fields.name !== undefined && (fields.name.length < 2 || fields.name.length > 80)) {
    return 'Name must be 2–80 characters';
  }
  if (fields.phone !== undefined && !isValidPhone(fields.phone)) {
    return 'Enter a valid 10-digit mobile number';
  }
  if (fields.whatsappNumber && !isValidPhone(fields.whatsappNumber)) {
    return 'Enter a valid 10-digit WhatsApp number';
  }
  if (fields.email && !isValidEmail(fields.email)) {
    return 'Enter a valid email address';
  }
  for (const [key, label] of [['dateOfBirth', 'Date of birth'], ['anniversary', 'Anniversary']] as const) {
    if (fields[key]) {
      const result = validatePastDate(fields[key]);
      if (!result.ok) return `${label}: ${result.error}`;
    }
  }
  if (fields.gender && !['Male', 'Female', 'Other'].includes(fields.gender)) {
    return 'Gender must be Male, Female or Other';
  }
  return null;
}
