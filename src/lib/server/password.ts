// ═══════════════════════════════════════════════════════
//  Admin password storage (scrypt hashes, no plain text)
// ═══════════════════════════════════════════════════════

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { adminDb, Collections } from '@/lib/firebase-admin';

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LEN = 64;

/** "scrypt$<salt hex>$<hash hex>" */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LEN);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPasswordHash(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = String(stored).split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function safeEqualText(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Check the admin password. A password set from the admin panel
 * (hash in settings/admin) takes precedence over ADMIN_PASSWORD.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;
  try {
    const doc = await adminDb.collection(Collections.SETTINGS).doc('admin').get();
    const stored = doc.exists ? doc.data()?.adminPasswordHash : null;
    if (stored) return verifyPasswordHash(password, stored);
  } catch (err) {
    // Database unavailable: fall back to the environment password
    console.error('Could not read admin password hash:', (err as Error)?.message);
  }
  const envPassword = process.env.ADMIN_PASSWORD;
  return !!envPassword && safeEqualText(password, envPassword);
}
