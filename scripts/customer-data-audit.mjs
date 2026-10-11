#!/usr/bin/env node
// ═══════════════════════════════════════════════════════
//  Customer data audit (and optional repair)
//
//  Default = REPORT ONLY. Nothing is written.
//    $env:FIREBASE_SERVICE_ACCOUNT_FILE = "C:\secure\lakshana-service-account.json"
//    node scripts/customer-data-audit.mjs
//
//  Reports (counts and document IDs only — no names or phone numbers):
//   - customers missing `phoneKey` (normalised 10-digit phone)
//   - customers sharing the same phone number (possible duplicates)
//   - invalid dates of birth / anniversaries
//   - visit/spending totals that don't match their paid bills
//
//  Repair (only after a backup, both flags required):
//    node scripts/customer-data-audit.mjs --apply --i-have-a-backup
//  Sets phoneKey, and recalculates totalVisits / totalSpent / loyaltyStatus
//  / lastVisit from paid bills. It NEVER deletes, merges or edits names,
//  phone numbers or dates — duplicates and bad dates are only reported so
//  they can be fixed by hand in the admin panel.
// ═══════════════════════════════════════════════════════

import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const APPLY = process.argv.includes('--apply');
if (APPLY && !process.argv.includes('--i-have-a-backup')) {
  console.error('Refusing to write: run scripts/firestore-backup.mjs first, then add --i-have-a-backup.');
  process.exit(1);
}


// Credentials: a service-account JSON file (FIREBASE_SERVICE_ACCOUNT_FILE), or
// FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + a PEM key file (FIREBASE_PRIVATE_KEY_FILE).
function loadServiceAccount() {
  const keyFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyFile && fs.existsSync(keyFile)) return JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const pemFile = process.env.FIREBASE_PRIVATE_KEY_FILE;
  if (pemFile && fs.existsSync(pemFile) && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      // Accept keys stored with literal \n sequences as well as real newlines
      private_key: fs.readFileSync(pemFile, 'utf8').split(String.fromCharCode(92) + 'n').join(String.fromCharCode(10)),
    };
  }
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.split(String.fromCharCode(92) + 'n').join(String.fromCharCode(10)),
    };
  }
  console.error('Set FIREBASE_SERVICE_ACCOUNT_FILE (service-account JSON), or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY_FILE.');
  process.exit(1);
}
initializeApp({ credential: cert(loadServiceAccount()) });
const db = getFirestore();

const phoneKey = p => {
  const d = String(p ?? '').replace(/\D/g, '');
  return d.length < 10 ? '' : d.slice(-10);
};
function validPastDate(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  if (y < 1900) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return false;
  return dt.getTime() <= Date.now();
}
const loyaltyFor = s => (s >= 50000 ? 'Platinum' : s >= 20000 ? 'Gold' : s >= 5000 ? 'Silver' : 'Bronze');
const toDate = v => (v?.toDate ? v.toDate() : v ? new Date(v) : null);

// Bills live in `payments`; very early versions wrote to `billing` (legacy)
const [customersSnap, billsSnap, legacyBillsSnap] = await Promise.all([
  db.collection('customers').get(),
  db.collection('payments').get(),
  db.collection('billing').get(),
]);

// Paid bills grouped by customer id and by phone key
const billsByCustomer = new Map();
const billsByPhone = new Map();
for (const b of [...billsSnap.docs, ...legacyBillsSnap.docs].map(d => d.data())) {
  if ((b.status || 'paid') !== 'paid') continue;
  if (b.customerId) billsByCustomer.set(b.customerId, [...(billsByCustomer.get(b.customerId) || []), b]);
  const k = phoneKey(b.customerPhone);
  if (k) billsByPhone.set(k, [...(billsByPhone.get(k) || []), b]);
}

const report = { customers: customersSnap.size, missingPhoneKey: [], badPhone: [], invalidDob: [], invalidAnniversary: [], duplicateGroups: [], totalsMismatch: [] };
const byKey = new Map();
const updates = [];

for (const doc of customersSnap.docs) {
  const c = doc.data();
  if (c.isDeleted === true || c.status === 'deleted') continue;
  const key = phoneKey(c.phone);
  if (!key) report.badPhone.push(doc.id);
  else byKey.set(key, [...(byKey.get(key) || []), doc.id]);
  if (key && c.phoneKey !== key) report.missingPhoneKey.push(doc.id);
  if (c.dateOfBirth && !validPastDate(String(c.dateOfBirth))) report.invalidDob.push(doc.id);
  if (c.anniversary && !validPastDate(String(c.anniversary))) report.invalidAnniversary.push(doc.id);

  // De-duplicate bills matched by id and by phone
  const bills = new Set([...(billsByCustomer.get(doc.id) || []), ...(key ? billsByPhone.get(key) || [] : [])]);
  const spent = [...bills].reduce((s, b) => s + (Number(b.total) || 0), 0);
  const visits = bills.size;
  const last = [...bills].map(b => toDate(b.createdAt)).filter(Boolean).sort((a, b) => b - a)[0] || null;
  if ((Number(c.totalSpent) || 0) !== spent || (Number(c.totalVisits) || 0) !== visits) {
    report.totalsMismatch.push({ id: doc.id, stored: { visits: c.totalVisits || 0, spent: c.totalSpent || 0 }, fromBills: { visits, spent } });
  }

  const update = {};
  if (key && c.phoneKey !== key) update.phoneKey = key;
  if ((Number(c.totalSpent) || 0) !== spent) update.totalSpent = spent;
  if ((Number(c.totalVisits) || 0) !== visits) update.totalVisits = visits;
  if (c.loyaltyStatus !== loyaltyFor(spent)) update.loyaltyStatus = loyaltyFor(spent);
  if (last && toDate(c.lastVisit)?.getTime() !== last.getTime()) update.lastVisit = last;
  if (Object.keys(update).length) updates.push({ ref: doc.ref, update });
}
report.duplicateGroups = [...byKey.values()].filter(ids => ids.length > 1);

console.log(JSON.stringify({
  customers: report.customers,
  bills: { payments: billsSnap.size, legacyBilling: legacyBillsSnap.size },
  missingPhoneKey: report.missingPhoneKey.length,
  badPhone: report.badPhone,
  invalidDob: report.invalidDob,
  invalidAnniversary: report.invalidAnniversary,
  duplicateGroups: report.duplicateGroups,
  totalsMismatch: report.totalsMismatch,
  pendingUpdates: updates.length,
}, null, 2));

if (!APPLY) {
  console.log('\nReport only — nothing was changed. Re-run with --apply --i-have-a-backup to write the updates above.');
  process.exit(0);
}

for (let i = 0; i < updates.length; i += 400) {
  const batch = db.batch();
  for (const { ref, update } of updates.slice(i, i + 400)) {
    batch.update(ref, { ...update, updatedAt: FieldValue.serverTimestamp() });
  }
  await batch.commit();
}
console.log(`\nUpdated ${updates.length} customer records.`);
