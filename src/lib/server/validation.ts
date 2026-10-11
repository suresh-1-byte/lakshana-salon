// ═══════════════════════════════════════════════════════
//  Input validation & normalisation shared by API routes
// ═══════════════════════════════════════════════════════

/**
 * Canonical 10-digit key for an Indian mobile number, used to match the
 * same customer however the number was typed ("+91 98765 43210",
 * "098765-43210", "9876543210" → "9876543210"). Returns '' if there are
 * fewer than 10 digits.
 */
export function phoneKey(phone: unknown): string {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length < 10) return '';
  return digits.slice(-10);
}

export function isValidPhone(phone: unknown): boolean {
  return phoneKey(phone).length === 10;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: unknown): boolean {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email.trim());
}

/** Trim a value to a string of at most `max` characters ('' for non-strings). */
export function cleanString(value: unknown, max = 200): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/**
 * Validate a calendar date in YYYY-MM-DD form (date of birth / anniversary).
 * Rejects impossible dates (2025-02-30), years before 1900 and future dates.
 */
export function validatePastDate(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return { ok: false, error: 'Date must be in YYYY-MM-DD format' };
  }
  const v = value.trim();
  const [y, m, d] = v.split('-').map(Number);
  if (y < 1900) return { ok: false, error: 'Year must be 1900 or later' };
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return { ok: false, error: 'Date is not a real calendar date' };
  }
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (date.getTime() > todayUtc) return { ok: false, error: 'Date cannot be in the future' };
  return { ok: true, value: v };
}

/** Returns a valid YYYY-MM-DD past date, or null for empty/invalid input. */
export function optionalPastDate(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  const result = validatePastDate(value);
  return result.ok ? result.value : null;
}

/** Escape text for safe insertion into HTML emails. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape Telegram Markdown control characters. */
export function escapeMarkdown(value: unknown): string {
  return String(value ?? '').replace(/([_*`\[\]])/g, '\\$1');
}

/** A finite, non-negative number (or the fallback). */
export function nonNegativeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : fallback;
}
