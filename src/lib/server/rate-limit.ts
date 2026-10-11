// ═══════════════════════════════════════════════════════
//  Simple fixed-window rate limiter backed by Firestore
//  (in-memory limits don't work on serverless: every request
//  can land on a fresh instance).
// ═══════════════════════════════════════════════════════

import { createHash } from 'crypto';
import { adminDb, FieldValue } from '@/lib/firebase-admin';

const COLLECTION = 'rate_limits';

/**
 * Count one hit for `bucket` + `key` and report whether the caller is over
 * `limit` hits in the current `windowSeconds` window. The key (usually an IP)
 * is hashed so no raw IPs are stored. Fails open if Firestore is unavailable,
 * so an outage never blocks real customers.
 */
export async function hitRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ limited: boolean; retryAfter: number }> {
  try {
    const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
    const id = createHash('sha256').update(`${bucket}:${key}:${windowStart}`).digest('hex').slice(0, 40);
    const ref = adminDb.collection(COLLECTION).doc(id);

    const count = await adminDb.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const next = (snap.exists ? snap.data()?.count || 0 : 0) + 1;
      tx.set(ref, {
        bucket,
        count: next,
        // Lets a Firestore TTL policy on `expiresAt` clean these up automatically
        expiresAt: new Date((windowStart + windowSeconds * 2) * 1000),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return next;
    });

    const retryAfter = windowStart + windowSeconds - Math.floor(Date.now() / 1000);
    return { limited: count > limit, retryAfter };
  } catch (err) {
    console.error('Rate limit check failed (allowing request):', (err as Error)?.message);
    return { limited: false, retryAfter: 0 };
  }
}

/** Clear a key's counter for the current window (e.g. after a successful login). */
export async function resetRateLimit(bucket: string, key: string, windowSeconds: number) {
  try {
    const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
    const id = createHash('sha256').update(`${bucket}:${key}:${windowStart}`).digest('hex').slice(0, 40);
    await adminDb.collection(COLLECTION).doc(id).delete();
  } catch {
    // non-critical
  }
}
