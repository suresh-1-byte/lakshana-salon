// ═══════════════════════════════════════════════════════
//  Push notification targets
// ═══════════════════════════════════════════════════════

import { adminDb, Collections } from '@/lib/firebase-admin';

/** Emails whose devices count as the salon admin's (for older tokens without a role). */
function adminEmails(): Set<string> {
  return new Set(
    [process.env.ADMIN_EMAIL, process.env.ADMIN_NOTIFICATION_EMAIL]
      .filter(Boolean)
      .map(e => String(e).trim().toLowerCase())
  );
}

/**
 * Push tokens of the salon admin's devices only. Website visitors can also
 * subscribe to notifications; they must never receive admin alerts that
 * contain customer names.
 *
 * A token counts as admin when it was registered while logged in to the
 * admin panel (role: 'admin'), or — for tokens saved before roles existed —
 * when it was registered with the admin's email address.
 */
export async function getAdminPushTokens(): Promise<string[]> {
  const emails = adminEmails();
  const snap = await adminDb.collection(Collections.FCM_TOKENS).get();
  return snap.docs
    .map((d: any) => d.data())
    .filter((t: any) => t.token && (t.role === 'admin' || (t.email && emails.has(String(t.email).toLowerCase()))))
    .map((t: any) => t.token as string);
}
