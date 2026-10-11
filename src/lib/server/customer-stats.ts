// ═══════════════════════════════════════════════════════
//  Customer visit & spending totals
//  Rule: a visit = a paid bill. totalSpent = sum of paid bills.
//  Booking requests never change these numbers.
// ═══════════════════════════════════════════════════════

import { adminDb, Collections, FieldValue } from '@/lib/firebase-admin';

export function loyaltyFor(totalSpent: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
  if (totalSpent >= 50000) return 'Platinum';
  if (totalSpent >= 20000) return 'Gold';
  if (totalSpent >= 5000) return 'Silver';
  return 'Bronze';
}

/** A bill counts toward totals only while it is paid. */
export function billCounts(bill: { status?: string } | undefined | null): boolean {
  return (bill?.status || 'paid') === 'paid';
}

/**
 * Add (direction = 1) or remove (direction = -1) one paid bill from the
 * customer's totals inside a transaction, then refresh the loyalty tier.
 */
export async function applyBillToCustomer(
  customerId: string | undefined | null,
  billTotal: number,
  direction: 1 | -1
) {
  if (!customerId) return;
  const amount = Number.isFinite(billTotal) ? Math.max(0, billTotal) : 0;
  const ref = adminDb.collection(Collections.CUSTOMERS).doc(customerId);

  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const d = snap.data() || {};
    const totalSpent = Math.max(0, (Number(d.totalSpent) || 0) + direction * amount);
    const totalVisits = Math.max(0, (Number(d.totalVisits) || 0) + direction);
    const update: { [field: string]: any } = {
      totalSpent,
      totalVisits,
      loyaltyStatus: loyaltyFor(totalSpent),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (direction === 1) update.lastVisit = FieldValue.serverTimestamp();
    tx.update(ref, update);
  });
}
